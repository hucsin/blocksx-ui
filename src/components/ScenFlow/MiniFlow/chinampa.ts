import * as DomUtils  from '../../utils/dom';

export default class Chinampa {
    // private destoryPanel: any;
    private unlinkPanel: any;
    private unlinkPosition: string;

    private panel: any;
    private hitRect: any;
    private panelRect: any;
    private canvas: any;
    private canvasRect: any;
    private miniFlow: any;

    private inPanel: boolean;
    private inTime: number;
    private timer: any;
    private hitStep: number;
    private inLeftPanel: any;
    private canUnlink:boolean;

    public constructor(miniFlow: any, panel: any, destoryPanel: any, unlinkPanel: any) {
        this.panel = panel;
        // this.destoryPanel = destoryPanel;
        this.unlinkPanel = unlinkPanel;

        this.canvas = this.panel.parentNode;

        this.miniFlow = miniFlow;

        this.bindEvent();
    }
    private showPanel() {

        DomUtils.addClass(this.panel, 'chinampa-show')

    }
    private hidePanel() {
        DomUtils.removeClass(this.panel, 'chinampa-show')
    }
    private calculatedSize() {

        this.panelRect = this.panel.getBoundingClientRect();
        this.resetHitRect();
    }
    private resetHitRect() {
        let hitItem: any = this.panel.getElementsByClassName('chinampa-item');
        this.hitRect = hitItem[0].getBoundingClientRect()
    }
    private isInRect(centerXY: any, rect: any) {
        let offsetLeft: number = centerXY.left - rect.left //+ this.canvasRect.left ;
        let offsetTop: number = centerXY.top - rect.top// + this.canvasRect.top ;

        return offsetLeft - 20 > 0
            && offsetLeft < rect.width + 40
            && offsetTop - 20 > 0 && offsetTop < rect.height + 40;
    }
    private hitDestoryOrUnlink(centerPos: any) {


        // 鼠标在容器内
        if (centerPos.left > this.hitRect.left && centerPos.left < (this.hitRect.left + this.hitRect.width)) {
            /*
            if (centerPos.left < this.hitRect.left + 38) {
                this.unlinkPosition = 'left';
            } else {
                if (centerPos.left < this.hitRect.left + this.hitRect.width - 38) {
                    this.unlinkPosition = 'middle';
                } else {
                    this.unlinkPosition = 'right'
                }
            }*/
            this.unlinkPosition = 'middle';
        } else {
            this.unlinkPosition = ''
        }


        // }
        if (!this.timer) {
            this.hitStep = 0;
            this.resetTimer();


            this.hideDestoryOrUnlink();
            this.removePanelFlicker()
            // destory
            DomUtils.addClass(this.unlinkPanel, 'chinampa-actived')
        } else {
            return;
        }

    }
    private resetTimer() {
        this.inTime = new Date().getTime();

        if (this.timer) {
            clearTimeout(this.timer);
        }

        this.timer = setTimeout(() => {
            // 第一次命中,添加闪烁动画
            this.timer = null;
            
            if (++this.hitStep < 2) {
                this.removePanelFlicker(true);
                this.addPanelFlicker();
                this.resetTimer();
            } else {
                if (this.unlinkPosition) {
                    this.miniFlow.dropConnectorByDragNode(this.unlinkPosition)
                }

            }
        }, this.hitStep < 1 ? 1000 : 1000)
    }
    private addPanelFlicker() {
        if (this.unlinkPosition) {
            DomUtils.addClass(this.unlinkPanel, 'chinampa-actived-animation')
        }
    }
    private removePanelFlicker(depend?: boolean) {
        DomUtils.removeClass(this.unlinkPanel, 'chinampa-actived-animation');
    }
    private hideDestoryOrUnlink() {
        DomUtils.removeClass(this.unlinkPanel, 'chinampa-actived');
        this.unlinkPosition = '';
    }
    private isCanUnlink() {
        return this.miniFlow.isSampleNode(this.miniFlow.dragNodeName)
    }
    private bindEvent() {

        this.miniFlow.on('onDragStart', () => {
            if (this.canUnlink = this.isCanUnlink()) {
                this.showPanel();
                this.calculatedSize();
                this.inPanel = false;
                
            }
        });

        this.miniFlow.on('onDragging', (pos) => {
            if (this.canUnlink) {
                let centerPos: any = {
                    left: pos.event.pageX,//+ this.miniFlow.getSize(true),
                    top: pos.event.pageY //+ this.miniFlow.getSize(true)
                };
                // 如果 是一个有多个节点的节点，无论前后都不能删除

                this.resetHitRect()
                if (this.isInRect(centerPos, this.panelRect)) {
                    if (!this.inPanel) {
                        DomUtils.addClass(this.panel, 'dragging-active');

                        this.inPanel = true;
                    }
                    this.hitDestoryOrUnlink(centerPos);
                } else {
                    DomUtils.removeClass(this.panel, 'dragging-active');
                    this.hideDestoryOrUnlink();
                    this.removePanelFlicker();
                    this.inLeftPanel = -1;
                    this.inPanel = false;
                }
            }
        })

        this.miniFlow.on('onDragEnd', () => {
            if (this.canUnlink) {
                this.removePanelFlicker();
                this.hidePanel();
                this.distoryPanel();
                
                if (this.miniFlow.isAloneNode(this.miniFlow.dragNodeName)) {
                    // 删除 落单的元素    
                    this.miniFlow.deleteNodeByName(this.miniFlow.dragNodeName)
                }
            }
        })

    }

    private distoryPanel() {

        this.inPanel = false;
        DomUtils.removeClass(this.panel, 'scenflow-dragging-active');
        this.hideDestoryOrUnlink();
    }
}