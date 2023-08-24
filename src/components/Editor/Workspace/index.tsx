import React from 'react';
import { Tabs } from 'antd';
import classnames from 'classnames';
import { utils } from '@blocksx/core';

import { pluginManager } from '@blocksx/ui/Editor/core/manager/index';
import { StateX, StateComponent } from '@blocksx/ui/StateX';
import EditorWorkspaceState from '@blocksx/ui/Editor/states/Workspace';

import { CloseCircleFilled, CloseOutlined, TableOutlined } from '@blocksx/ui/Icons';

import './style.scss';
import './panel';


interface EditorWorkspaceProps {

}

export default class EditorWorkspace extends StateComponent<EditorWorkspaceProps, {}> {

    private workspaceState: any = StateX.findModel(EditorWorkspaceState);
    public constructor(props: EditorWorkspaceProps) {
        super(props);
        this.workspaceState.initWorkspace();
    }

    public renderPanelChildren(it: any) {
        let plugin: any = pluginManager.find(['WORKSPACE','PANEL', it.config('type')]);
        if (plugin) {
            if (utils.isArray(plugin)) {
                return plugin[0].render(it, it.config('key'))
            }
            
            return plugin.render(it, it.config('key'))
        }

        return `Please set up workspace component ${it.type}, eg. WORKSPACE.PANEL.${it.config('type')}`
    }
    public renderCloseIcon(it: any) {
        return (
            <span className={classnames({
                'workspace-tab-close': true,
                'workspace-tab-changed': this.workspaceState.isChanged(it.key)
            })}>
                <CloseCircleFilled/>
                <CloseOutlined/>
            </span>
        )
    }
    public renderLabel(context: any) {
        return (
            <span>
                <TableOutlined/>
                {context.config('name')}
            </span>
        )
    }
    public renderChildren() {
        return this.workspaceState.getItems().map((it) => {
            return {
                label: this.renderLabel(it),
                key: it.config('key'),
                children: this.renderPanelChildren(it),
                closeIcon: this.renderCloseIcon(it)
            }
        })
    }
    public render() {
        return (
            <div className='workspace-wrapper'>
                <Tabs
                    hideAdd
                    animated={false}
                    className={classnames({
                        'workspace-tab-only-one': this.workspaceState.getItems().length == 1
                    })}
                    type="editable-card"
                    activeKey={this.workspaceState.getCurrentKey()}
                    items={this.renderChildren()}
                    onChange={(activeKey)=> {
                        this.workspaceState.setCurrentKey(activeKey)
                    }}
                    onEdit={(e)=>{
                        this.workspaceState.remove(e)
                    }}
                />
            </div>
        )
    }
}