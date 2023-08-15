import React from 'react';
import { StateX, StateComponent } from '../StateX';
import SplitPane, { Pane } from '../SplitPane';
import { EditorLayoutState } from './states';
import './style.scss';

interface EditorLayoutContainerProps {
    LeftChinampa: React.ReactNode,
    RightChinampa?: React.ReactNode,

    ResourceExtend?: React.ReactNode,
    Resource?: React.ReactNode,
    Product?: React.ReactNode,

    Workspace?: React.ReactNode,
    Feedback?: React.ReactNode,

    StatusBar?: React.ReactNode
}

export default class EditorLayoutContainer extends StateComponent<EditorLayoutContainerProps, {}> {
    public ListenModels: string[] = [];
    private layoutState: any = StateX.findModel(EditorLayoutState);

    public constructor(props: EditorLayoutContainer) {
        super(props);
    }

    public renderSplitPane(
        leftChildren: React.ReactNode,
        rightChildren: React.ReactNode,
        split: string,
        size: number,
        onChange?: any,
        primary?: boolean

    ): React.ReactNode {
        return (
            <SplitPane
                split={split}
                onChange={onChange ? (e) => {
                    onChange(e);
                } : undefined}
                size={size}
                primary={primary ? "second" : 'first'}
                resizerClassName={!onChange ? "layout-hide-resizer" : undefined}
            >
                <Pane>{leftChildren}</Pane>
                <Pane>{rightChildren}</Pane>
            </SplitPane>
        )
    }
    public renderRightWorkspace(): React.ReactNode {
        if (this.layoutState.state.FeedbackDisplay === 'hide') {
            return this.props.Workspace;

        } else {
            return this.renderSplitPane(
                this.props.Workspace,
                this.props.Feedback,
                'horizontal',
                this.layoutState.state.FeedbackHeight,
                (e) => {
                    this.layoutState.resetFeedbackHeight(e)
                },
                true
            )
        }
    }
    public renderRightChinampaWorkspace(): React.ReactNode {
        //  隐藏rightChinamap
        if (this.layoutState.state.RightChinampaDisplay == 'hide') {
            return this.renderRightWorkspace();
        } else {
            return this.renderSplitPane(
                this.renderRightWorkspace(),
                this.props.RightChinampa,
                'vertical',
                this.layoutState.state.RightChinampaWidth,
                null,
                true
            )
        }
    }

    public renderResource() {
        
        if (this.layoutState.state.ResourceDisplay === 'extend') {

            return this.props.ResourceExtend;
        } else {
            return this.renderSplitPane(
                this.props.Resource,
                this.props.Product,
                'horizontal',
                this.layoutState.state.ProductHeight,
                (e) => {
                    this.layoutState.resetProductHeight(e);
                },
                true
            )
        }
    }

    public renderMain() {
        let ResourceDisplay:any = this.layoutState.state.ResourceDisplay;
        let ResourceFold:any = ResourceDisplay === 'fold';

        return (
            <div className='layout-container'>
                {this.renderSplitPane(
                    ResourceFold ? this.props.LeftChinampa : this.renderSplitPane(
                        this.props.LeftChinampa,
                        // 左边资源面板
                        this.renderResource(),
                        'vertical',
                        this.layoutState.state.LeftChinampaWidth
                    ),
                    this.renderRightChinampaWorkspace(),
                    'vertical',
                    ResourceFold ? this.layoutState.state.LeftChinampaWidth : this.layoutState.state.ResourceWidth,
                    (e) => {
                        this.layoutState.resetResourceWidth(e);
                    }
                )}
            </div>
        )
    }

    public render() {
        if (this.layoutState.StatusBarDisplay === 'hide') {
            
            return this.renderMain();
        } else {
            return this.renderSplitPane(
                this.renderMain(),
                this.props.StatusBar,
                'horizontal',
                this.layoutState.state.StatusBarHeight,
                null,
                true
            )
        }
    }
}