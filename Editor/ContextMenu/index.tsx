/**
 * 右键菜单
 */
 import React from 'react';
 import ReactDOM from 'react-dom';
 import * as ICONS from '../../Icons';
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
 import "react-contexify/dist/ReactContexify.css";

 import "./style.scss";

 interface ContextMenuProps {
    namespace: string;
 }

 export default class ContextMenu extends StateComponent<ContextMenuProps, {
    menu: any[];
    payload: any
 }> {
    public static contextMenu: any = {};
    public static showContextMenu = (namespace:string, event: any, payload: any) => {
        if (ContextMenu.contextMenu[namespace]) {

            ContextMenu.contextMenu[namespace].context.resetMenuByContext(payload, ()=> {

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
    private namespace: string;

    public constructor(props: ContextMenuProps) {
        super(props);

        this.namespace = [this.props.namespace, 'CONTEXTMENU'].join('.');
        // 从插件里面获取
        this.state = {
            payload: {},
            menu: []// pluginManager.getContextMenu(this.namespace) || []
        }

        ContextMenu.setContextMenu(props.namespace, this);

    }
    public resetMenuByContext(payload: any, fn: Function) {
        let menu = pluginManager.getContextMenu(this.namespace, payload);
        if (menu.length> 0) {
            this.setState({

                payload,
                menu: menu
            })

            fn()
        }
    }
    public renderChildrenMenu(menu?: any) {
        let renderMenu: any[] = menu || this.state.menu;
        
        return renderMenu.map((it,i) => {
            // subitem
            if (it.children) {
                return (
                    <Submenu key={i} label={this.renderTitle(it)}>{this.renderChildrenMenu(it.children)}</Submenu>
                )
            } else {
                if (it.type == 'divider') {
                    return <Separator key={i}/>
                }
                return (
                    <Item onClick={()=> {
                        // test    WORKSPACE.PANEL.CODER.META
                        // doAction
                        
                        pluginManager.doContextMenuAction(this, it.namespace || this.namespace, it.key, this.state.payload)
                    }} key={it.key}>{this.renderTitle(it)}</Item>
                )
            }
        })
    }
    public renderTitle(it) {
        return (
            <>
                {this.renderIcon(it)}
                {it.name}
            </>
        )
    }
    public renderIcon(it: any) {
        if (it.icon) {
            if (ICONS[it.icon]) {
                let ViewIcon: any = ICONS[it.icon];
                return <ViewIcon />
            }
        }
    }
    public render() {
        return (
            <>
                {
                    ReactDOM.createPortal(<Menu id={this.props.namespace}>
                        {this.renderChildrenMenu()}
                    </Menu>, document.body)
                }
            </>
            
        )
    }
 }