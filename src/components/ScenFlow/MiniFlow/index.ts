import { EventEmitter } from 'events';
import { utils } from '@blocksx/core';

import * as DomUtils from '../../utils/dom';
import JSPlumbTool from '../../utils/third-party/jsplumb'
import Chinampa from './chinampa';
import DraggableCanvas from './draggable';
import PositioningCanvas from './positioning';
import FormatCanvas from './format';

import { IRect, IPointCoord, FlowNode, FlowConnector } from './typing';
import { text } from 'stream/consumers';
/**
 * 一个极简交互的流程图绘制工具
 */




export interface MiniFlowMap {
    canvas: HTMLElement | string; // 画布节点
    isViewer?: boolean;
    destoryChinampaPanel: HTMLElement;
    unlinkChinampaPanel: HTMLElement;
    chinampaPanel: HTMLElement;

    templateMap: any;

    nodes: FlowNode[];
    connector: FlowConnector[];

    size?: number;
}

export default class MiniFlow extends EventEmitter {
    private defaultAnchors: any = [
        ["Perimeter", { shape: 'Circle', rotation: '' }],
        ["Perimeter", { shape: 'Circle', rotation: '' }]
    ];
    private magnet: any = {
        safeDistance: 20, // 安全距离, 右边方向
        safeAngle: 45, // 安全角度, 右边方向
        safeMinDiamond: 30,
        safeMaxDiamond: 200
    };
    private temporaryRouterOffset: number;
    private canvas: any;
    private isViewer: boolean;
    private cavnasWrapper: any;
    private canvasPosition: any;
    private canvasZoom: number;

    private templateMap: any;
    private freezeState: boolean;

    private nodes: FlowNode[];
    private connector: FlowConnector[];
    private connectorInstanceMap: any;
    private connectorMap: any;
    private nodeMap: any;
    private dragFreeNode?: boolean;

    private dragNodeName: string;
    private dragNode: any;
    private dragTarget: any; // 拖动时候的目标
    private draggingFlag: any;

    private size: number;
    private safeStartAngle: number;
    private safeEndAngle: number;

    private instance: any;

    public canvasFormat: FormatCanvas;
    public cavnasDraggable: any;
    private canvasPositioning: PositioningCanvas;


    private highlightConnectInfo: any;

    public constructor(props: MiniFlowMap) {
        super();

        this.canvas = document.getElementById(props.canvas as string);
        this.cavnasWrapper = this.canvas.parentNode;

        new Chinampa(this, props.chinampaPanel,
            props.destoryChinampaPanel,
            props.unlinkChinampaPanel
        );

        this.nodes = props.nodes;
        this.connector = props.connector;
        this.connectorInstanceMap = {};
        this.templateMap = props.templateMap || {};

        this.canvasZoom = 1;
        this.isViewer = !!props.isViewer;
        this.canvasPosition = { left: 0, top: 0 };
        this.connectorMap = {};
        this.nodeMap = {};
        this.size = (props.size || 138);
        this.temporaryRouterOffset = 40;

        this.freezeState = false;


        this.safeStartAngle = (180 - this.magnet.safeAngle / 2) * (Math.PI / 180);
        this.safeEndAngle = (180 + this.magnet.safeAngle / 2) * (Math.PI / 180);

        this.instance = JSPlumbTool.jsPlumb.getInstance({
            // drag options
            DragOptions: { cursor: "pointer", zIndex: 2000 },
            // default to a gradient stroke from blue to green.

            Container: this.canvas,
            anchors: this.defaultAnchors,
        });

        this.canvasFormat = new FormatCanvas(this);
        this.cavnasDraggable = new DraggableCanvas(this);
        this.canvasPositioning = new PositioningCanvas(this)

        this.bindEvent();
        this.instance.batch(() => {

            this.resetFlowNode();
            this.resetConnector();
        })
    }

    // 清楚
    public destory() {
        this.instance.deleteEveryConnection();
        this.instance.deleteEveryEndpoint();
        this.unBindEvent();
    }

    public freeze() {
        this.freezeState = true;
    }
    public unfreeze() {
        this.freezeState = false;
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
        return half ? size / 2 : size;
    }
    private doChangeSave() {
        // 触发事件
        // this.flushNodes();
        this.emit('onChange', {
            nodes: this.nodes,
            connector: this.connector
        })
    }

    private flushNodes() {
        //let cacheKey: any = Object.keys(this.nodeMap)
        this.nodes = this.nodes.map(it => {
            let updateValue: any = this.nodeMap[it.name];

            return updateValue ? Object.assign(it, {
                props: updateValue.props || {},
                color: updateValue.color
            }) : it;
        })
    }

    /**
     * 简单节点，只有一个以下来路或则一个以下去路
     */
    public isSampleNode(name: string) {
        
        let sourceNode: any = this.connector.filter(it => (it.target === name) && !it.isTemporary);
        let targetNode: any = this.connector.filter(it => (it.source ===name) && !it.isTemporary);
        
        if ((!sourceNode || sourceNode.length <=1) && (!targetNode || targetNode.length <=1) ) {
            
            return this.nodes.length > 1;
        }
        return false;
    }

    public isAloneNode(name:string) {
        return !this.connector.find(it=> ((it.target ==name || it.source == name)));
    }

    private isFreeNode(name: string) {

        return !this.connector.find(it => (it.target == name))
    }
    private getConnectorBySourceName(sourceName: string, ignore?: boolean) {
        return this.connector.filter(it => (it.source == sourceName) && (ignore || !it.isTemporary))
    }
    private getSourceTargetListConnectorByNodeName(sourceName: string) {
        let source: any = this.getConnectorBySourceName(sourceName);
        return source.map(it => it.target);
    }
    // 获取开始节点
    public getStartNodes() {

        return this.nodes.filter(node => this.getConnectorBySourceName(node.name, true).length && !this.getConnectorByTargetName(node.name).length)
    }
    private getConnectorByTargetName(target: string) {
        return this.connector.filter(it => (it.target == target) && !it.isTemporary)
    }
    private getConnectorNamesByNodeName(nodeName: string) {
        return this.connector.filter(it => it.target == nodeName || it.source == nodeName);
    }
    private hasNode(name: string) {
        return !!this.getNodeByName(name);
    }
    public getNodeByName(name: string): any {
        return this.nodes.find(it => it.name == name)
    }
    // 判断该节点是否有路由节点连线
    private findRouterConnectorByNodeName(nodeName: string) {
        return this.connector.filter(conn => {
            let node: any = this.getNodeByName(conn.target);
            return conn.source == nodeName && (node.type == 'router' && !conn.isTemporary)
        })
    }

    public setConnectorInstance(source: string, target: string, instance: any) {

        let key: string = [source, target].join('_');

        this.connectorInstanceMap[key] = instance;
    }
    public getConnectorInstance(source:string, target: string) {
        let key: string = [source, target].join('_');
        
        return this.connectorInstanceMap[key] ;
    }

    private reflushConnectorByName(name: string) {
        let connector: any = this.getConnectorNamesByNodeName(name);
        connector.forEach(it => {
            this.resetConnectorNodeBySourceTarget(it.source, it.target)
        })
    }

    public updateNodeByName(name: string, node: any, forceUpdate?: boolean) {
        let onode: any = this.getNodeByName(name);

        if (onode) {
            let colorChange: boolean = node.color != onode.color;

            this.nodes.forEach(it => {
                if (it.name == name) {
                    Object.assign(it, node)
                }
            })

            // 更新连线
            if (colorChange) {
                this.reflushConnectorByName(name);
            }

            if (forceUpdate) {
                this.doChangeSave()
            }
        }
    }
    // 获取子孙节点
    private getDescendantNode(nodeName: string, filter?: Function) {
        let children: any[] = [];
        let target: any[] = this.getConnectorBySourceName(nodeName, true);

        if (target) {
            target.forEach(it => {

                if (it.target !== this.dragNodeName) {
                    let targetNode: any = this.getNodeByName(it.target);
                    filter && filter(targetNode);
                    children.push(targetNode);
                }
                children = children.concat(this.getDescendantNode(it.target, filter))
            })
        }

        return children;
    }
    private getConnectorName(source: string, target: string) {
        return [source, target].join('_');
    }
    private getConnectorBySourceTarget(source: string, target: string) {
        return this.connector.find(it => (it.source == source) && (it.target == target))
    }
    private addConnectorBySourceTarget(source: string, target: string, isTemporary?: boolean, noAutoConn?: boolean) {
        if (!this.getConnectorBySourceTarget(source, target)) {

            this.connector.push({
                source,
                target,
                isTemporary: isTemporary
            })
            !noAutoConn && this.addConnectorNodeBySourceTarget(source, target, isTemporary)
        }
    }
    private addNode(node: any, nosave?: boolean) {
        this.nodes.push(node);
        !nosave && this.doChangeSave();
    }
    private removeNodeByName(nodeName: string) {
        this.nodes = this.nodes.filter(node => node.name != nodeName);
    }
    private removeTemporaryRouterNodeByName(nodeName: string) {
        this.removeNodeByName(nodeName);
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
    private addTemporaryRouterNode(nodeName: string) {


        let sourceNode: any = this.getNodeByName(nodeName);
        let linePoint: any
        let targetsNode: any = this.getConnectorBySourceName(nodeName)[0];
        if (targetsNode) {
            let targetNode: any = this.getNodeByName(targetsNode.target);
            linePoint = this.getLinePointByTargetSource(sourceNode.left, sourceNode.top, targetNode.left, targetNode.top)
        } else {
            linePoint = {
                top: sourceNode.top,
                left: sourceNode.left + this.size * 2
            }
        }

        let tempRouteNode = this.getRouterNodeConfig({

            left: linePoint.left,
            top: linePoint.top
        })

        this.addNode(tempRouteNode);
        // TODO 批量递归增加位移
        setTimeout(() => {
            this.resetFlowNode(tempRouteNode)
        }, 0)

        return tempRouteNode.name;
    }

    private getRouterNodeConfig(nodeConfig: any) {
        let routerNodeName: string = utils.uniq('router');
        return Object.assign({
            name: routerNodeName,
            isTemporary: true,
            ...nodeConfig
        }, this.templateMap.router || {})
    }


    private lockConnectorBySourceTarget(source: string, target: string) {
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
    private removeConnectorByNodeName(nodeName: string) {
        this.connector = this.connector.filter(it => !(it.source == nodeName || it.target == nodeName))
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
    private batchRemoveConnectorByNodeName(nodeName: string, targetIds: any[]) {
        this.connector = this.connector.filter(conn => !(conn.source == nodeName && targetIds.indexOf(conn.target) > -1));
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


    private getSafeDistanceSwwitchNode(activate: any, holder: any, halfSize: number, safeDistance: number, pointX: number, pointY: number) {
        let node: any = holder.type == 'append' ? this.getNodeByName(this.dragTarget.tempRouterName) : holder.node;

        if (this.dragTarget.tempRouterName || node.type == 'router') {

            let holderCenterX: number = node.left + halfSize;
            let holderCenterY: number = node.top + halfSize;
            let holderDistance: number = Math.sqrt(Math.pow(pointX - holderCenterX, 2) + Math.pow(pointY - holderCenterY, 2));

            if (holderDistance < safeDistance + 1 * this.size) {
                
                activate.push(holder)
            }
        }
    }
    private getDistanceByNode(node: any, pointX: number, pointY: number) {
        let halfSize: number = this.getSize(true);
        let centerX: number = node.left + halfSize;
        let centerY: number = node.top + halfSize;
        return Math.sqrt(Math.pow(pointX - centerX, 2) + Math.pow(pointY - centerY, 2));

    }
    private getDistanceAgleByNode(node: any, pointX: number, pointY: number) {
        let halfSize: number = this.getSize(true);
        let centerX: number = node.left + halfSize;
        let centerY: number = node.top + halfSize;
        return Math.PI - Math.atan2(pointY - centerY, pointX - centerX);
    }
    private getDistanceTypeIgnoreRouter(config: any, sourceTargets: any[], pointX: any, pointY: any) {

        if (sourceTargets.length == 0) {
            let { node } = config;

            if (this.dragNode.type == 'go') {
                // 两个开始相组合,生成router节点
                if (node.type == 'go') {
                    return {
                        ...config,

                        type: 'append'
                    }
                }
            }

            return {
                ...config,
                type: 'connector'
            }
        }
        // 如果只有一个目标,切这个目标是路由节点

        if (sourceTargets.length == 1) {
            let routerNode: any = this.getNodeByName(sourceTargets[0].target);
            if (routerNode.type == 'router') {

                return {
                    ...config,
                    type: 'connector',
                    node: routerNode,
                    distance: this.getDistanceByNode(routerNode, pointX, pointY)
                }
            }
        }

        return {
            ...config,
            type: 'append'
        }
    }

    /**
     * 获取在安全距离内节点
     * @param node 
     */
    private getSafeDistanceNodes(pos: number[]) {
        let halfSize: number = this.getSize(true);
        let pointX: number = pos[0] + halfSize;
        let safeDistance: number = Math.max(this.size + this.magnet.safeDistance, this.size + 10);
        let pointY: number = pos[1] + halfSize;
        let activate: any = [];
        // 如果存在拖动对象
        if (this.dragTarget) {
            let { holder } = this.dragTarget;
            if (holder.node) {

                this.getSafeDistanceSwwitchNode(activate, holder, halfSize, safeDistance, pointX, pointY)
            }
        }

        activate.length == 0 && this.nodes.forEach(it => {

            if (it.name == this.dragNodeName || it.isTemporary) {

                return;
            }

            let distance: number = this.getDistanceByNode(it, pointX, pointY)//
            let sourceTargets: any = this.getConnectorBySourceName(it.name);


            // router  节点判断安全距离均为添加新节点
            if (it.type == 'router') {

                if (distance < this.size + 10) {
                    activate.push({ type: 'connector', distance, node: it })
                }


            } else {
                // 在圆里面, 强制添加
                if (!(it.type == 'go' && this.dragNode.type == 'go')) {

                    if (distance < halfSize) {
                        activate.push(this.getDistanceTypeIgnoreRouter({ distance, node: it }, sourceTargets, pointX, pointY));

                        // 在角度里面
                    } else {
                        let angle: number = this.getDistanceAgleByNode(it, pointX, pointY)//

                        // 如果没有source节点就增加响应区范围
                        // let _safeDistance =  sourceTargets.length == 0 ? safeDistance + this.getSize() : safeDistance  ;


                        if (distance < safeDistance + this.size / 2
                            && angle >= this.safeStartAngle
                            && angle <= this.safeEndAngle) {

                            //activate.push({type: sourceTargets.length == 0 ? 'connector' : 'append', distance, node: it})
                            activate.push(this.getDistanceTypeIgnoreRouter({ distance, node: it }, sourceTargets, pointX, pointY))
                        }
                    }
                }
            }

        })

        return activate.sort((a, b) => {
            return a.distance > b.distance ? 1 : -1
        }).filter(it => it.name != this.dragNodeName);
    }
    private getDiamondDistance(target: string) {
        let sourceConnectors = this.getConnectorBySourceName(target);
        return Math.max(this.magnet.safeMinDiamond, this.magnet.safeMaxDiamond / (sourceConnectors.length))
    }
    /**
     * 如果已知菱形的两个对角顶点 A (x_a, y_a) 和 C (x_c, y_c)，以及对角
     * 顶点 B 到 D 的距离（假设为 d_bd），求对角顶点 B 和 D 的坐标
     * 
     */
    private getSafeDiamondDiagonalCoordinates(sourceId: string, targetId: string) {

        let halfSize: number = this.getSize(true);
        let sourcePoint: any = this.getNodeByName(sourceId);
        let targetPoint: any = this.getNodeByName(targetId);
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
    private isPointInsideDiamond(a: any, b: any, c: any, d: any, p: any) {
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
        //const vectorToCenter = { x: (a.x + c.x) / 2 - a.x, y: (a.y + c.y) / 2 - a.y };

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
        return this.isPointInsideDiamond(place.pointA, place.pointB, place.pointC, place.pointD, { x: pos[0] + this.getSize(true), y: pos[1] + this.getSize(true) })
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
                if ((it.source != this.dragNodeName) && (it.target != this.dragNodeName)) {
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
            this.connectorMap[this.getConnectorName(e.sourceId, e.targetId)] = e.connection;
        })
        if (!this.isViewer) {
            // 绑定事件
            DomUtils.addEvent(this.canvas.parentNode, 'dblclick', (e) => {
                if (!this.freezeState) {
                    if (this.nodes.length > 0) {
                        this.addNewNodeByPosition({}, e.pageX, e.pageY)
                    }
                }
            })
        }
            // 绑定其他地方点击的时候隐藏高亮
            DomUtils.addEvent(this.canvas.parentNode, 'click', (e) => {
                
                if (this.highlightConnectInfo) {
                    this.unHighlightConnector(e);
                }
            })
        
    }
    private unBindEvent() {
        DomUtils.removeEvent(this.canvas.parentNode, 'dblclick');
        DomUtils.removeEvent(this.canvas.parentNode, 'click');
    }
    public resetConnectorNodeBySourceTarget(source: string, target: string) {
        this.removeConnectorNodeBySourceTarget(source, target);
        this.addConnectorNodeBySourceTarget(source, target)
    }
    /**
     * 删除节点连线
     * @param source 
     * @param target 
     */
    private removeConnectorNodeBySourceTarget(source: string, target: string) {
        let sourceTargetName: string = this.getConnectorName(source, target);

        if (this.connectorMap[sourceTargetName]) {
            
            this.instance.deleteConnection(this.connectorMap[sourceTargetName]);
            this.connectorMap[sourceTargetName] = null;
        }
    }
    private getSafeOpacityColor(color:string) {
        if (color) {
            if (color.length > 5) {
                return color + '44'
            } else if (color.length ==4) {
                return color.split('').map(it=> {
                    if (it !=='#') {
                        return it+ it;
                    }
                    return it;
                }).join('') + '66'
            }
            return color;
        }
    }

    private mergePaintStyle(paintSytle: any, mergedata: any) {
        return {
            ...paintSytle,
            ...mergedata
        }
    }
    /**
     * 添加节点
     * @param source 
     * @param target 
     * @param isTemporary 
     */
    private addConnectorNodeBySourceTarget(source: string, target: string, isTemporary?: boolean) {
        let sourceNode: FlowNode = this.getNodeByName(source);
        let targetNode: FlowNode = this.getNodeByName(target);
        let connector: any = this.getConnectorBySourceTarget(source, target);
        let connectorProps: any = connector.props;

        let sourceColor: string = isTemporary ? '#e2e2e2' : sourceNode.color;
        let targetColor: string = isTemporary ? '#e2e2e2' : targetNode.color;

        let defultPaintStyle: any = {
            gradient: {
                stops: [
                    [0, connectorProps ? sourceColor : this.getSafeOpacityColor(sourceColor)],
                    [0.8, connectorProps ? targetColor : this.getSafeOpacityColor(targetColor)]
                ]
            },
            "dashstyle": "1.4 .2",
            fillStyle: targetColor,
            stroke: targetColor,
            strokeWidth: 10
        };
        let hoverPaintStyle: any = this.mergePaintStyle(defultPaintStyle, {
            gradient: {
                stops: [
                    [0, sourceColor],
                    [0.8, targetColor]
                ]
            }
        });

        
        //this.instance.setCursor('pointer');
        if (connector && !this.connectorMap[this.getConnectorName(source, target)]) {
            
            this.setConnectorInstance(source, target, this.instance.connect({
                source: source,
                target: target,
                events:{
                    click:(_,event) => {
                        // 高亮连线标识
                        this.unHighlightConnector();
                        this.highlightConnectInfo = {
                            instance: this.getConnectorInstance(source, target),
                            paintStyle: defultPaintStyle,
                            hoverPaintStyle,
                            target,
                            source,
                            targetColor,
                            sourceColor,
                            connect: connector
                        }
                        
                        this.highlightConnector(event);
                        event.stopPropagation();
                    }
                },
                //endpoints:["Rectangle", 'Rectangle'],
                endpointStyles: [{ fill: sourceColor }, { fill: targetColor }],
                deleteEndpointsOnDetach: false,
                connectionsDetachable: false,
                connector: ['Straight'],
                paintStyle: defultPaintStyle,
                hoverPaintStyle: hoverPaintStyle,
                overlays: [
                    ["Custom", {
                        create: function (component) {
                            let custom: any = document.createElement('div');
                            custom.className = 'overlays-arrow';
                            return custom;
                        },
                        location: 0,
                        id: "customOverlay"
                    }]
                ]
            }))
        }
    }

    public updateHighlightConnectProps(props: any) {
        if (this.highlightConnectInfo) {
            let { target, source } = this.highlightConnectInfo;
            
            let node: any = this.getConnectorBySourceTarget(source,target);

            if (node) {
                node.props = Object.assign({}, node.props || {}, props)
            }

            this.resetConnectorNodeBySourceTarget(source,target);
            this.doChangeSave()
        }
    }
    public getHighlightInfo() {
        return this.highlightConnectInfo;
    }
    public getHighlightConnectProps () {
        if (this.highlightConnectInfo) {
            let { connect } = this.highlightConnectInfo;
            return connect.props || {};
        }
    }
    /**
     * 连线高亮
     */
    public highlightConnector(event?: any) {
        if (this.highlightConnectInfo) {
            let { instance, paintStyle, sourceColor, targetColor, target, source } = this.highlightConnectInfo;
            let lightlightStyle: any = this.mergePaintStyle(paintStyle, {
                strokeWidth: 14,
                gradient: {
                    stops: [
                        [0, sourceColor],
                        [0.8, targetColor]
                    ]
                }
            });
            
            instance.setPaintStyle(lightlightStyle);
            instance.setHoverPaintStyle(lightlightStyle);


            this.emit('highlightConnect', {
                event,
                target,
                source,
                connector: instance
            })
            
        }
    }

    public unHighlightConnector(event?: any) {
        if (this.highlightConnectInfo) {
            let { instance, paintStyle,hoverPaintStyle, target, source } = this.highlightConnectInfo;
            
            try {
                instance.setPaintStyle(paintStyle);
                instance.setHoverPaintStyle(hoverPaintStyle)
            } catch(e) {}

            this.emit('unHighlightConnect', {
                event,
                target,
                source,
                connector: instance
            })

            this.highlightConnectInfo =  null;
        }
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
        if (node.name == this.dragNodeName) {
            return false;
        }
        if (this.dragNode.type == 'go') {

            if (node.type == 'go' || (node.type == 'router')) {
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

            let { node } = placeholder;
            let dragGo: boolean = this.dragNode.type == 'go';
            // 如果是开始节点,修改下逻辑
            // 判断当前开始节点是否有一个节点链接到router节点
            if (node.type == 'go') {
                let router: any = this.findRouterConnectorByNodeName(node.name);
                // 有路由
                if (router.length) {
                    // 和路由建立链接
                    return {
                        type: 'connector',
                        switchEndpoint: dragGo, // 
                        node: this.getNodeByName(router[0].target)
                    }
                } else {
                    // 没有路由 如果是没有节点就直接链接新节点
                    // 获取节点
                    let sourceNodes: any = this.getConnectorBySourceName(node.name);

                    if (sourceNodes.length) {
                        placeholder.type = 'append';
                    } else {
                        placeholder.switchEndpoint = dragGo;
                        /*return  {
                            type: 'connector',
                            switchEndpoint: dragGo , // 
                            node: node
                        };*/
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

        if (placeholder && this.whetherInsertNode(placeholder)) {

            let holderName: string = this.getPlaceholderName(placeholder)

            // 第一次
            if (!this.dragTarget) {
                this.dragTarget = {
                    holderName: holderName,
                    holder: placeholder
                }
                this.linkPlaceholder(this.dragTarget, true);

                // 第二次
            } else {
                if (this.dragTarget.holderName != holderName) {

                    this.unlinkPlaceholder(this.dragTarget);
                    this.linkPlaceholder(this.dragTarget = {
                        holderName: holderName,
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
    private getPlaceholderName(placeholder: any) {
        let uid: any[] = [placeholder.type];

        uid.push(placeholder.connector
            ? [placeholder.connector.source, placeholder.connector.target].join('.')
            : placeholder.node.name);

        return uid.join('.')
    }
    private batchLockConnectorByNodeName(nodeName: string, targetNodes: string[]) {
        targetNodes && targetNodes.forEach(target => {
            this.lockConnectorBySourceTarget(nodeName, target)
        })
    }
    private batchAddConnectorByNodeName(nodeName: string, targetNodes: string[], isTemporary?: boolean) {
        // 建立目标节点到临时路由节点的链接
        targetNodes && targetNodes.forEach(target => {
            this.addConnectorBySourceTarget(nodeName, target, isTemporary)
        })
    }
    private batchUnlockConnectorBySourceTarget(nodeName: string, targetNodes: string[]) {
        targetNodes.forEach(target => {
            this.unlockConnectorBySourceTarget(nodeName, target)
        })

    }
    private doBatchAnimate(nodes: any[]) {
        nodes && nodes.forEach(node => {
            this.instance.animate(document.getElementById(node.name), {
                left: node.left
            }, {
                duration: 200,
                easing: 'easeOutBack'
            })
        })
    }
    private batchDescendantNodeForward(nodeName: string) {

        let descendantNodes: any = this.getDescendantNode(nodeName, (node) => {
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
    private batchDescendantNodeBackward(nodeName: string, sourceName: string, isTemporary?: boolean) {

        let offset: IPointCoord = { left: 0, top: 0 };
        let sourceNode: any = this.getNodeByName(sourceName);
        let connector: any = this.getConnectorBySourceName(nodeName, true)[0] || {};
        let targetNode: any = this.getNodeByName(connector.target);

        if (targetNode) {
            let distance: number = Math.sqrt(Math.pow(targetNode.left - sourceNode.left, 2) + Math.pow(targetNode.top - sourceNode.top, 2));;
            let minSize: number = this.temporaryRouterOffset * 2 + 2 * this.size;
            if (distance < minSize) {
                offset = this.getLinePointByTargetSource(sourceNode.left, sourceNode.top, targetNode.left, targetNode.top, minSize);
                offset.left = offset.left - targetNode.left;
                offset.top = offset.top - targetNode.top
            }
        }

        let descendantNodes: any = this.getDescendantNode(nodeName, isTemporary ? (node) => {
            node.originalLeft = node.left;
            node.originalTop = node.top;
            // 判断下位置
            node.left += offset.left;
            node.top += offset.top
        } : undefined)

        this.doBatchAnimate(descendantNodes);
    }

    // 建立临时链接
    private linkPlaceholder(dragTarget: any, isTemporary?: boolean, cb?: Function) {

        let { holder } = dragTarget;

        if (holder) {

            switch (holder.type) {
                // 在节点后面增加router节点
                case 'append':
                    let dragNodeName: string = this.dragNodeName;

                    // 新增临时router节点
                    let tempRouterName: string = dragTarget.tempRouterName
                        ? dragTarget.tempRouterName : dragTarget.tempRouterName = this.addTemporaryRouterNode(holder.node.name)
                    let targetNodes: any = dragTarget.targetNodes
                        ? dragTarget.targetNodes : dragTarget.targetNodes = this.getSourceTargetListConnectorByNodeName(holder.node.name)


                    // 获取目标节点的路径节点
                    // 批量lock掉所有的原始节点
                    setTimeout(() => {

                        // 建立目标节点到临时router节点的链接
                        this.addConnectorBySourceTarget(holder.node.name, tempRouterName, isTemporary);
                        // 批量建立所有的临时节点
                        targetNodes.length && this.batchAddConnectorByNodeName(tempRouterName, targetNodes, isTemporary);

                        if (holder.switchEndpoint) {
                            this.addConnectorBySourceTarget(dragNodeName, tempRouterName, isTemporary);
                        } else {
                            this.addConnectorBySourceTarget(tempRouterName, dragNodeName, isTemporary);
                        }

                        // 节点后移动化
                        this.batchDescendantNodeBackward(tempRouterName, holder.node.name, isTemporary);

                        if (isTemporary) {
                            this.batchLockConnectorByNodeName(holder.node.name, targetNodes)
                        } else {
                            this.batchRemoveConnectorByNodeName(holder.node.name, targetNodes);
                            tempRouterName && this.updateNodeByName(tempRouterName, { isTemporary: false })
                        }

                        cb && cb();
                    }, 0);
                    break;
                case 'connector':
                    // 建立一个临时链接
                    if (holder.switchEndpoint) {
                        this.addConnectorBySourceTarget(this.dragNodeName, holder.node.name, isTemporary)
                    } else {
                        this.addConnectorBySourceTarget(holder.node.name, this.dragNodeName, isTemporary)
                    }
                    cb && cb();
                    break;
                case 'relink':
                    // 如果是建立临时节点
                    //1、lock 原始链接
                    isTemporary && this.lockConnectorBySourceTarget(holder.connector.source, holder.connector.target)
                    //2、 建立新的临时节点
                    this.addConnectorBySourceTarget(holder.connector.source, this.dragNodeName, isTemporary);
                    this.addConnectorBySourceTarget(this.dragNodeName, holder.connector.target, isTemporary);
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
                    this.batchUnlockConnectorBySourceTarget(holder.node.name, dragTarget.targetNodes)
                    this.removeTemporaryRouterNodeByName(dragTarget.tempRouterName);
                    this.batchDescendantNodeForward(holder.node.name)
                }
            }

        }
    }
    private reflushDragNode() {
        if (this.dragFreeNode = this.isFreeNode(this.dragNodeName)) {
            this.dragNode = this.getNodeByName(this.dragNodeName)
        } else {
            this.dragNode = null;
        }

        this.dragTarget = null;
        this.draggingFlag = false;
    }
    private resetFlowNode(node?: any) {
        if (node) {
            let nodeName: any = node.name;

            if (!this.nodeMap[nodeName]) {
                this.instance.draggable(nodeName, {
                    // filter: '.scenflow-node'
                    drag: (e) => {
                        this.updateNodeByName(e.el.id, {
                            left: e.pos[0],
                            top: e.pos[1]
                        });
                        // 开始拖动
                        this.emit(!this.draggingFlag ? 'onDragStart' : 'onDragging', {
                            left: e.pos[0],
                            top: e.pos[1],
                            event: e.e
                        })

                        if (!this.draggingFlag ) {
                            this.unHighlightConnector()
                        }

                        if (this.dragFreeNode) {
                            this.dragging(e.pos);
                        }
                        this.draggingFlag = true;
                    },
                    start: () => {
                        this.dragNodeName = nodeName;
                        this.reflushDragNode();
                    },
                    stop: (event: any) => {

                        this.emit('onDragEnd');
                        this.draggingFlag = false;


                        if (this.dragFreeNode) {
                            if (this.dragTarget) {
                                this.removeTemporaryConnector();
                                //this.removeLockConnector();
                                this.linkPlaceholder(this.dragTarget, false, () => {
                                    this.doChangeSave()
                                    console.log(this.dragTarget,33333322)
                                });


                                return this.dragTarget = null;
                            } 
                            this.dragFreeNode = false;
                            this.dragNodeName = '';
                            this.dragNode = null;

                        } else {
                            console.log(this.dragFreeNode, 3333)
                        }
                        this.doChangeSave();


                    }
                })
                this.nodeMap[nodeName] = node;
            }
            // 绑定节点
            this.instance.makeSource(nodeName, {
                filter: "strong",
                //filterExclude:true,
                maxConnections: -1,
                endpoint: ["Dot", { radius: 17 }],
                //anchor:sourceAnchors,
                allowLoopback: false,
                anchors: this.defaultAnchors
            })

            this.instance.makeTarget(nodeName, {
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

    private dropNodeByName(nodeName: string, cb?: Function) {
        let element: any = document.getElementById(nodeName);

        if (element) {
            DomUtils.addClass(element, 'destroy');
            setTimeout(() => {
                element.style.display = 'none'
                cb && cb();
            }, 400)
        }
    }

    private findOffsetNodes(left: number, top: number) {

        return this.nodes.filter((it) => {
            return /*(it.left - this.size < left) && */(['go', 'router'].indexOf(it.type) > -1 || this.getConnectorBySourceName(it.name).length == 0)
        }).map(it => {
            let distance = Math.sqrt(Math.pow(left - it.left, 2) + Math.pow(top - it.top, 2));

            if (it.type == 'go') {
                let router: any = this.findRouterConnectorByNodeName(it.name)
                // 修改下
                if (router.length) {
                    it = this.getNodeByName(router[0].target);
                } else {
                    distance = 1e10;
                }
            }

            return {
                left: it.left,
                top: it.top,
                name: it.name,
                distance
            }
        }).filter(it => it.distance != 1e10).sort((a, b) => {
            return a.distance > b.distance ? 1 : -1;
        });
    }

    public getTemplateNodeConfig(config: any) {
        let newNodeName: any = utils.uniq('module');

        return Object.assign({}, this.templateMap.new, {
            name: newNodeName,
            isNew: true,
            ...config
        })
    }

    /******************
     * 以下为公共接口区
     * 
     ******************/

    public addNewNodeByPosition(nodeInfo: any, pageX: number, pageY: number, cb?: Function) {
        let shadowPoint: any = this.canvasPositioning.getOriginalShadowPointByPageXY(pageX, pageY);
        let offsetNodes: any = this.findOffsetNodes(shadowPoint.left - this.size / 2, shadowPoint.top - this.size / 2);
        let newNodeConfig: any = this.getTemplateNodeConfig({
            left: shadowPoint.left - this.size / 2,
            top: shadowPoint.top - this.size / 2,
            ...nodeInfo
        })

        this.addNewNode(newNodeConfig, (nodeConfig: any) => {
            // 建立链接

            this.resetFlowNode(nodeConfig);
            cb && cb()
            if (offsetNodes && offsetNodes.length) {
                let sourceNode: any = offsetNodes[0];
                if (sourceNode.distance < this.size * 5) {
                    this.addConnectorBySourceTarget(sourceNode.name, newNodeConfig.name)
                }
            }
        });
    }
    // 新增一个当前开始节点的兄弟节点
    public addStartNodesByNodeName(nodeName: string) {
        let currentNode: any = this.getNodeByName(nodeName);

        if (currentNode && currentNode.type == 'go') {

            let targetNodes: any[] = this.getConnectorBySourceName(currentNode.name);

            if (targetNodes.length) {
                let secondNode: any = this.getNodeByName(targetNodes[0].target);

                let starts: any = this.getStartNodes();
                let nodeConfig: any = null;

                //return;   
                this.addNode(nodeConfig = this.getTemplateNodeConfig({
                    left: starts[0].left,
                    top: starts[0].top,
                    type: 'go'
                }), true);

                this.addConnectorBySourceTarget(nodeConfig.name, secondNode.name, false, true)
                this.canvasFormat.format(false, true);
                // 新增动画
                setTimeout(() => {
                    this.doNewAnimate(nodeConfig, () => {
                        this.resetFlowNode(nodeConfig);
                        this.resetConnectorNodeBySourceTarget(nodeConfig.name, secondNode.name)
                    })
                }, 0);

            }
        }
    }
    // 给指定接口后添加一个临时节点
    // 1、如果该节点是router节点则在后面添加子节点
    // 2、如果该节点是非router节点
    //    2.1、如果该节点下有一个出口节点,就自动添加router节点 , 如果下一级是一个router节点,就把新节点加入到这个

    public addChildrenTemplateNodeByName(nodeName: string) {
        let sourceNode: any = this.getNodeByName(nodeName);
        let newNode: any = this.getTemplateNodeConfig({});
        let newRouterNode: any;
        let linkRef: any = [];

        if (sourceNode) {

            if (sourceNode.type != 'router') {
                let sourceConnectors: any = this.getConnectorBySourceName(sourceNode.name);
                // 有节点,判断下一个点的类型是否为router
                if (sourceConnectors.length > 0) {
                    let targetNode: any = this.getNodeByName(sourceConnectors[0].target)
                    if (targetNode.type == 'router') {
                        // 在router节点后加一个节点
                        sourceNode = targetNode;
                    } else {
                        // 新增加一个router节点
                        newRouterNode = this.insertAfterNode(sourceNode, this.getRouterNodeConfig({
                            left: sourceNode.left + this.size + this.temporaryRouterOffset,
                            top: sourceNode.top
                        }), linkRef)
                    }
                }
            }
            this.insertAfterNode(newRouterNode || sourceNode, newNode, linkRef)

            this.canvasFormat.format(false, this.nodes.length > 3);

            setTimeout(() => {
                linkRef.forEach(link => {
                    // 
                    if (link.newNode) {
                        this.resetFlowNode(link.newNode);
                        this.doNewAnimate(link.newNode, () => {
                            link.source && this.addConnectorNodeBySourceTarget(link.source, link.target)
                        })
                    }
                })
            }, 0)

        }
    }

    /**
     * 仅仅通过
     */
    public insertAfterNode(sourceNode: any, newNodeConfig: any, linkRef: any) {

        let targetNodeConnectors: any = this.getConnectorBySourceName(sourceNode.name);

        this.addNode(newNodeConfig, true);

        linkRef.push({
            newNode: newNodeConfig,
            source: sourceNode.name,
            target: newNodeConfig.name
        })

        if (targetNodeConnectors.length > 0) {

            if (sourceNode.type != 'router') {

                let connectors: any = this.getConnectorBySourceName(sourceNode.name);

                connectors.forEach(conn => {
                    this.removeConnectorBySourceTarget(conn.source, conn.target)
                    this.removeConnectorNodeBySourceTarget(conn.source, conn.target);

                    //conn.source = newSourceId;
                    linkRef.push({
                        source: newNodeConfig.name,
                        target: conn.target
                    })
                    this.addConnectorBySourceTarget(newNodeConfig.name, conn.target, false, true);
                })
            }

        }

        // 建立关系
        this.addConnectorBySourceTarget(sourceNode.name, newNodeConfig.name, false, true)
        return newNodeConfig;
    }

    public addNewNode(config: any, cb?: Function) {
        this.addNode(config);
        cb && setTimeout(() => {
            this.doNewAnimate(config, cb)
        }, 0)
    }
    private doNewAnimate(nodeConfig, cb?: Function) {
        let dom: any = document.getElementById(nodeConfig.name);
        DomUtils.addClass(dom, 'showed');
        setTimeout(() => {
            DomUtils.removeClass(dom, 'showed');
            DomUtils.removeClass(dom, 'node-new');
            this.updateNodeByName(nodeConfig.name, { isNew: false });
            // 建立连线
            cb && cb(nodeConfig);
            this.doChangeSave();
        }, 700)
    }
    //通过dragnode删除连线
    public dropConnectorByDragNode(dir: string, nosave?: boolean) {

        if (this.dragNodeName) {
            this.dropConnectorByNodeName(dir, this.dragNodeName, nosave)
        }
    }

    public dropConnectorByNodeName(dir: string, nodeName: string, nosave?: boolean) {

        if (nodeName) {

            let sourceNodes: any = this.getConnectorBySourceName(nodeName);
            let targetNodes: any = this.getConnectorByTargetName(nodeName)

            let dropConnector: any = dir == 'right'
                ? sourceNodes : dir == 'left'
                    ? targetNodes : this.getConnectorNamesByNodeName(nodeName);


            this.removeTemporaryConnector();

            dropConnector.forEach(it => {
                this.removeConnectorBySourceTarget(it.source, it.target);
                this.removeConnectorNodeBySourceTarget(it.source, it.target);
            });


            // 如果是删除两根线条,自动链接
            if (dir == 'middle') {
                if (sourceNodes.length == 1 && targetNodes.length == 1) {

                    this.addConnectorBySourceTarget(targetNodes[0].source, sourceNodes[0].target, false);
                }
            }

            this.reflushDragNode();
            !nosave && this.doChangeSave();
        }
    }


    public dropDragNode(cb?: Function) {

        if (this.dragNodeName) {
            this.deleteNodeByName(this.dragNodeName, cb)
        }
    }

    public deleteNodeByName(nodeName: string, cb?: Function) {
        //this.removeConnectorByNodeName(this.dragNodeName);
        let relatedNodeMap: any = [];
        //let childrenNode: any = this.getConnectorBySourceName(nodeId);
        // 获取是否有关联router
        //if (childrenNode.length ==0) {
        this.relatedDeleteRouter(nodeName, relatedNodeMap);
        if (relatedNodeMap.length) {
            relatedNodeMap.forEach(it => this.deleteNodeByName(it))
        }
        //}

        this.dropConnectorByNodeName('middle', nodeName, true);

        this.dropNodeByName(nodeName, () => {
            this.removeNodeByName(nodeName);
            cb && cb();

            this.doChangeSave();
        });

    }
    // 判断该节点关联的router节点,是否有后代节点,如果没有就删除该router节点
    private relatedDeleteRouter(nodeName: any, relatedNodeMap: any) {
        let relatedConnector: any = this.getConnectorByTargetName(nodeName);

        relatedConnector.forEach(conn => {
            let sourceNode: any = this.getNodeByName(conn.source);
            
            if (sourceNode.type == 'router') {
                let childrenConnector: any = this.getConnectorBySourceName(conn.source) || [];
                
                if (childrenConnector.filter(it => it.target != nodeName).length == 0) {
                    relatedNodeMap.push(conn.source);
                }
            }

        })
    }


    public doFormatNodeCanvas() {
        this.canvasFormat.format();
    }
    public doZoomNodeCanvas() {
        this.canvasFormat.zoomFit();
    }
}