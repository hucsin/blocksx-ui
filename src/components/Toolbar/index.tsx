import React from 'react';
import { PluginManager } from '../core/manager';
import { Divider } from 'antd';

import './style.scss';

interface EditorToolbarProps {
    direction: 'vertical' | 'horizontal',
    className?: string;
    toolbar: string,
    namespace?: string,
    style?: any
}

export default class Toolbar extends React.Component<EditorToolbarProps> {
    public static defaultProps = {
        direction: 'horizontal'
    }
    private beforeWidget: any[];
    private afterWidget: any[]
    public constructor(props:EditorToolbarProps) {
        super(props);
        
        this.beforeWidget = PluginManager.getWidgetByDirection(this.props.toolbar, 'toolbar',  ['left', 'top']);
        this.afterWidget = PluginManager.getWidgetByDirection(this.props.toolbar, 'toolbar', ['bottom', 'right'])
    }

    public renderBeforeWidget() {
        
        //return PluginManager.renderWidgetByDirection(this.props.toolbar, ['left', 'top'])
        return PluginManager.renderWidget(this.props.namespace, this.beforeWidget)
    }
    public renderAfterWidget() {

        return PluginManager.renderWidget(this.props.namespace, this.afterWidget)
    }

    public render() {
        return (
            <div className={`editor-toolbar editor-toolbar-${this.props.direction} ${this.props.className}`} style={this.props.style}>
                {this.beforeWidget ? <div className='editor-toolbar-before'>{this.renderBeforeWidget()}</div> : null}
                {this.afterWidget ? <div className='editor-toolbar-after'>{this.renderAfterWidget()}</div> : null}
            </div>
        )
    }
}