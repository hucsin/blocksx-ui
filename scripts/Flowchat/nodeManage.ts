/*
 * @Descripttion: 
 * @Version: 1.0.0
 * @Author: uoeye
 * @Date: 2020-10-09 11:31:16
 */

import { addEvent, removeEvent } from './events';

export default class NodeManage {
    private diagram: any;
    private panelNodeDom: any;
    private dragNode?: any;
    private dragNodeOffset?: any;
    private dragNodeKey?: string;
    
    public constructor(diagram: any) {

        this.diagram = diagram;
    }
    
    private bindEvent() {
        
        addEvent(this.panelNodeDom, 'mousedown', this.mousedown);
        addEvent(this.diagram.canvas, 'dragover', this.dragover);
    }
    private unbindEvent() {
        if (this.panelNodeDom) {
            removeEvent(this.panelNodeDom, 'mousedown', this.mousedown);
            removeEvent(this.diagram.canvas, 'dragover', this.dragover);
        }
    }
    private inCanvasRect(event: any) {
        let rect = this.diagram.canvas.getBoundingClientRect() || {};
        let maxY = rect.y + rect.height;
        let maxX = rect.x + rect.width;
        
        return rect.x < event.pageX && rect.y < event.pageY 
            && event.pageX < maxX && event.pageY < maxY;
    }
    private dragover =(event: any) => {
        event.preventDefault();
    }
    private dragend =(event: any) => {
        if (this.inCanvasRect(event)) {
            let rect = this.diagram.canvas.getBoundingClientRect() || {};
            let node = this.diagram.getNodeByKey(this.dragNodeKey);

            // 记录X,Y
            node.ui = {
                x: event.pageX - rect.x - this.dragNodeOffset.offsetX,
                y: event.pageY - rect.y - this.dragNodeOffset.offsetY
            }

            this.diagram.addNode(node);
        }

        removeEvent(this.dragNode, 'dragend', this.dragend);
        removeEvent(this.dragNode, 'dragstart', this.dragstart);
    }
    private dragstart =(event: any) => {
        //this.dragNode = event.target;
        let rect = event.target.getBoundingClientRect();

        this.dragNodeOffset = {
            offsetX: event.pageX - rect.x, 
            offsetY: event.pageY - rect.y
        }
    }
    private mousedown =(e: any) => {
        if (e.target) {
            this.dragNode = e.target;
            if (this.dragNodeKey = this.dragNode.getAttribute('data-design-node')) {
                this.dragNode.setAttribute('draggable', true);
                // 绑定事件
                addEvent(this.dragNode, 'dragend', this.dragend);
                addEvent(this.dragNode, 'dragstart', this.dragstart);
            }
        }
    }
    public init(panelNode: any) {
        let { current } = panelNode;

        if (current) {
            this.panelNodeDom = current;
            this.bindEvent();
        }
    }
    
    public destroy() {
        this.unbindEvent();
    }
}