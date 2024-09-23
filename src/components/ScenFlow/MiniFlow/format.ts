
export default class CanvasFormat {
    private miniFlow: any;
    private begingSize: number;
    private levelSize: number;
    public constructor (miniFlow: any) {
        this.miniFlow = miniFlow;
    }
    /**
     * 格式化画布
     */
    // 递归设置最大项
    private  recursiveChildrenFormatPadding(nodeName: string, level?: number) {
        // 获取当前节点的后代节点
        let target: any[] = this.miniFlow.getConnectorBySourceName(nodeName, true) ;
        let _level: any = level || 1;
        let result: any = {
            children: [],

            node: this.miniFlow.getNodeByName(nodeName)
        };
        
        let paddingNumber: number =  target.length ? 0: 1;       
        
        target.forEach(tg=> {
            let children: any = this.recursiveChildrenFormatPadding(tg.target, _level + 1);
            result.children.push(children);
            if (children.children.length > 0) {
               //paddingNumber = 0;
                children.children.forEach(it => {
                    paddingNumber += it.node.paddingNumber;
                })
            }  else {
                paddingNumber+= children.node.paddingNumber;
            }
            
        });

        Object.assign(result.node, {
            paddingNumber,
            level: _level,
            childrenNumber: target.length
        })

        return result 
    }
    private getFlowMaps() {
        let startNodes: any = this.miniFlow.getStartNodes();
        let flowMaps: any = {
            default: [],
            connect: {}
        }

        
        startNodes.forEach((startNode:any, index:number) => {
            let fistNotStartNode: any = this.miniFlow.getConnectorBySourceName(startNode.name)[0];

            if (fistNotStartNode) {
                this.recursiveChildrenFormatPadding(startNode.name);

                if (!flowMaps.connect[fistNotStartNode.target]) {
                    flowMaps.connect[fistNotStartNode.target] = {
                        index: index,
                        data: []
                    };
                }
                flowMaps.connect[fistNotStartNode.target].data.push(startNode.name)

            } else {
                flowMaps.default.push({
                    name: startNode.name,
                    index: index
                })
            }
        })
        return flowMaps;
    }
    private getMaxLevelNumber() {
        let maxNumber: number = 1;
        this.miniFlow.nodes.forEach(it => {
            let level: number = it.level || 2;
            maxNumber = Math.max(level, maxNumber)
        })
        return maxNumber;
    }
    // 计算该画步的padding数据
    private computePaddingNumber(flowMaps: any) {
        let keys: any = Object.keys(flowMaps.connect);
        let paddingNumber: number = 0;
        keys.forEach(it => {
            let node: any = this.miniFlow.getNodeByName(it);

            paddingNumber += Math.max(node.paddingNumber, flowMaps.connect[it].data.length);
        })

        return paddingNumber + flowMaps.default.length;
    }
    private repaintNodeSizeGroup(nodes: any, paddingSize: number, offsetPoint?:any) {
        
        let maxsing: number = paddingSize * offsetPoint.paddingNumber;
        let itemStart: number = offsetPoint.top - (maxsing / 2) ;//+ (paddingSize - this.miniFlow.size)/2;
        
        nodes.forEach((node: any, index: number) => {
            
            let itemMaxSize: number = (node.type == 'go' ? 1 : node.paddingNumber )* paddingSize;
            
            node.left = (node.level -1) * this.levelSize + this.miniFlow.temporaryRouterOffset;
            node.top = itemStart + itemMaxSize/2 ;
            itemStart += itemMaxSize;
        })
    }
    private getMaxPaddingByNodeList(nodeList: any) {
        let paddingNumber: number = 0;
        nodeList.forEach(it=> {
            paddingNumber+= it.paddingNumber
        })
        return paddingNumber;
    }
    private repaintNodeSizeByNodeName(nodeList: any, parent: any, maxSize: number, paddingSize: number, noself?: boolean) {
        let maxPadding: number = this.getMaxPaddingByNodeList(nodeList);
        let perSize: number = maxSize / maxPadding;
        // 计算本身
        !noself && this.repaintNodeSizeGroup(nodeList, paddingSize, parent)

        nodeList.forEach((node:any, index: number) => {
            let perMaxSize: number = node.paddingNumber * perSize;
            let targetNodes: any = this.miniFlow.getConnectorBySourceName(node.name).map(it => this.miniFlow.getNodeByName(it.target));
            
            if (targetNodes.length) {
                this.repaintNodeSizeByNodeName(targetNodes, node, perMaxSize , paddingSize);
                //perOffsetSize += perMaxSize;
            }
        })
    }
    private repaintFlowByNickNodeName(flow:any, nick: any, paddingSize: number) {
        let nickNode: any = typeof nick == 'string' ? this.miniFlow.getNodeByName(nick) : nick;
        let startNodes: any = flow.data.map(it => this.miniFlow.getNodeByName(it));
        let maxPadding: number = Math.max(nickNode.paddingNumber, startNodes.length)
        let maxSize: number = maxPadding * paddingSize;
        
        // 先计算start节点
        
        this.repaintNodeSizeGroup(startNodes,  paddingSize, {
            ...nickNode,
            paddingNumber: startNodes.length 
        });
        // 填写当前节点
        this.repaintNodeSizeByNodeName([nickNode], nickNode, maxSize, paddingSize, true);
        

    }
    private repaint(flowMaps:any, paddingSize: number) {
        let connect: any = flowMaps.connect;

        Object.keys(connect).sort((a,b) => {
            return connect[a].index > connect[b].index ? 1 : -1
        }).forEach(it => {
            let flow: any = connect[it];
            let node: any = this.miniFlow.getNodeByName(it);
            let cansize: any = Math.max(node.paddingNumber, flow.data.length) * paddingSize;
            
            node.top = this.begingSize + cansize / 2;
            node.left = this.levelSize + this.miniFlow.temporaryRouterOffset;
            

            this.repaintFlowByNickNodeName(flow, node, paddingSize)
            this.begingSize += cansize // + this.miniFlow.size;
        })
    }
    private getObtainBoundaries()  {
        let bound: any = {
            left: 1e10,
            right: 0,
            top: 1e10,
            bottom: 0
        }

        this.miniFlow.nodes.forEach(node => {

            if (node.left < bound.left) {
                bound.left = node.left
            }
            if (node.left > bound.right) {
                bound.right = node.left;
            }
            if (node.top < bound.top) {
                bound.top = node.top;
            }
            if (node.top > bound.bottom) {
                bound.bottom = node.top
            }
        })

        return {
            ...bound,
            width: bound.right - bound.left + this.miniFlow.size,
            height: bound.bottom - bound.top + this.miniFlow.size
        };
    }

    private needReset() {
        return this.miniFlow.nodes.length == 0
    }

    public reset() {
        this.miniFlow.cavnasDraggable.setZoom(1);
        this.miniFlow.cavnasDraggable.setPosition({
            left: 0,
            top: 0
        })
    }
    /**
     * 缩放适配
     */
    public zoomFit() {
        if (this.needReset()) {

            this.reset();

        } else {
            let bound: any = this.getObtainBoundaries();
            let wrapperHeight: number = this.miniFlow.cavnasWrapper.offsetHeight;
            let wrapperWidth: number = this.miniFlow.cavnasWrapper.offsetWidth;
            
            let isWidthMax: boolean = bound.width / bound.height > wrapperWidth / wrapperHeight;
            let scale: number = this.miniFlow.cavnasDraggable.getSafeZoom( isWidthMax /*宽度大,*/
                        ? wrapperWidth / bound.width : wrapperHeight / bound.height);
                        

            //scale =4;
            // 缩放画布中心点位移
            let canvasCenterLeftOffset: number = bound.left + bound.width / 2;
            let canvasCenterTopOffset: number = bound.top + bound.height / 2;

            let canvasOffsetLeft: number = (wrapperWidth / 2 - canvasCenterLeftOffset ) * scale;
            let canvasOffsetTop: number = (wrapperHeight /2 - canvasCenterTopOffset ) * scale;

            this.miniFlow.cavnasDraggable.setZoom(scale);
            this.miniFlow.cavnasDraggable.setPosition({
                left: canvasOffsetLeft,
                top: canvasOffsetTop
            })
        }
        
    }


    public format(noRepatin?: boolean, noZoom?: boolean) {

        if (this.needReset()) {

            this.reset();
        } else {
            let flowMaps: any = this.getFlowMaps();
       
            let paddingNumber: any = this.computePaddingNumber(flowMaps);
            let paddingSize: number =  Math.max((this.miniFlow.canvas.offsetHeight ) / paddingNumber, this.miniFlow.size + this.miniFlow.temporaryRouterOffset )
            
            this.begingSize = 0;
            this.levelSize =  Math.min(Math.max((this.miniFlow.canvas.offsetWidth - this.miniFlow.size / 2) / this.getMaxLevelNumber(), this.miniFlow.size * 2), this.miniFlow.size + this.miniFlow.zoomSize * this.miniFlow.temporaryRouterOffset);
            
            this.repaint(flowMaps, paddingSize);
            !noZoom && this.zoomFit();
            
            this.miniFlow.doChangeSave();

            setTimeout(()=> {
                !noRepatin && this.miniFlow.instance.repaintEverything();
                
            }, 0)
        }
       
    }
}