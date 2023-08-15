import { utils } from '@blocksx/core';
import StateModel from '../../StateX/Model';
import StateX from '../../StateX/StateX';

type LayoutType = 'show' | 'hide' | 'fold' | 'extend'

interface LayoutState {
    LeftChinampaDisplay?: LayoutType; // 左浮岛显示开关
    RightChinampaDisplay?: LayoutType;  // 右浮岛显示开关
    LeftChinampaWidth?: number;
    ResourceDisplay?: LayoutType; // 资源区显示开关
    ResourceWidth?: number;
    ProductHeight?: number;
    WorkspaceDisplay?: LayoutType; // 工作区显示开关
    FeedbackDisplay?: LayoutType; // 反馈区显示开关
    FeedbackHeight?: number;
    StatusBarDisplay?:LayoutType;
    StatusBarHeight?: number;
}

const getDefaultHeight = (dir: number, max:number)=> {
    let height: number = window.screen.height;
    return Math.max(50, Math.min(height, max))
}
/**
 * 全局状态类,只能实例化一次
 */
export default class EditorLayoutState extends StateModel<LayoutState> {
    public constructor(state: LayoutState) {
        super(Object.assign({
            LeftChinampaDisplay: 'show',
            LeftChinampaWidth: 45,
            RightChinampaWidth: 35,
            RightChinampaDisplay: 'hide',
            ResourceDisplay: 'show',
            WorkspaceDisplay: 'show',
            FeedbackDisplay: 'show',
            StatusBarDisplay: 'show',
            ResourceWidth: 256,
            ProductHeight: getDefaultHeight(0.3, 190),
            FeedbackHeight: getDefaultHeight(0.2, 150),
            StatusBarHeight: 25
        }, state || {}));
    }
    public resetFeedbackHeight(height: number) {
        this.setState({
            FeedbackHeight: height
        })
    }
    public resetResourceWidth(width: number) {
        this.setState({
            ResourceWidth: width
        })
    }
    public resetProductHeight(height: number) {
        this.setState({
            ProductHeight: height
        })
    }
    public toggle(stateKey:string, type?:LayoutType) {
        let display:LayoutType  = this.state[stateKey];

        if (utils.isUndefined(type)) {
            display = display === 'show' ? 'hide' : 'show';
        } else {
            display = type as any;
        }
        
        this.setState({
            [`${stateKey}`]: display
        } as any)
    }
    public showResourceExtend() {
        this.toggle('ResourceDisplay', 'extend')
    }
    public showResource() {
        this.toggle('ResourceDisplay', 'show')
    }
    public foldResource() {
        this.toggle('ResourceDisplay', 'fold')
    }

    /**
     * 显示或则隐藏 反馈区
     * @param show 
     */
    public toggleFeedbackDisplay(type?:LayoutType) {
        this.toggle('FeedbackDisplay', type)
    }
    /**
     * 显示或则隐藏右边浮岛
     * @param show 
     */
    public toggleRightChinampa(type?:LayoutType) {
        this.toggle('RightChinampaDisplay', type)
    }

}

StateX.registerModel(new EditorLayoutState({}))