/**
 * 右键菜单
 */
 import React from 'react';
 import {
    Menu,
    Item,
    Separator,
    Submenu,
    useContextMenu,
  } from "react-contexify";
 
 import { StateX, StateComponent } from '../StateX';

 import { pluginManager } from './manager/index';
 import PluginBase, {ContextMenuItem } from './core/Plugin';
 import "react-contexify/dist/ReactContexify.css";


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
        return renderMenu.map((it) => {
            if (it ) {
                // subitem
                if (it.children) {
                    return (
                        <Submenu label={it.name}>{this.renderChildrenMenu(it.children)}</Submenu>
                    )
                } else {
                    return (
                        <Item>{it.name}</Item>
                    )
                }
            } else {
                return <Separator/>
            }
        })
    }
    public render() {
        return (
            <Menu id={this.props.namespace}>
                {this.renderChildrenMenu()}
            </Menu>
        )
    }
 }