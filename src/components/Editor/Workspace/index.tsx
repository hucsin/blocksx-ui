import React from 'react';
import { Tabs } from 'antd';
import { utils } from '@blocksx/core';

import { pluginManager } from '../core/manager/index';
import { StateX, StateComponent } from '../../StateX';
import EditorWorkspaceState from '../states/Workspace';
import './style.scss';
import './plugin/boot';

interface EditorWorkspaceProps {

}

export default class EditorWorkspace extends StateComponent<EditorWorkspaceProps, {}> {

    private workspaceState: any = StateX.findModel(EditorWorkspaceState);
    public constructor(props: EditorWorkspaceProps) {
        super(props);


    }

    public renderTabChildren(it: any) {
        let plugin: any = pluginManager.find(['WORKSPACE','PANEL', it.type]);

        if (plugin) {
            if (utils.isArray(plugin)) {
                return plugin[0].render(it.data)
            }
            return plugin.render(it.data)
        }

        return `Please set up workspace component ${it.type}, eg. WORKSPACE.PANEL.${it.type}`
    }

    public renderChildren() {
        return this.workspaceState.getItems().map((it) => {
            return {
                label: it.name,
                key: it.key,
                children: this.renderTabChildren(it)
            }
        })
    }
    public render() {
        return (
            <div className='workspace-wrapper'>
                <Tabs
                    hideAdd
                    animated={false}
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