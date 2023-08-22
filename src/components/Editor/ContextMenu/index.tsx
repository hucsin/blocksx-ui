/**
 * 右键菜单
 */
 import React from 'react';
 import ReactDOM from 'react-dom';
 import { utils } from '@blocksx/core';

 import {
    Menu,
    Item,
    Separator,
    Submenu,
    useContextMenu,
  } from "react-contexify";
 
 import { StateX, StateComponent } from '../../StateX';

 import { pluginManager } from '../core/manager/index';
 import Workspace from '../states/Workspace';
 import MetaData from '../states/MetaData';
 import "react-contexify/dist/ReactContexify.css";

 import "./style.scss";

 interface ContextMenuProps {
    namespace: string;
 }

 export default class ContextMenu extends StateComponent<ContextMenuProps, {
    menu: any[]
 }> {
    public static contextMenu: any = {};
    public static showContextMenu = (namespace:string, event: any, context: any) => {
        if (ContextMenu.contextMenu[namespace]) {
            ContextMenu.contextMenu[namespace].context.resetMenuByContext(context, ()=> {

                return ContextMenu.contextMenu[namespace].menu.show({
                    event: event
                })
            })
        }
    }

    public static setContextMenu = (namespace: string, context: any) => {
        ContextMenu.contextMenu[namespace] = {
            context: context,
            menu: useContextMenu({
                id: namespace
            })
        }
    }

    public constructor(props: ContextMenuProps) {
        super(props);

        ContextMenu.setContextMenu(props.namespace, this);
        // 从插件里面获取
        this.state = {
            menu:  pluginManager.getContextMenu(['RESOURCETREE', this.props.namespace, 'CONTEXTMENU']) || []
        }
    }
    public resetMenuByContext(context: any, fn: Function) {
        fn()
    }
    public renderChildrenMenu(menu?: any) {
        let renderMenu: any[] = menu || this.state.menu;
        
        return renderMenu.map((it,i) => {
            if (it ) {
                // subitem
                if (it.children) {
                    return (
                        <Submenu key={i} label={it.name}>{this.renderChildrenMenu(it.children)}</Submenu>
                    )
                } else {
                    return (
                        <Item onClick={()=> {
                            // test                                 WORKSPACE.PANEL.CODER.META

                            let meta: any = MetaData.findMetaModel('WORKSPACE.PANEL.CODER.META');
                            console.log(meta)
                            if (meta) {
                                let mode:any = StateX.findModel(Workspace);
                                let uniq: any = utils.uniq();
                                
                                mode.open(new meta(uniq, {
                                    key: uniq,
                                    name: uniq
                                }, {}))
                            }

                        }} key={it.key}>{it.name}</Item>
                    )
                }
            } else {
                return <Separator key={i}/>
            }
        })
    }
    public render() {
        return (
            ReactDOM.createPortal(<Menu id={this.props.namespace}>
                {this.renderChildrenMenu()}
            </Menu>, document.body)
        )
    }
 }