import React from 'react';
import { Tabs, Table } from 'antd';
import { StateX, StateComponent } from '@blocksx-ui/StateX/index';
import { pluginManager  } from '@blocksx-ui/Editor/core/manager';
import { utils } from '@blocksx/core';
import { EditorWorkspaceState, EditorFeedbackState, EditorLayoutState } from '@blocksx-ui/Editor/states';
import './style.scss';


export default class EditorFeedback extends StateComponent<{}>{
    private workspaceState: EditorWorkspaceState ;

    public constructor(props) {
        super(props);
        this.workspaceState = StateX.findModel(EditorWorkspaceState);
    }
    
    public renderPanelLabel(item: any) {
        return item.config('name')
    }
    public renderPanelChildren(it: any) {
        let plugin: any = pluginManager.find(['FEEDBACK','PANEL', it.config('type')]);

        if (plugin) {
            if (utils.isArray(plugin)) {
                return plugin[0].render(it, it.key)
            }
            
            return plugin.render(it, it.key)
        }

        return `Please set up feedback component ${it.type}, eg. FEEDBACK.PANEL.${it.type}`
    }
    public renderChildren() {
        let feedback: EditorFeedbackState = this.workspaceState.getCurrentFeedback();
        console.log(feedback, 'feedback-wraper')
        if (feedback) {
            
            return feedback.getItems().map((it: any) => {
                return {
                    key: it.config('key') || it.namespace,
                    label: this.renderPanelLabel(it), 
                    children: this.renderPanelChildren(it)
                }
            })
        }
    }
    
    public render() {
        return (
            <div className='feedback-wrapper'>
                <Tabs
                    hideAdd
                    size="small"
                    onChange={()=>{}}
                    type="editable-card"
                    onEdit={()=> {}}
                    items={this.renderChildren()}
                />
            </div>
        )
    }
}