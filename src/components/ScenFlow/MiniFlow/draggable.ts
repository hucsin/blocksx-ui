/*
 * @Descripttion: 
 * @Version: 1.0.0
 * @Author: uoeye
 * @Date: 2020-10-09 21:00:27
 */
/**
 * canvas 管理
 * 拖动，缩放
 * 
 */
 import * as DomUtils  from '../../utils/dom';

const IMAGE_DRAG = new Image;
IMAGE_DRAG.src = "data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==";


export default class CanvasDraggle {
    private diagram: any;
    private canvasWraper?: any;
    private dragPos: any;
    private canvas?: any;
    private canvasPosition: any;
    private canvasPositionDraging: any
    private zoom?: any;

    private zoomMaxNumber: number;
    private zoomMinNumber: number;

    public constructor(diagram: any) {
        this.diagram = diagram;

        this.canvasPosition = diagram.getPosition() || {
            left: 0,
            top: 0
        };
        this.zoomMinNumber = 0.02;
        this.zoomMaxNumber = 1;
        this.init();
    }

    public init() {

        this.canvas = this.diagram.canvas;
        this.canvasWraper = this.canvas.parentNode;
        this.bindEvent();
    }
    private bindEvent() {

        DomUtils.addEvent(this.canvasWraper, 'mousewheel', this.mousewheel);
        DomUtils.addEvent(this.canvasWraper, 'DOMMouseScroll', this.mousewheel);
        DomUtils.addEvent(this.canvasWraper, 'dragstart', this.canvasDragStart);
        DomUtils.addEvent(this.canvasWraper, 'drag', this.canvasDrag);
        DomUtils.addEvent(this.canvasWraper, 'dragend', this.canvasDragEnd);
    }
    private unbindEvent() {
        DomUtils.removeEvent(this.canvasWraper, 'mousewheel', this.mousewheel);
        DomUtils.removeEvent(this.canvasWraper, 'DOMMouseScroll', this.mousewheel);
        DomUtils.removeEvent(this.canvasWraper, 'dragstart', this.canvasDragStart);
        DomUtils.removeEvent(this.canvasWraper, 'drag', this.canvasDrag);
        DomUtils.removeEvent(this.canvasWraper, 'dragend', this.canvasDragEnd);
    }
    private mousewheel = (event: any) => {
        // up
        if(!this.diagram.freezeState) {
            let step = 0.005;
            let detail = event.detail != 0 ? -event.detail : event.wheelDelta;

            
            this.setZoom(this.diagram.getZoom() + (Math.min(Math.abs(detail), 6) * (detail < 0 ? -1 : 1)) * step);
        }
        
        event.preventDefault();
        
    }
    public setZoom(zoom: number) {

        if (this.canZoom(zoom)) {
            zoom = this.getSafeZoom(zoom)

            let canvasPosition = Object.assign({}, this.diagram.getPosition());
            canvasPosition.transform = `scale(${zoom})`;

            
            this.diagram.setZoom(this.zoom = zoom)
            this.diagram.setPosition(canvasPosition);

            

            this.canvas.style.transform = canvasPosition.transform;
            this.canvas.style.transformOrigin = 'center'
        }
    }
    public canZoom(zoom: number) {
       return true;
        // return this.canvas.offsetWidth * zoom > 400;
    }
    public getSafeZoom(zoom: number) {
        return Math.min(this.zoomMaxNumber, Math.max(this.zoomMinNumber, zoom))
    }
    private setPosition(postion: any) {

        this.canvas.style.left = postion.left + 'px';
        this.canvas.style.top = postion.top + 'px';

        if (postion.transform) {
            this.canvas.style.transform = postion.transform;
        }
        this.diagram.setPosition(postion);
    }
    private canvasDrag = (event: any) => {

        if (event.screenX && event.screenY) {
            let startPos = this.dragPos;
            let pageX = event.pageX - startPos.pageX;
            let pageY = event.pageY - startPos.pageY;

            let canvasPosition = {
                left: this.canvasPosition.left + pageX,
                top: this.canvasPosition.top + pageY,
                transform: `scale(${this.zoom})`
            };


            this.setPosition(this.canvasPositionDraging = canvasPosition);
        }
        //event.preventDefault();
    }

    private canvasDragEnd = (event: any) => {

        this.diagram.setPosition(this.canvasPositionDraging)
    }
    private canvasDragStart = (event: any) => {

        event.dataTransfer.setDragImage(IMAGE_DRAG, 2, 2);

        this.dragPos = {
            pageX: event.pageX,
            pageY: event.pageY
        };

        this.canvasPosition = this.diagram.getPosition();
    }
    public destroy() {
        this.unbindEvent()
    }
}