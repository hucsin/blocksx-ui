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
import { addEvent, removeEvent } from './events';

const IMAGE_DRAG = new Image;
IMAGE_DRAG.src="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==";


export default class CanvasManage {
    private diagram: any;
    private canvasWraper?: any;
    private dragPos: any;
    private canvas?: any;
    private canvasPosition:any;
    private canvasPositionDraging: any;
    private zoom?: any;

    private zoomMaxNumber: number;
    private zoomMinNumber: number;

    public constructor(diagram: any) {
        this.diagram = diagram;
        this.canvasPosition = {
            left: 0,
            top: 0
        };
        this.zoom = 1;
        this.zoomMinNumber = 0.3;
        this.zoomMaxNumber = 2;
    }

    public init() {

        this.canvas = this.diagram.canvas;
        this.canvasWraper = this.diagram.canvas.parentNode;

        this.bindEvent();
    }
    private bindEvent() {

        addEvent(this.canvasWraper, 'mousewheel', this.mousewheel);
        addEvent(this.canvasWraper, 'DOMMouseScroll', this.mousewheel);
        addEvent(this.canvasWraper, 'dragstart', this.canvasDragStart);
        addEvent(this.canvasWraper, 'drag', this.canvasDrag);
        addEvent(this.canvasWraper, 'dragend', this.canvasDragEnd);
    }
    private unbindEvent() {
        removeEvent(this.canvasWraper, 'mousewheel', this.mousewheel);
        removeEvent(this.canvasWraper, 'DOMMouseScroll', this.mousewheel);
        removeEvent(this.canvasWraper, 'dragstart', this.canvasDragStart);
        removeEvent(this.canvasWraper, 'drag', this.canvasDrag);
        removeEvent(this.canvasWraper, 'dragend', this.canvasDragEnd);
    }
    private mousewheel =(event: any)=> {
        // up
        let step = 0.01;
        let detail = event.detail!= 0 ? -event.detail : event.wheelDelta;

        this.zoom += detail * step;
        this.setZoom(this.zoom);

        event.preventDefault();
    }
    public setZoom(zoom: number) {

        zoom = Math.min(this.zoomMaxNumber, Math.max(this.zoomMinNumber, zoom))

        let canvasPosition = Object.assign({} ,this.diagram.state.canvasPosition );
            canvasPosition.transform = `scale(${zoom})`;
        
        this.diagram.setState({
            canvasPosition,
            zoom: this.zoom = zoom
        });
        this.diagram.instance.setZoom(zoom);
    }
    private canvasDrag =(event: any)=> {

        if (event.screenX && event.screenY) {
            let startPos = this.dragPos;
            let pageX = event.pageX - startPos.pageX;
            let pageY = event.pageY - startPos.pageY;

            let canvasPosition = {
                left: this.canvasPosition.left + pageX,
                top: this.canvasPosition.top + pageY,
                transform: `scale(${this.zoom})`
            };

            this.canvas.style.left = canvasPosition.left +'px' ;
            this.canvas.style.top = canvasPosition.top + 'px';
            this.canvasPositionDraging = canvasPosition;
        }
        event.preventDefault();
    }
    private canvasDragEnd =(event: any)=> {

        this.diagram.setState({
            canvasPosition: this.canvasPositionDraging
        })
    }
    private canvasDragStart =(event:any)=> {
        console.log(event.target)
        
        event.dataTransfer.setDragImage(IMAGE_DRAG, 2,2);

        this.dragPos = {
            pageX: event.pageX,
            pageY: event.pageY
        };

        this.canvasPosition = this.diagram.state.canvasPosition;
    }
    public destroy() {
        this.unbindEvent()
    }
}