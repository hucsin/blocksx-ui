import PluginBase from '@blocksx/ui/Editor/core/Plugin';
import { StateComponent, StateX } from '@blocksx/ui/StateX/index';
import React from 'react';
import { Dropdown, Button } from 'antd';
import Widget, { WidgetDirectionType } from '@blocksx/ui/Editor/core/Widget';

import { EditorWorkspaceState } from '@blocksx/ui/Editor/states';

import { Down } from '@blocksx/ui/Icons'


class CoderRouterComponent extends StateComponent<{}> {

    private workspaceState: EditorWorkspaceState = StateX.findModel(EditorWorkspaceState);
    
    private getDropdownMenu(children: any[], parentKeypath?:any, parent?: any): any {
        
        return children.map((it, index:number)=> {
            let hasChildren: boolean = it.children && it.children.length;
            let key = it.type + it.name + index;
            return {
                key: [parentKeypath || '', key].join('.'),
                label: it.name,
                onClick:(e)=> {
                    if (!hasChildren) {
                        let currentPanel: any = this.workspaceState.getCurrentPanel();
                        
                        currentPanel.setState({
                            router: parent ? [parent, it] : [it]
                        })
                    }
                },
                children: hasChildren ? this.getDropdownMenu(it.children, key, it) : null
            }
        })
    }
    public render() {
        let currentPanel: any = this.workspaceState.getCurrentPanel();
        
        if (currentPanel ) {
            let { /*root = {}, */children=[] } = currentPanel.getProp('router') || {};
            let router: any = currentPanel.getState('router') || [];
            
            return (
                <Dropdown 
                    
                    menu={{items: this.getDropdownMenu(children)}}
                    trigger={['click']}
                    overlayClassName="mini-dropdown"
                
                >
                    <Button size='small' type="text" className='workspace-coder-router' key={'coder-router'}>
                        {this.renderCurrentPath(router, children)}
                        <Down/>
                    </Button>
                </Dropdown>
            )
        }
    }

    private renderCurrentPath(current: any[], children: any[]) {

        if (current && current.length) {
            return current.map(it=> {
                
                return it.name;
            }).join('.')
        } else {
            return '<schema>'
        }
    }
}


class CoderRouterWidget extends Widget {
    public text: string =  '';
    public placeholder: string = '';
    public index:number = 0;
    public direction: WidgetDirectionType = 'right';

    public renderChildren(props:any, key: string):React.ReactNode  {
        return <CoderRouterComponent key={key}/>
    }

}

export default class CoderRouter extends PluginBase {
    public constructor() {
        super();
        this.registerWidget('rightToolbar', new CoderRouterWidget())
    }
}