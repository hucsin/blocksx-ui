/**
 * 
 */
 import React from 'react';
 import { utils } from '@blocksx/core';
 import { Button, Dropdown, message } from 'antd';
 import { pluginManager,resourceManager } from '@blocksx/ui/Editor/core/manager/index';
 import { StateComponent, StateX } from '@blocksx/ui/StateX/index';
 import PluginBase from '@blocksx/ui/Editor/core/Plugin';
 import WidgetBase, { WidgetDirectionType } from '@blocksx/ui/Editor/core/Widget';
 import {  PlusOutlined } from '@blocksx/ui/Icons';
 import * as ICONS from '@blocksx/ui/Icons';

 import { 
    EditorResourceState, 
} from '@blocksx/ui/Editor/states';
 


pluginManager.registerContextMenu('RESOURCE.CREATEMENU', [
    { key: 'query', icon: 'Query', name: '查询窗口', action: "RESOURCE.OPEN.CODER" },
    { key: 'hr', type:'divider' },
    { key: 'datasource', icon: 'DsAdd', name: '数据源' }
])



 
 class ResourceCreateComponent extends StateComponent<{
    namespace: string;
    text: string
 }> {
    private resourceState: EditorResourceState = StateX.findModel(EditorResourceState, 'resource');
    private createNamespace: string = 'RESOURCE.CREATEMENU';
    public constructor(props) {
        super(props);
    }
    public onClick =()=> {
        //this.resourceState.reflushTree()
    }
    private renderMenu() {
        return this.washMenu(pluginManager.getContextMenu(this.createNamespace) || [])
    }
    private renderLabel(item: any) {
        let IconView: any = ICONS[item.icon] || null
        return  (
            <span>
                { IconView ? <IconView/> : null}
                {item.name}
            </span>
        )
    }
    private washMenu(items: any[]) {
        return items.map((it) => {
            return !it.type ? {
                key: it.key,
                label: this.renderLabel(it),
                onClick: (node, event) => {
                    if (it.action) {
                        pluginManager.doContextMenuAction(this, this.createNamespace, it.key, it)
                    }
                },
                children: it.children ? this.washMenu(it.children) : undefined
            }: {type: 'divider'}
        })
    }
    public render() {

        return (
            <Dropdown  
                trigger={['click']}
                overlayClassName="mini-dropdown"
                
                menu={{items: this.renderMenu()}}
            >
                <Button type="text" size="small" onClick={this.onClick} >
                    <PlusOutlined/>
                </Button>
            </Dropdown>
        )
    }
 }
 

 class ResourceCreateWidget extends WidgetBase {
    public text: string =  '';
    public placeholder: string = '新增操作对象';
    public index:number = 2;
    public direction: WidgetDirectionType = 'left';

    public constructor() {
        super()
        

    }

    public renderChildren(props:any, key: string):React.ReactNode  {
        return (<ResourceCreateComponent {...props} key={key} text={this.text}/>)
    }

}




class ResourceCopyComponent extends StateComponent<{
    namespace: string;
    text: string
 }> {
    private resourceState: EditorResourceState = StateX.findModel(EditorResourceState, 'resource');
    
    public constructor(props) {
        super(props);
    }
    public onClick =()=> {
        //this.resourceState.reflushTree()
    }
    
    public render() {

        return (
                <Button type="text" size="small" onClick={this.onClick} >
                    <PlusOutlined/>
                </Button>
        )
    }
 }
 

 class ResourceCopyWidget extends WidgetBase {
    public text: string =  '';
    public placeholder: string = '复制资源';
    public index:number = 2;
    public direction: WidgetDirectionType = 'left';


    public renderChildren(props:any, key: string):React.ReactNode  {
        return (<ResourceCopyComponent {...props} key={key} text={this.text}/>)
    }

}

 export default class CreateResourcePlugin extends PluginBase {
    public constructor() {
        super();
        this.registerWidget('toolbar', new ResourceCreateWidget())
    }
}