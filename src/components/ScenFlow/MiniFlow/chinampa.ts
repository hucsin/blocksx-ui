import { addClass, removeClass } from '../../utils/dom'

export default class Chinampa {
    private destoryPanel: any;
    private unlinkPanel: any;
    private unlinkPosition: string;

    private panel: any;
    private panelRect: any;
    private canvas: any ;
    private canvasRect: any;
    private miniFlow: any;

    private inPanel: boolean;
    private inTime: number;
    private timer: any;
    private hitStep: number;
    private inLeftPanel: any;

    public constructor(miniFlow: any, panel: any, destoryPanel: any, unlinkPanel: any) {
        this.panel = panel;
        this.destoryPanel = destoryPanel;
        this.unlinkPanel = unlinkPanel;

        this.canvas = this.panel.parentNode;

        this.miniFlow = miniFlow;

        this.bindEvent();
    }
    private showPanel() {

        addClass(this.panel, 'chinampa-show')

    }
    private hidePanel() {
        removeClass(this.panel, 'chinampa-show')
    }
    private calculatedSize() {
        this.panelRect = this.panel.getBoundingClientRect();
        this.canvasRect = this.canvas.getBoundingClientRect();
    }
    private isInRect(centerXY: any, rect: any) {
        let offsetLeft:number = centerXY.left - rect.left //+ this.canvasRect.left ;
        let offsetTop:number = centerXY.top - rect.top// + this.canvasRect.top ;
        
        return offsetLeft -20 > 0 
            && offsetLeft < rect.width  +40
            && offsetTop -20> 0 && offsetTop < rect.height + 40;
    }
    private hitDestoryOrUnlink(centerPos: any) {
        let halfPanel:number = this.panelRect.left + this.panelRect.width/2;
        let inLeftPanel = halfPanel > centerPos.left;
        
        // 计算在right的位置
        if (inLeftPanel === false) {
            let unlinkPositon: number = halfPanel + 8 + 30;
            this.unlinkPosition = centerPos.left < unlinkPositon ? 'left' :  centerPos.left < unlinkPositon + 60 ? 'middle' : 'right';
        }

        if (inLeftPanel != this.inLeftPanel) {
            this.inLeftPanel = inLeftPanel;
            this.hitStep = 0;
            this.resetTimer();
        }  else {
            if (!this.timer) {
                this.hitStep = 0;
                this.resetTimer();
            } else {
                return;
            }
        }


        this.hideDestoryOrUnlink();
        this.removePanelFlicker()
        // destory
        addClass(this.inLeftPanel ? this.destoryPanel : this.unlinkPanel, 'chinampa-actived')
    }
    private resetTimer() {
        this.inTime = new Date().getTime();

        if (this.timer) {
            clearTimeout(this.timer);
        }

        this.timer = setTimeout(() => {
            // 第一次命中,添加闪烁动画
            this.timer = null;
            if (++this.hitStep <2) {
                this.removePanelFlicker(true);
                this.addPanelFlicker();
                this.resetTimer();
            } else {
                // 第二次命中删除或者, unlink 的时候处理
                if (false === this.inLeftPanel) {
                    
                    this.miniFlow.dropConnectorByDragNode(this.unlinkPosition);
                }
            }
        }, this.hitStep < 1 ? 1000 : 1000)
    }
    private addPanelFlicker() {
        if (this.inLeftPanel != -1) {

            addClass(this.inLeftPanel ? this.destoryPanel : this.unlinkPanel , 'chinampa-actived-animation')
        }
    }
    private removePanelFlicker(depend?: boolean) {
        (!depend || this.inLeftPanel !== false) && removeClass(this.unlinkPanel, 'chinampa-actived-animation');
        (!depend || this.inLeftPanel !== true) && removeClass(this.destoryPanel, 'chinampa-actived-animation');
    }
    private hideDestoryOrUnlink() {
        removeClass(this.unlinkPanel, 'chinampa-actived');
        removeClass(this.destoryPanel, 'chinampa-actived')
    }
    private bindEvent() {

        this.miniFlow.on('onDragStart', () => {
            this.showPanel();
            this.calculatedSize();
            this.inPanel = false;
        });

        this.miniFlow.on('onDragging', (pos) => {
            
            let centerPos: any = {
                left:pos.event.pageX ,//+ this.miniFlow.getSize(true),
                top: pos.event.pageY //+ this.miniFlow.getSize(true)
            };
            let inPanel: any = this.isInRect(centerPos, this.panelRect)

            if (inPanel) {
                if (!this.inPanel){
                    addClass(this.panel, 'dragging-active');
                    
                    this.inPanel = true;
                } 
                this.hitDestoryOrUnlink(centerPos);
            } else {
                removeClass(this.panel, 'dragging-active');
                this.hideDestoryOrUnlink();
                this.removePanelFlicker();
                this.inLeftPanel = -1;
                this.inPanel = false;
            }
        })

        this.miniFlow.on('onDragEnd', () => {
            this.removePanelFlicker();
            this.hidePanel();

            if (this.inPanel) {
                if (this.inLeftPanel == true) {
                    if (this.hitStep>0) {
                        //  删除
                        
                        return this.miniFlow.dropDragNode(() => {
                            this.distoryPanel();
                        });
                    }
                }
            }
            
            this.distoryPanel();
        })
    
    }

    private distoryPanel() {
        
        this.inPanel = false;
        this.inLeftPanel = -1;
        removeClass(this.panel, 'scenflow-dragging-active');
        this.hideDestoryOrUnlink();
    }
}