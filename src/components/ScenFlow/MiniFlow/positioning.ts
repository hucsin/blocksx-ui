import { IRect, IPointCoord } from './typing';

export default class Positioning {
    private miniFlow: any;
    private canvasOriginalRect: IRect;
    private canvasScaleRect: IRect;
    private canvasScaleOffset: IPointCoord;

    public constructor(miniFlow: any) {
        this.miniFlow = miniFlow;
        this.resetRect();
    }
    private resetRect() {

        this.canvasOriginalRect =  this.miniFlow.cavnasWrapper.getBoundingClientRect();
        this.canvasScaleRect = this.miniFlow.canvas.getBoundingClientRect();
        this.canvasScaleOffset = {
            left: this.miniFlow.canvas.offsetLeft,
            top: this.miniFlow.canvas.offsetTop
        }
    }
    private getScaleCenterPoint() {
        return {
            left: this.canvasScaleRect.width / 2 ,
            top: this.canvasScaleRect.height / 2 
        }
    }
    private getOriginalCenterPoint() {
        return {
            left: this.canvasOriginalRect.width / 2,
            top: this.canvasOriginalRect.height / 2
        }
    }

    private getScalePointByOriginalPoint(point: IPointCoord) {
        let originalCenterPoint: IPointCoord = this.getOriginalCenterPoint();
        let scaleCenterPoint: IPointCoord = this.getScaleCenterPoint();

        let originalCenterLeftDistance: number = point.left - originalCenterPoint.left ;
        let originalCenterTopDistance: number =  point.top - originalCenterPoint.top ;
       
        return {
            left: scaleCenterPoint.left + (originalCenterLeftDistance) * this.miniFlow.getZoom(),
            top: scaleCenterPoint.top +  originalCenterTopDistance * this.miniFlow.getZoom()
        }

    } 
    private getOriginalPoint(pageX: number, pageY: number) {

        return {
            left: pageX - this.canvasOriginalRect.left ,
            top: pageY - this.canvasOriginalRect.top 
        }
    }
    public getOriginalShadowPointByPageXY(pageX: number, pageY: number) {

        this.resetRect();

        let originalPoint: IPointCoord = this.getOriginalPoint(pageX, pageY);
        let centerOriginalPoint: IPointCoord = this.getOriginalCenterPoint();

        originalPoint.left -=  (this.canvasScaleOffset.left) ;
        originalPoint.top -= this.canvasScaleOffset.top;

        let offsetLeft: number = ( originalPoint.left  - centerOriginalPoint.left) / this.miniFlow.getZoom() 
        let offsetTop: number = (originalPoint.top - centerOriginalPoint.top) / this.miniFlow.getZoom();
        
        return {
            left: centerOriginalPoint.left + offsetLeft ,
            top: centerOriginalPoint.top +offsetTop ,
        }
    }
}