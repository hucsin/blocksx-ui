
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
    private  recursiveChildrenFormatPadding(nodeId: string, level?: number) {
        // 获取当前节点的后代节点
        let target: any[] = this.miniFlow.getConnectorBySourceId(nodeId, true) ;
        let _level: any = level || 1;
        let result: any = {
            children: [],

            node: this.miniFlow.getNodeById(nodeId)
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
            let fistNotStartNode: any = this.miniFlow.getConnectorBySourceId(startNode.id)[0];

            if (fistNotStartNode) {
                this.recursiveChildrenFormatPadding(startNode.id);

                if (!flowMaps.connect[fistNotStartNode.target]) {
                    flowMaps.connect[fistNotStartNode.target] = {
                        index: index,
                        data: []
                    };
                }
                flowMaps.connect[fistNotStartNode.target].data.push(startNode.id)

            } else {
                flowMaps.default.push({
                    id: startNode.id,
                    index: index
                })
            }
        })
        return flowMaps;
    }
    private getMaxLevelNumber() {
        let maxNumber: number = 1;
        this.miniFlow.nodes.forEach(it => {
            let level: number = it.level;
            maxNumber = Math.max(level, maxNumber)
        })
        return maxNumber;
    }
    // 计算该画步的padding数据
    private computePaddingNumber(flowMaps: any) {
        let keys: any = Object.keys(flowMaps.connect);
        let paddingNumber: number = 0;
        keys.forEach(it => {
            let node: any = this.miniFlow.getNodeById(it);

            paddingNumber += Math.max(node.paddingNumber, flowMaps.connect[it].data.length);
        })

        return paddingNumber + flowMaps.default.length;
    }
    private repaintNodeSizeGroup(nodes: any, maxSize: number, offsetSize: number, paddingSize: number, parent?:any) {
        let length: number = nodes.length;
        let perSize: number = maxSize / length;
        let offset: number = 0;
        
        nodes.forEach((node: any, index: number) => {
            let itemMaxSize: number = node.paddingNumber * paddingSize;
            
            node.left = (node.level -1) * this.levelSize + this.miniFlow.temporaryRouterOffset;

            if (parent) {

                node.top = (parent.top + this.miniFlow.size/2  - maxSize / 2) + offset +  itemMaxSize /2 - this.miniFlow.size/2;
                offset += itemMaxSize;
            } else {
                node.top = offsetSize + index * perSize + perSize / 2 - this.miniFlow.size / 2
            }
        })
    }
    private getMaxPaddingByNodeList(nodeList: any) {
        let paddingNumber: number = 0;
        nodeList.forEach(it=> {
            paddingNumber+= it.paddingNumber
        })
        return paddingNumber;
    }
    private repaintNodeSizeByNodeId(nodeList: any, parent: any, maxSize: number, offsetSize: number, paddingSize: number) {
        let maxPadding: number = this.getMaxPaddingByNodeList(nodeList);
        let perSize: number = maxSize / maxPadding;
        let perOffsetSize: number = 0;
        
        this.repaintNodeSizeGroup(nodeList, maxSize, offsetSize, paddingSize, parent)

        nodeList.forEach((node:any, index: number) => {
            let perMaxSize: number = node.paddingNumber * perSize;
            let targetNodes: any = this.miniFlow.getConnectorBySourceId(node.id).map(it => this.miniFlow.getNodeById(it.target));
            
            if (targetNodes.length) {
                this.repaintNodeSizeByNodeId(targetNodes, node, perMaxSize, perOffsetSize , paddingSize);
                perOffsetSize += perMaxSize;
            }
        })
    }
    private repaintFlowByNickNodeId(flow:any, nickId: string, paddingSize: number) {
        let nickNode: any = this.miniFlow.getNodeById(nickId);
        let startNodes: any = flow.data.map(it => this.miniFlow.getNodeById(it));
        let maxPadding: number = Math.max(nickNode.paddingNumber, startNodes.length)
        let maxSize: number = maxPadding * paddingSize;
        // 先计算start节点
        this.repaintNodeSizeGroup(startNodes, maxSize, 0, paddingSize);
        // 填写当前节点
        this.repaintNodeSizeByNodeId([nickNode], nickNode, maxSize, 0, paddingSize);

    }
    private repaint(flowMaps:any, paddingSize: number) {
        let connect: any = flowMaps.connect;
        let defaultConnect: any = flowMaps.default;

        Object.keys(connect).sort((a,b) => {
            return connect[a].index > connect[b].index ? 1 : -1
        }).forEach(it => {
            let flow: any = connect[it];
            this.repaintFlowByNickNodeId(flow, it, paddingSize)
        })
    }

    public format() {
       let flowMaps: any = this.getFlowMaps();
       
       let paddingNumber: any = this.computePaddingNumber(flowMaps);
       let paddingSize: number =  Math.max((this.miniFlow.canvas.offsetHeight ) / paddingNumber, this.miniFlow.size + this.miniFlow.temporaryRouterOffset)
        console.log(222, paddingSize, (this.miniFlow.canvas.offsetHeight ) / paddingNumber, this.miniFlow.size)
       this.begingSize = 0;
       this.levelSize =  Math.max((this.miniFlow.canvas.offsetWidth - this.miniFlow.size / 2) / this.getMaxLevelNumber(), this.miniFlow.size * 1.5);
        
       this.repaint(flowMaps, paddingSize);
       this.miniFlow.doChangeSave();

       setTimeout(()=> {
            this.miniFlow.instance.repaintEverything();
       }, 0)
       
       
    }
}