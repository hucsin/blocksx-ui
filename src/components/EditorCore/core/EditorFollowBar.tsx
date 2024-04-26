/**
 * editor 鼠标跟随
 */

import React from 'react';
import ReactDOM from 'react-dom';

import { PluginManager, StateComponent } from '@blocksx/ui'
import EditorContext from './EditorContext';

import './styles/followbar.scss'

export interface EditorFollowBarProps {
    namespace: string;
    toolbar: string;
    editorContext: EditorContext;
}

export default class EditorFollowBar extends StateComponent<EditorFollowBarProps, {
    lineNumber: number,
    lineWidth: number,
    scrollTop: number
}> {
    private offsetLeft: number = 40;
    private editorContext: EditorContext;
    private beforeWidget: any[];
    private afterWidget: any[];
    private leftDOM: HTMLDivElement | null;
    private rightDOM: HTMLDivElement | null;

    public constructor(props: EditorFollowBarProps) {
        super(props);


        let beforeWidget: any[] = PluginManager.getWidgetByDirection(this.props.toolbar, 'followbar',  ['left', 'top']);
        let afterWidget : any[] = PluginManager.getWidgetByDirection(this.props.toolbar, 'followbar', ['bottom', 'right']);

        this.beforeWidget =beforeWidget.length ? [beforeWidget.shift()] : [];
        this.afterWidget = beforeWidget.concat(afterWidget);

        this.editorContext = props.editorContext;

        this.state = {
            lineNumber: 0,
            lineWidth: 0,
            scrollTop: 0
        }
    }

    public componentDidMount() {
        this.bindMouseEvent();
    }
    public bindMouseEvent() {

        let runtimeContext: any = this.editorContext.runtimeContext;

        this.editorContext.registerEvent('onMouseMove', (event) => {
            if (runtimeContext.hasSelection()) {
                 // 获取鼠标位置所在的行号
                const position = event.target.position;
                if (position && runtimeContext.isInSelection(position)) {
                    const lineNumber = position.lineNumber;
                    // 获取当前行的文本内容
                    const lineWidth= runtimeContext.getLineWidth(lineNumber);
                    return this.setState({
                        lineNumber,
                        lineWidth,
                        scrollTop: this.editorContext.getScrollTop()
                    })
                }   
            }
            this.setState({
                scrollTop: 1e19
            })
        })

        this.editorContext.registerEvent('onMouseWheel', ()=> {
            let scrollTop: number = this.editorContext.getScrollTop();
            this.setState({
                scrollTop
            })
            if (this.leftDOM && this.rightDOM) {
                this.leftDOM.style.top = this.getOffsetTop(scrollTop) +'px';
                this.rightDOM.style.top = this.getOffsetTop(scrollTop) +'px';
            }
        })
    }
    private getOffsetTop(scrollTop?: number) {
        return (this.state.lineNumber+1) * 18 - ( scrollTop || this.state.scrollTop );
    }
    private getOffsetRightBarLeft() {
        return this.offsetLeft + 24 + Math.max(this.state.lineWidth + 20, 50)
    }
    public render() {
        let wrapper: any = this.editorContext.getEditorWrapper();
        let runtimeContext: any = this.editorContext.runtimeContext;
        
        if ( wrapper && runtimeContext.hasSelection()) {
            return (
                <>
                {this.beforeWidget.length>0 && ReactDOM.createPortal(
                    <div 
                        className='editor-followbar editor-followbar-left'
                        ref={dom => this.leftDOM = dom}
                        style={{
                            top: this.getOffsetTop(),
                            left: this.offsetLeft
                        }}
                    >
                        {PluginManager.renderWidget(this.props.namespace, this.beforeWidget, true)}
                    </div>,
                    wrapper
                )}

                {this.afterWidget.length>0 && ReactDOM.createPortal(
                    <div 
                        className='editor-followbar editor-followbar-right'
                        ref={dom => this.rightDOM = dom}
                        style={{
                            top: this.getOffsetTop(),
                            left: this.getOffsetRightBarLeft()
                        }}
                    >
                        {PluginManager.renderWidget(this.props.namespace, this.afterWidget, true)}
                    </div>,
                    wrapper
                )}
                </>
            )
        } else {
            return null;
        }
    }
}