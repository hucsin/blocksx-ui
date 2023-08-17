import React from 'react';
import { pluginManager } from '@blocksx-ui/Editor/core/manager/index';
import { Divider } from 'antd';

import './style.scss';

interface EditorToolbarProps {
    direction: 'vertical' | 'horizontal',
    toolbar: string,
    namespace?: string,
    style?: any
}

export default class EditorToolbar extends React.Component<EditorToolbarProps> {
    private beforeWidget: any[];
    private afterWidget: any[]
    public constructor(props:EditorToolbarProps) {
        super(props);
        
        this.beforeWidget = pluginManager.getWidgetByDirection(this.props.toolbar, ['left', 'top']);
        this.afterWidget = pluginManager.getWidgetByDirection(this.props.toolbar, ['bottom', 'right'])
        
    }

    public renderBeforeWidget() {
        return this.beforeWidget.map((it, index) => {
            return it ? it.render({namespace: this.props.namespace}, index) : <Divider key={'c'+index} type="vertical" />;
        })
    }
    public renderAfterWidget() {
        return this.afterWidget.map((it, index) => {
            return it ? it.render({namespace: this.props.namespace}, index) : <Divider key={'c'+index} type="vertical" />;
        })
    }
    public render() {
        return (
            <div className={`editor-toolbar editor-toolbar-${this.props.direction}`} style={this.props.style}>
                {this.beforeWidget ? <div className='editor-toolbar-before'>{this.renderBeforeWidget()}</div> : null}
                {this.afterWidget ? <div className='editor-toolbar-after'>{this.renderAfterWidget()}</div> : null}
            </div>
        )
    }
}