import { EventEmitter } from 'events';
import { utils } from '@blocksx/core';
import { addClass, removeClass } from '../../utils/dom';
import { addEvent } from '../../utils/dom'
import Chinampa from './chinampa';
import DraggableCanvas from './draggable';
import FormatCanvas from './format';
/**
 * 一个极简交互的流程图绘制工具
 */

import JSPlumbTool from '../../utils/third-party/jsplumb';

export type FLowNodeType = 'go' | 'router' | 'module' | 'control' | 'empty';


interface ConnectorMap {
    source: string;
    target: string;
    isLock?: boolean;
    isTemporary?: boolean;
}

interface FlowNodeMap {
    id: string;
    type: FLowNodeType;
    left: number,
    top: number,
    color: string;
    node?: HTMLElement;
    isTemporary?: boolean
}



export interface MiniFlowMap {
    canvas: HTMLElement | string; // 画布节点
    
    destoryChinampaPanel: HTMLElement;
    unlinkChinampaPanel: HTMLElement;
    chinampaPanel: HTMLElement;

    templateMap: any;

    nodes: FlowNodeMap[];
    connector: ConnectorMap[];
    
    size?: number;
}

export default class MiniFlow extends EventEmitter {
    private defaultAnchors: any = [
        ["Perimeter", { shape: 'Circle', rotation: '' }],
        ["Perimeter", { shape: 'Circle', rotation: '' }]
    ];
    private magnet: any = {
        safeDistance: 100, // 安全距离, 右边方向
        safeAngle: 45, // 安全角度, 右边方向
        safeMinDiamond: 30,
        safeMaxDiamond: 200        
    };
    private temporaryRouterOffset: number;
    private canvas: any ;
    private canvasPosition: any;
    private canvasZoom: number;

    private templateMap: any;

    private nodes: FlowNodeMap[];
    private connector: ConnectorMap[];
    private connectorMap: any;
    private nodeMap: any;
    private dragFreeNode?: boolean;
    
    private dragNodeId: string;
    private dragNode: any;
    private dragTarget: any; // 拖动时候的目标
    private draggingFlag: any;

    private size: number; 
    private safeStartAngle:number;
    private safeEndAngle: number;

    private instance: any;

    private canvasFormat: FormatCanvas;

    public constructor(props: MiniFlowMap) {
        super();
        this.canvas = document.getElementById(props.canvas as string);
        
        new Chinampa(this, props.chinampaPanel, 
            props.destoryChinampaPanel, 
            props.unlinkChinampaPanel
        );

        this.nodes = props.nodes;
        this.connector = props.connector;
        this.templateMap = props.templateMap || {};

        this.canvasZoom = 1;
        this.canvasPosition = {left: 0,top: 0};
        this.connectorMap = {};
        this.nodeMap = {};
        this.size = (props.size || 138);
        this.temporaryRouterOffset =  40;
        

        this.safeStartAngle = (180 - this.magnet.safeAngle/2) * (Math.PI/180);
        this.safeEndAngle = (180 + this.magnet.safeAngle/2) * (Math.PI/180);

        this.instance = JSPlumbTool.jsPlumb.getInstance({
            // drag options
            DragOptions: { cursor: "pointer", zIndex: 2000 },
            // default to a gradient stroke from blue to green.

            Container: this.canvas,
            anchors: this.defaultAnchors,
        });

        this.canvasFormat = new FormatCanvas(this);
        new DraggableCanvas(this);

        this.bindEvent();
        this.instance.batch(() => {

            this.resetFlowNode();
            this.resetConnector();
        })
    }

    public getZoom() {
        return this.canvasZoom;
    }
    public setZoom(zoom: number) {
        this.canvasZoom = zoom;
        this.instance.setZoom(zoom)
    }

    public setPosition(position: any) {
        this.canvasPosition = position;
    }
    public getPosition() {
        return this.canvasPosition;
    }
    private getSize(half?: boolean) {
        let size: number = this.size * this.getZoom();
        return half  ? size / 2 : size;
    }
    private doChangeSave() {
        // 触发事件
        this.emit('onChange', {
            nodes: this.nodes,
            connector: this.connector
        })
    }

    private isFreeNode(id: string) {

        return !this.connector.find(it => (it.target == id))
    }
    private getConnectorBySourceId(sourceId:string, ignore?: boolean) {
        return this.connector.filter(it => (it.source == sourceId ) && (ignore || !it.isTemporary))
    }
    private getSourceTargetListConnectorByNodeId(sourceId: string) {
        let source: any = this.getConnectorBySourceId(sourceId);
        return source.map(it => it.target);
    }
    // 获取开始节点
    private getStartNodes() {

        return this.nodes.filter(node => this.getConnectorBySourceId(node.id, true).length && !this.getConnectorByTargetId(node.id).length )
    }
    private getConnectorByTargetId(targetId:string) {
        return this.connector.filter(it => (it.target == targetId) && !it.isTemporary)
    }
    private getConnectorIdsByNodeId(nodeId: string) {
        return this.connector.filter(it => it.target == nodeId || it.source == nodeId);
    }
    private getNodeById(id: string): any {
        return this.nodes.find(it => it.id == id)
    }
    // 判断该节点是否有路由节点连线
    private findRouterConnectorByNodeId(nodeId: string) {
        return this.connector.filter(conn => {
            let node: any = this.getNodeById(conn.target);
            return conn.source == nodeId && (node.type == 'router' && !conn.isTemporary)
        })
    }

    private updateNodeById(id: string, node: any) {
        let onode: any = this.nodeMap[id];
        if (onode) {
            Object.assign(onode, node)
        }
        
        return this.nodeMap[id] = onode;
    }
    // 获取子孙节点
    private getDescendantNode(nodeId: string, filter?: Function) {
        let children: any[] = [];
        let target: any[] = this.getConnectorBySourceId(nodeId, true) ;
        
        if (target) {
            target.forEach(it => {
                
                if (it.target !== this.dragNodeId) {
                    let targetNode: any = this.getNodeById(it.target);
                    filter && filter(targetNode);
                    children.push(targetNode);
                }
                children = children.concat(this.getDescendantNode(it.target, filter))
            })
        }

        return children;
    }
    private getConnectorId(source: string, target: string) {
        return [source, target].join('_');
    }
    private hasConnectorBySourceTarget(source:string, target: string) {
        return this.connector.find(it => (it.source == source) && (it.target == target))
    }
    private addConnectorBySourceTarget (source: string, target: string, isTemporary?: boolean) {
        if( !this.hasConnectorBySourceTarget(source, target)) {
            
            this.connector.push({
                source,
                target,
                isTemporary: isTemporary
            })
            this.addConnectorNodeBySourceTarget(source, target, isTemporary)
        }
    }
    private addNode(node: any, nosave?:boolean) {
        this.nodes.push(node);
        !nosave && this.doChangeSave();
    }
    private removeNodeById(nodeId:string) {
        this.nodes = this.nodes.filter(node => node.id != nodeId);
    }
    private removeTemporaryRouterNodeById(nodeId: string) {
        this.removeNodeById(nodeId);
        this.doChangeSave();
    }
    private getLinePointByTargetSource(sourceLeft: any, sourceTop: any, targetLeft: any, targetTop: any, limit?: number) {

         // 计算A点到B点的向量
        const ABVectorX = targetLeft - sourceLeft;
        const ABVectorY = targetTop - sourceTop;

        // 计算A点到C点的单位向量
        const ACUnitVectorX = ABVectorX / Math.sqrt(ABVectorX * ABVectorX + ABVectorY * ABVectorY);
        const ACUnitVectorY = ABVectorY / Math.sqrt(ABVectorX * ABVectorX + ABVectorY * ABVectorY);
        let temporayLimit = limit || (this.size + this.temporaryRouterOffset);
        // 计算C点的坐标
        const CPointX = sourceLeft + ACUnitVectorX * temporayLimit;
        const CPointY = sourceTop + ACUnitVectorY * temporayLimit;
        
        return {
            left: CPointX,
            top: CPointY
        }
    }
    /**
     * 添加临时的router节点
     * @param isTemporary 
     */
    private addTemporaryRouterNode(nodeId) {
        
        let routerNodeId: string = utils.uniq('router');
        let sourceNode: any = this.getNodeById(nodeId);
        let targetsNode: any = this.getConnectorBySourceId(nodeId)[0];
        let targetNode: any = this.getNodeById(targetsNode.target);
        let linePoint: any = this.getLinePointByTargetSource(sourceNode.left, sourceNode.top, targetNode.left, targetNode.top)

        let tempRouterNode: any = Object.assign({
            id: routerNodeId,
            isTemporary:true,
            left: linePoint.left,
            top: linePoint.top
        }, this.templateMap.router || {})

        this.addNode(tempRouterNode);
        // TODO 批量递归增加位移
        
        setTimeout(()=>{
            this.resetFlowNode(tempRouterNode)
        }, 0)

        return routerNodeId;
    }


    private lockConnectorBySourceTarget(source:string, target: string) {
        this.connector.find(it => {
            if (it.source == source && it.target == target) {
                it.isLock = true;
                return true;
            }
        });
        this.removeConnectorNodeBySourceTarget(source, target)
    }
    private unlockConnectorBySourceTarget(source: string, target: string) {
        this.connector.find(it => {
            if (it.source == source && it.target == target) {
                it.isLock = false;
                return true;
            }
        });
        
        this.addConnectorNodeBySourceTarget(source, target)
    }
    private removeConnectorBySourceTarget(source, target) {
        this.connector = this.connector.filter(it => !(it.source == source && it.target == target))
    }
    private removeConnectorByNodeId(nodeId:string) {
        this.connector = this.connector.filter(it => !(it.source == nodeId || it.target == nodeId))
    }
    private removeLockConnector() {
        this.connector = this.connector.filter(it => {
            if (it.isLock) {
                // 删除map
                this.removeConnectorNodeBySourceTarget(it.source, it.target);
                return false;
            }
            return true;
        })
    }
    private batchRemoveConnectorByNodeId(nodeId: string, targetIds: any[]) {
        this.connector = this.connector.filter(conn => !(conn.source==nodeId && targetIds.indexOf(conn.target) > -1));
    }
    private removeTemporaryConnector() {
        this.connector = this.connector.filter(it => {
            if (it.isTemporary) {
                // 删除map
                this.removeConnectorNodeBySourceTarget(it.source, it.target);
                return false;
            }
            return true;
        })
    }


    private getSafeDistanceSwwitchNode(activate: any, holder: any, halfSize: number, safeDistance: number,pointX: number, pointY: number) {
        
        let node: any  = holder.type == 'append' 
            ? this.getNodeById(this.dragTarget.tempRouterId) : holder.node;
      
        let holderCenterX: number = node.left + halfSize;
        let holderCenterY: number = node.top + halfSize;
        let holderDistance: number = Math.sqrt(Math.pow(pointX - holderCenterX, 2) + Math.pow(pointY - holderCenterY, 2));

        if (holderDistance< safeDistance * 2.5) {
            activate.push(holder)
        }
    }
    /**
     * 获取在安全距离内节点
     * @param id 
     * @param node 
     */
    private getSafeDistanceNodes(pos: number[]) {
        let halfSize: number = this.getSize(true);
        let pointX: number = pos[0] + halfSize;
        let safeDistance: number = this.magnet.safeDistance;
        let pointY:number = pos[1] + halfSize;
        let activate:any = [];
        // 如果存在拖动对象
        if (this.dragTarget) {
            let { holder } = this.dragTarget;
            if (holder.node) {
                this.getSafeDistanceSwwitchNode(activate, holder, halfSize, safeDistance,pointX, pointY)
            }
        }
        
        activate.length == 0 && this.nodes.forEach(it => {

            if (it.id == this.dragNodeId || it.isTemporary) {
                return;
            }

            let centerX: number = it.left + halfSize;
            let centerY: number = it.top + halfSize;
            let distance: number = Math.sqrt(Math.pow(pointX - centerX, 2) + Math.pow(pointY - centerY, 2));
            
            let sourceTargets: any = this.getConnectorBySourceId(it.id);
            // router  节点判断安全距离均为添加新节点
            if (it.type =='router') {
                if (distance < safeDistance ) {
                    activate.push({type: 'connector', distance, node: it})
                }
            } else {
                // 在圆里面, 强制添加
                if (distance < halfSize) {
                    activate.push({type: sourceTargets.length ? 'append' : 'connector', distance, node: it});

                // 在角度里面
                } else {
                    let angle: number = Math.PI - Math.atan2(pointY - centerY, pointX - centerX);
                    
                    // 如果没有source节点就增加响应区范围
                    if (sourceTargets.length == 0) {
                        safeDistance += (this.getSize() );
                    }

                    if ( distance < safeDistance 
                            && angle >= this.safeStartAngle 
                            && angle <= this.safeEndAngle ) {
                        
                        activate.push({type: sourceTargets.length == 0 ? 'connector' : 'append', distance, node: it})
                    }
                }
            }
            
        })

        return activate.sort((a, b) => {
            return a.distance > b.distance ? 1 : -1
        }).filter(it => it.id != this.dragNodeId);
    }
    private getDiamondDistance(targetId: string) {
        let sourceConnectors =  this.getConnectorBySourceId(targetId);
        return Math.max(this.magnet.safeMinDiamond,  this.magnet.safeMaxDiamond / (sourceConnectors.length))
    }
    /**
     * 如果已知菱形的两个对角顶点 A (x_a, y_a) 和 C (x_c, y_c)，以及对角
     * 顶点 B 到 D 的距离（假设为 d_bd），求对角顶点 B 和 D 的坐标
     * 
     */
    private getSafeDiamondDiagonalCoordinates(sourceId: string, targetId: string) {

        let halfSize: number = this.getSize(true);
        let sourcePoint: any = this.nodeMap[sourceId];
        let targetPoint: any = this.nodeMap[targetId];
        let distance_bd: number = this.getDiamondDistance(sourceId);

        let x_a: number = sourcePoint.left + halfSize;
        let y_a: number = sourcePoint.top + halfSize;
        let x_c: number = targetPoint.left + halfSize;
        let y_c: number = targetPoint.top + halfSize;


        // 计算菱形中心点的坐标
        const x_center = (x_a + x_c) / 2;
        const y_center = (y_a + y_c) / 2;

        // 计算向量 AC
        const vector_AC = [x_c - x_a, y_c - y_a];

        // 计算向量 BD，注意方向是与 AC 垂直的
        const vector_BD = [-vector_AC[1], vector_AC[0]];

        // 计算向量 BD 的单位向量
        const length_BD = Math.sqrt(vector_BD[0] ** 2 + vector_BD[1] ** 2);
        const unit_vector_BD = [vector_BD[0] / length_BD, vector_BD[1] / length_BD];

        
        return {
            pointA: {
                x: x_a,
                y: y_a
            },
            pointC: {
                x: x_c,
                y: y_c
            },
            pointB: {
                x: x_center + (distance_bd / 2) * unit_vector_BD[0],
                y: y_center + (distance_bd / 2) * unit_vector_BD[1]
            },
            pointD: {
                x: x_center - (distance_bd / 2) * unit_vector_BD[0],
                y: y_center - (distance_bd / 2) * unit_vector_BD[1]
            }
        }
    }
    private isPointInsideDiamond(a:any, b: any, c: any, d: any, p: any) {
        // 计算菱形的四个边
        const sideAB = { x: b.x - a.x, y: b.y - a.y };
        const sideBC = { x: c.x - b.x, y: c.y - b.y };
        const sideCD = { x: d.x - c.x, y: d.y - c.y };
        const sideDA = { x: a.x - d.x, y: a.y - d.y };

        // 计算点p到菱形的四个顶点的向量
        const vectorAP = { x: p.x - a.x, y: p.y - a.y };
        const vectorBP = { x: p.x - b.x, y: p.y - b.y };
        const vectorCP = { x: p.x - c.x, y: p.y - c.y };
        const vectorDP = { x: p.x - d.x, y: p.y - d.y };

        // 计算点p到菱形中心的向量
        const vectorToCenter = { x: (a.x + c.x) / 2 - a.x, y: (a.y + c.y) / 2 - a.y };

        // 判断点p是否在菱形内部
        const crossProductAB = (vectorAP.x * sideAB.y - vectorAP.y * sideAB.x);
        const crossProductBC = (vectorBP.x * sideBC.y - vectorBP.y * sideBC.x);
        const crossProductCD = (vectorCP.x * sideCD.y - vectorCP.y * sideCD.x);
        const crossProductDA = (vectorDP.x * sideDA.y - vectorDP.y * sideDA.x);

        return (crossProductAB >= 0 && crossProductBC >= 0 && crossProductCD >= 0 && crossProductDA >= 0) ||
                (crossProductAB <= 0 && crossProductBC <= 0 && crossProductCD <= 0 && crossProductDA <= 0);
    }
    private judgePointinDiamond(pos: number[], sourceId: string, targetId: string) {
        const place: any = this.getSafeDiamondDiagonalCoordinates(sourceId, targetId);
        return this.isPointInsideDiamond(place.pointA, place.pointB, place.pointC, place.pointD, { x: pos[0] + this.getSize(true), y: pos[1] + this.getSize(true)})
    }

    private getSafeDiamondConnectors(pos: number[]) {
        let diamondConnector: any = [];
        // 遍历所有的连线
        this.connector.forEach(it => {  
            /**
             * 1、这里可能会忽略新建立的链接,然后从新建立的情况
             * 2、忽略temp节点的情况
             */          
            if (!it.isTemporary) {
                if ((it.source != this.dragNodeId) && (it.target != this.dragNodeId)) {
                    if (this.judgePointinDiamond(pos, it.source, it.target)) {
                        diamondConnector.push({
                            type: 'relink',
                            connector: it
                        })
                    }
                }
            }
        })

        return diamondConnector;
    }

    private getPlaceholder(pos: number[]) {
        let activateNode: any = this.getSafeDistanceNodes(pos);

        if (!activateNode.length) {
            //activateNode = 
            activateNode = this.getSafeDiamondConnectors(pos)
            // 计算线剪切
        } 
        return activateNode[0];
    }


    private bindEvent() {
        this.instance.bind('connection', (e) => {
            this.connectorMap[this.getConnectorId(e.sourceId, e.targetId)] = e.connection;
        })
        // 绑定事件
        addEvent(this.canvas.parentNode, 'dblclick', (e) => {
            
            this.addNewNodeByPosition(e.pageX, e.pageY)
        })
    }
    /**
     * 删除节点
     * @param source 
     * @param target 
     */
    private removeConnectorNodeBySourceTarget(source: string, target: string) {
        let sourceTargetId: string = this.getConnectorId(source, target);

        if (this.connectorMap[sourceTargetId]) {
            this.instance.deleteConnection(this.connectorMap[sourceTargetId]);
            this.connectorMap[sourceTargetId] = null;
        }
    }
    /**
     * 添加节点
     * @param source 
     * @param target 
     * @param isTemporary 
     */
    private addConnectorNodeBySourceTarget(source:string, target: string, isTemporary?: boolean) {
        let sourceNode: FlowNodeMap = this.getNodeById(source);
        let targetNode: FlowNodeMap = this.getNodeById(target);
        
        let sourceColor: string = isTemporary ? '#e2e2e2' : sourceNode.color;
        let targetColor: string = isTemporary ? '#e2e2e2' : targetNode.color; 

        this.instance.connect({
            source: source,
            target: target,

            //endpoints:["Rectangle", 'Rectangle'],
            endpointStyles: [{ fill: sourceColor }, { fill: targetColor }],
            deleteEndpointsOnDetach:false,
            connectionsDetachable:false,
            connector: ['Straight'],
            paintStyle: {
                gradient: {
                    stops: [
                        [0, sourceColor],
                        [0.8, targetColor]
                    ]
                },
                "dashstyle": "1 1",
                fillStyle: targetColor, 
                stroke: targetColor,
                strokeWidth: 10,
                
            },
            overlays:[
                ["Custom", {
                    create:function(component) {
                    let custom: any = document.createElement('div');
                    custom.className = 'scenflow-overlays-arrow';
                    return custom;
                    },
                    location:0,
                    id:"customOverlay"
                }]
            ]
        })
    }
    /**
     * 建立绑定关系
     */
    private resetConnector() {
        this.connector.forEach(it => {
            
            this.addConnectorNodeBySourceTarget(it.source, it.target)
        })
    }
    // 实时计算位置

    private whetherInsertNode(placeholder: any) {
        //如果拖动的是开始节点
        let { node = {} } = placeholder;
        if (node.id == this.dragNodeId) {
            return false;
        }
        if (this.dragNode.type == 'go') {
        
            if (node.type =='go' || (node.type =='router')) {
                return true;
            }
            return false;
        } 

        return true;
    }
    private isNodePlaceholder(placeholder: any) {
        return placeholder ? 'relink' != placeholder.type : false;
    }
    private fixedPlaceholder(placeholder: any) {
        if (this.isNodePlaceholder(placeholder)) {
            
            let { node } =  placeholder;
            let dragGo: boolean = this.dragNode.type == 'go';
            // 如果是开始节点,修改下逻辑
            // 判断当前开始节点是否有一个节点链接到router节点
            if (node.type == 'go') {
                let router: any = this.findRouterConnectorByNodeId(node.id);
                // 有路由
                if ( router.length ) {
                    // 和路由建立链接
                    return {
                        type: 'connector',
                        switchEndpoint: dragGo , // 
                        node: this.getNodeById(router[0].target)
                    }
                } else {
                    // 没有路由 如果是没有节点就直接链接新节点
                    // 获取节点
                    let sourceNodes: any = this.getConnectorBySourceId(node.id);
                    if (sourceNodes.length) {
                        placeholder.type = 'append';
                    } else {
                        return  {
                            type: 'connector',
                            switchEndpoint: dragGo , // 
                            node: node
                        };
                    }
                }
            } else if (node.type == 'router') {
                placeholder.switchEndpoint = dragGo;
            }
        }
        return placeholder;
    }
    /**
     * 拖动计算
     * @param pos 
     */
    private dragging(pos: number[]) {
        let placeholder: any = this.fixedPlaceholder(this.getPlaceholder(pos));
        
        if ( placeholder && this.whetherInsertNode(placeholder)) {

            let holderId: string = this.getPlaceholderId(placeholder)

            // 第一次
            if ( !this.dragTarget) {
                this.dragTarget = {
                    holderId: holderId,
                    holder: placeholder
                }
                this.linkPlaceholder(this.dragTarget, true);
                
            // 第二次
            } else {
                if (this.dragTarget.holderId != holderId) {
                    
                    this.unlinkPlaceholder(this.dragTarget);
                    this.linkPlaceholder(this.dragTarget = {
                        holderId: holderId,
                        holder: placeholder
                    }, true);
                }
                
            }
        } else {
            if (this.dragTarget) {
                
                this.unlinkPlaceholder(this.dragTarget)
                this.dragTarget = null;
            }
        }
    }
    private getPlaceholderId(placeholder: any) {
        let uid: any[] = [placeholder.type];        

        uid.push(placeholder.connector 
            ? [placeholder.connector.source, placeholder.connector.target].join('.') 
            : placeholder.node.id);

        return uid.join('.')
    }
    private batchLockConnectorByNodeId(nodeId: string,targetNodes: string[]) {
        targetNodes && targetNodes.forEach(target => {
            this.lockConnectorBySourceTarget(nodeId, target)
        })
    }
    private batchAddConnectorByNodeId(nodeId: string, targetNodes: string[], isTemporary?:boolean) {
        // 建立目标节点到临时路由节点的链接
        targetNodes && targetNodes.forEach(target => {
            this.addConnectorBySourceTarget(nodeId, target, isTemporary)
        })
    }
    private batchUnlockConnectorBySourceTarget(nodeId: string, targetNodes: string[]) {
        targetNodes.forEach(target => {
            this.unlockConnectorBySourceTarget(nodeId, target)
        })

    }
    private doBatchAnimate(nodes: any[]) {
        nodes && nodes.forEach(node=> {
            this.instance.animate(document.getElementById(node.id), {
                left: node.left
            }, {
                duration: 200,
                easing: 'easeOutBack'
            })
        })
    }
    private batchDescendantNodeForward(nodeId: string) {

        let descendantNodes: any = this.getDescendantNode(nodeId, (node) => {
            //node.originalLeft = node.left;
            //node.originalTop = node.top;
            // 计算下两个点的距离

            node.left = node.originalLeft;
            node.top = node.originalTop;
        })
        this.doBatchAnimate(descendantNodes);
    }

    /**
     * 节点后移函数
     * @param dragTarget 
     * @param isTemporary 
     */
    private batchDescendantNodeBackward(nodeId: string, sourceId: string, isTemporary?: boolean) {

        let offset: any = { left: 0, top: 0 };
        let sourceNode: any = this.getNodeById(sourceId);
        let connector: any = this.getConnectorBySourceId(nodeId, true)[0] || {} ;
        let targetNode: any = this.getNodeById(connector.target);
        
        if (targetNode) {
            let distance: number = Math.sqrt(Math.pow(targetNode.left - sourceNode.left, 2) + Math.pow(targetNode.top - sourceNode.top, 2));;
            let minSize: number = this.temporaryRouterOffset * 2 + 2 * this.size ;
            if (distance < minSize) {
                offset = this.getLinePointByTargetSource(sourceNode.left, sourceNode.top, targetNode.left, targetNode.top, minSize );
                offset.left = offset.left - targetNode.left ;
                offset.top = offset.top  - targetNode.top 
            }
        }

        let descendantNodes: any = this.getDescendantNode(nodeId, isTemporary ? (node) => {
            node.originalLeft = node.left;
            node.originalTop = node.top;
            // 判断下位置
            node.left += offset.left;
            node.top += offset.top
        } : undefined)
        
        this.doBatchAnimate(descendantNodes);
    }

    // 建立临时链接
    private linkPlaceholder(dragTarget: any, isTemporary?:boolean, cb?: Function) {
        
        let { holder } = dragTarget;
        
        if (holder) {
            
            switch(holder.type) {
                // 在节点后面增加router节点
                case 'append':
                    let dragNodeId: string = this.dragNodeId;
                    // 新增临时router节点
                    let tempRouterId: string = dragTarget.tempRouterId 
                            ? dragTarget.tempRouterId  : dragTarget.tempRouterId = this.addTemporaryRouterNode(holder.node.id)
                    let targetNodes: any = dragTarget.targetNodes 
                            ? dragTarget.targetNodes : dragTarget.targetNodes = this.getSourceTargetListConnectorByNodeId(holder.node.id);
                    
                    // 获取目标节点的路径节点
                    // 批量lock掉所有的原始节点
                    setTimeout(() => {
                        
                        // 建立目标节点到临时router节点的链接
                        this.addConnectorBySourceTarget(holder.node.id, tempRouterId, isTemporary);
                        // 批量建立所有的临时节点
                        this.batchAddConnectorByNodeId(tempRouterId, targetNodes, isTemporary);
                        this.addConnectorBySourceTarget(tempRouterId, dragNodeId, isTemporary);
                        
                        // 节点后移动化
                        this.batchDescendantNodeBackward(tempRouterId, holder.node.id, isTemporary);
                        
                        isTemporary 
                            ? this.batchLockConnectorByNodeId(holder.node.id, targetNodes)
                            : this.batchRemoveConnectorByNodeId(holder.node.id, targetNodes);
                        
                        cb && cb();
                    }, 0);
                    break;
                case 'connector':
                    // 建立一个临时链接
                    if (holder.switchEndpoint) {
                        this.addConnectorBySourceTarget(this.dragNodeId, holder.node.id, isTemporary)
                    } else {
                        this.addConnectorBySourceTarget(holder.node.id, this.dragNodeId, isTemporary)
                    }
                    cb && cb();
                    break;
                case 'relink':
                    // 如果是建立临时节点
                    //1、lock 原始链接
                    isTemporary && this.lockConnectorBySourceTarget(holder.connector.source, holder.connector.target)
                    //2、 建立新的临时节点
                    this.addConnectorBySourceTarget(holder.connector.source, this.dragNodeId, isTemporary);
                    this.addConnectorBySourceTarget(this.dragNodeId, holder.connector.target, isTemporary);
                    cb && cb();
                    break;
            }
        }

    }
    private unlinkPlaceholder(dragTarget: any) {

        let { holder } = dragTarget;
        if (holder) {
            // 清楚所有的临时
            this.removeTemporaryConnector();

            if (holder.type != 'connector') {
                if (holder.type == 'relink') {
                    this.unlockConnectorBySourceTarget(holder.connector.source, holder.connector.target)
                } else {
                    this.batchUnlockConnectorBySourceTarget(holder.node.id, dragTarget.targetNodes)
                    this.removeTemporaryRouterNodeById(dragTarget.tempRouterId);
                    this.batchDescendantNodeForward(holder.node.id)
                }
            }

        }
    }
    private reflushDragNode() {
        if (this.dragFreeNode = this.isFreeNode(this.dragNodeId)) {
            this.dragNode = this.getNodeById(this.dragNodeId)
        } else {
            this.dragNode = null;
        }
        
        this.dragTarget =  null;
        this.draggingFlag = false;
    }
    private resetFlowNode(node?: any) {
        if (node) {
            let nodeId: any = node.id;
            if (!this.nodeMap[nodeId]) {
                this.instance.draggable(nodeId, {
                    // filter: '.scenflow-node'
                    drag: (e) => {
                        this.updateNodeById(e.el.id, {
                            left: e.pos[0],
                            top: e.pos[1]
                        });
                        // 开始拖动
                        this.emit(!this.draggingFlag ? 'onDragStart' : 'onDragging', {
                            left: e.pos[0],
                            top: e.pos[1],
                            event: e.e
                        })

                        if (this.dragFreeNode) {
                            this.dragging(e.pos);
                        }
                        this.draggingFlag = true;
                    },
                    start: () => {
                        this.dragNodeId = nodeId;
                        this.reflushDragNode();
                    },
                    stop: (e) => {
                        this.emit('onDragEnd');
                        this.draggingFlag = false;
                        if (this.dragFreeNode) {
                            if (this.dragTarget) {
                                this.removeTemporaryConnector();
                                //this.removeLockConnector();
                                this.linkPlaceholder(this.dragTarget, false, () => {
                                    this.doChangeSave()
                                });
                                return this.dragTarget = null;
                            } 
                            this.dragFreeNode = false;
                            this.dragNodeId = '';
                            this.dragNode = null;

                        } 
                        this.doChangeSave();
                        
                    }
                })
                this.nodeMap[nodeId] = node;
            }
            // 绑定节点
            this.instance.makeSource(nodeId, {
                filter: "strong",
                //filterExclude:true,
                maxConnections: -1,
                endpoint: ["Dot", { radius: 17 }],
                //anchor:sourceAnchors,
                allowLoopback: false,
                anchors: this.defaultAnchors
            })

            this.instance.makeTarget(nodeId, {
                dropOptions: { hoverClass: "hover" },
                anchors: this.defaultAnchors,
                allowLoopback: false,
                endpoint: ["Dot", { radius: 17 }]
            })

        } else {
            this.nodes.forEach((it) => {
                this.resetFlowNode(it)
            })
        }
    }

    private dropNodeById(nodeId: string, cb?: Function) {
        let element: any = document.getElementById(nodeId);

        if (element) {
            addClass(element, 'destroy');
            setTimeout(()=> {
                element.style.display = 'none'
                cb && cb();
            }, 400)
        }
    }
    
    private findOffsetNodes (left: number, top: number) {
        return this.nodes.filter((it) => {

            return (it.left - this.size < left) && (['go','router'].indexOf(it.type) > -1 || this.getConnectorBySourceId(it.id).length == 0 )
        }).map(it => {
            let distance=  Math.sqrt(Math.pow(it.left - left, 2) + Math.pow(it.top - top, 2));
            
            if (it.type == 'go') {
                let router: any = this.findRouterConnectorByNodeId(it.id)
                // 修改下
                if(router.length) {
                    it =  this.getNodeById(router[0].target);
                }
            }

            return {
                left: it.left,
                top: it.top,
                id: it.id,
                distance
            }
        }).sort((a, b) => {
            return a.distance > b.distance ? 1 : -1;
        })
    }

    private addNewNodeByPosition (pageX: number, pageY: number) {
        let canvasOffset: any = {left :this.canvas.offsetLeft, top: this.canvas.offsetTop, width: this.canvas.offsetWidth, height: this.canvas.offsetHeight};
        let canvasRect: any = this.canvas.getBoundingClientRect();
        

        let offsetNodes: any = this.findOffsetNodes(pageX - canvasRect.left, pageY - canvasRect.top);
        let newNodeId: any = utils.uniq('module');
        // 点击点位置
        let pointerLeft: any = pageX - canvasOffset.left ;//- this.size/2;
        let pointerTop: any = pageY - canvasOffset.top;// -this.size/2;
        // 点击点所在中心点位置
        let centerLeft: any = canvasOffset.left + canvasOffset.width / 2;
        let centerTop: any = canvasOffset.top + canvasOffset.height / 2;

        let zoomCenterLeft: any = canvasRect.width / 2 + canvasRect.left;
        let zoomCenterTop: any = canvasRect.height/2 + canvasRect.top;

        let zoomPointerLeft: any =(pointerLeft - centerLeft)/ this.getZoom() + zoomCenterLeft;
        let zoomPointerTop: any = (pointerTop - centerTop) / this.getZoom() + zoomCenterTop;
        

        this.addNewNode(Object.assign({}, this.templateMap.new || {}, {
            id: newNodeId,
            isNew: true,
            left: zoomPointerLeft - this.getSize(true),
            top: zoomPointerTop - this.getSize(true)
        }), (nodeConfig: any) => {
            // 建立链接
            
            this.resetFlowNode(nodeConfig)
            this.updateNodeById(newNodeId, { isNew: false});

            if (offsetNodes && offsetNodes.length ) {            
                let sourceNode: any = offsetNodes[0];
                if (sourceNode.distance < this.size * 5) {
                    this.addConnectorBySourceTarget(sourceNode.id, newNodeId)
                }
            }
        });
        
        
    }
    /******************
     * 以下为公共接口区
     * 
     ******************/
    public addNewNode (config: any, cb?: Function) {
        this.addNode(config);
        setTimeout(()=> {
            let node: any = document.getElementById(config.id);
            addClass(node, 'showed');
            setTimeout(()=> {
                removeClass(node, 'showed');
                removeClass(node, 'scenflow-node-new');
                // 建立连线
                cb && cb(config);
                this.doChangeSave();
            }, 700)
        }, 0)
    }
    //通过dragnode删除连线
    public dropConnectorByDragNode(dir: string, nosave?:boolean) {
        
        if (this.dragNodeId) {
            
            let dropConnector: any = dir == 'right' 
                ? this.getConnectorBySourceId(this.dragNodeId) 
                : dir == 'left' ? this.getConnectorByTargetId(this.dragNodeId) : this.getConnectorIdsByNodeId(this.dragNodeId);
            
            this.removeTemporaryConnector();

            dropConnector.forEach(it => {
                this.removeConnectorBySourceTarget(it.source, it.target);
                this.removeConnectorNodeBySourceTarget(it.source, it.target);
            });
            this.reflushDragNode();
            !nosave && this.doChangeSave();
        }
    }
    public dropDragNode(cb?: Function) {
        if (this.dragNodeId) {
            //this.removeConnectorByNodeId(this.dragNodeId);
            this.dropConnectorByDragNode('middle',true);
            this.removeNodeById(this.dragNodeId);
            this.dropNodeById(this.dragNodeId, () => {
                cb && cb();
                this.doChangeSave();
            });
            
        }
    }



    public recursiveChildrenFormat(nodeId: string) {
        let node: any = this.getNodeById(nodeId);

    }
    public doFormatNodeCanvas() {
       this.canvasFormat.format();
    }
}