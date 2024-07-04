import React from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import { message as AntMessage } from 'antd';

import { Pick, Icons, PluginManager , ContextMenuManger  } from '@blocksx/ui';
import { utils } from '@blocksx/core';
import i18n from '@blocksx/i18n';
import { monaco } from 'react-monaco-editor';

import {
    Menu as ContexifyMenu,
    Item as ContexifyItem,
    Separator as ContexifySeparator,
    Submenu as ContexifySubmenu,
    useContextMenu,
} from "react-contexify";
import { ContextMenuItem } from './typing';
import UIUtils from '../utils/index';
import TablerUtils from '../utils/tool';


import "react-contexify/dist/ReactContexify.css";
import "./style.scss";




interface ContextMenuProps {
    children?: any;
    menu?: any;
    namespace: string;
    onMenuClick?: Function;
}
interface ContextMenuState {
    namespace: string;
    menu: ContextMenuItem[],
    open:boolean;
    dangerMessage: string;
    payload: any;
    rowItem: any;
}

export default class ContextMenu extends React.Component<ContextMenuProps, ContextMenuState> {

    private defaultMessage: string = i18n.t('Do you want to delete this module');
    public static contextMenu: any = {};
    public static showContextMenu = (namespace:string, event: any, payload: any) => {
        
        //let truenamespace = ContextMenu.getTrueNamespace(namespace);

        if (namespace.indexOf('CONTEXTMENU') ==-1) {
            namespace = [namespace, 'CONTEXTMENU'].join('.')
        }
        
        if (ContextMenu.contextMenu[namespace]) {

            ContextMenu.contextMenu[namespace].context.resetMenuByContext(payload, ()=> {
                return ContextMenu.contextMenu[namespace].menu.show({
                    event: event
                })
            })
        }
    }

    public static setContextMenu = (namespace: string, context: any) => {

        //namespace = ContextMenu.getTrueNamespace(namespace);

        ContextMenu.contextMenu[namespace] = {
            context: context,
            menu: useContextMenu({
                id: namespace
            })
        }
    }

    public static getTrueNamespace(namespace: string) {
        return namespace.replace(/\:[^\.]+/, '')
    }
    

    public constructor (props: ContextMenuProps) {
        super(props);

        
        this.state = {
            menu: props.menu || [],
            open: false,
            dangerMessage: '',
            namespace: [props.namespace, 'CONTEXTMENU'].join('.'),
            payload: {},
            rowItem: null
        }

        ContextMenu.setContextMenu(this.state.namespace, this);
    }

    public UNSAFE_componentWillReceiveProps (newProps: any) {
        
        if (this.state.namespace.indexOf(newProps.namespace) ==-1) {
            this.setState({
                namespace: [newProps.namespace, 'CONTEXTMENU'].join('.'),
                menu: newProps.menu
            })
        }
    }
    private showConfirm(rowItem: any, message?: string) {
        this.setState({
            open: true,
            rowItem: rowItem,
            dangerMessage: message || this.defaultMessage//,utils.isString(rowItem.danger) ? rowItem.danger : this.defaultMessage
        })
    }

    public findMenuByContext(payload: any) {

        let menu: any = ContextMenuManger.filter(this.props.menu || [], this.state.namespace, payload);
        let contextMenu: any = PluginManager.getContextMenu(this.state.namespace, payload) || [];
        
        return this.filterLastDivider([
            ...menu,
            ...contextMenu
        ])//.sort((a,b) => a.index > b.index ? 1 : -1)
    }
    public filterLastDivider(menu: any) {

        if (menu.length && menu[menu.length-1].type =='divider') {
            menu.pop();
        }

        if (menu.length && menu[0].type =='divider') {
            menu.shift();
        }

        return menu.map(it=> {
            if (it.children) {
                it.children = this.filterLastDivider(it.children);
            }
            return it;
        });
    }

    /**
     * 重信设置reset
     * @param payload 
     * @param fn 
     */
    public resetMenuByContext(payload: any, fn: Function) {
        let menuList: any  = this.findMenuByContext(payload);
        
        if (menuList.length> 0) {
            this.setState({

                payload,
                menu: menuList
            } );

            fn()
        }
    }

    public onMenuClick(rowItem: any) {

        if (rowItem.danger) {

            if (utils.isPlainObject(rowItem.danger)) {
                
                let { message = '', condition, errTips = ''} = rowItem.danger;

                if (utils.isFunction(condition)) {
                    if (condition(rowItem, this.state.namespace)) {
                        return this.showConfirm(rowItem, message);
                    } else {
                        return AntMessage.error({
                            content: errTips
                        })
                    }
                } 

                this.showConfirm(rowItem, message);

            } else {
                this.showConfirm(rowItem, utils.isString(rowItem.danger) ? rowItem.danger : rowItem.confirm)
            }

            
        } else {
            this.doAction(rowItem);
            
        }
    }
    public doAction(current: any) {
        if (utils.isFunction(current.action)) {
            current.action(this.state.payload)
        } else {
            this.props.onMenuClick && this.props.onMenuClick(current, this.state.payload);
        }
    }
    public renderChildrenMenu(menu: any = null, component: any) {
        let renderMenu: any[] = menu || this.state.menu;
        
        return renderMenu.map((it,i) => {
            // subitem
            if (it.children) {
                return (
                    <component.Submenu key={i} label={this.renderTitle(it)}>{this.renderChildrenMenu(it.children, component)}</component.Submenu>
                )
            } else {
                if (it.type == 'divider') {
                    return <component.Separator key={i}/>
                } else if (it.type =='group') {
                    return <component.Item key={i} className="ui-menu-group">{it.name}</component.Item>
                }

                return (
                    <component.Item 
                        className={classnames({
                            'ui-menu-danger': it.danger
                        })} 
                        onClick={()=> {
                        // test    WORKSPACE.PANEL.CODER.META
                        // doAction
                            this.onMenuClick(it)
                        }}
                         key={i}
                    >
                        {this.renderTitle(it)}
                        {it.shortcut && <span className='shortcut-text'>{this.getShortcutText(it.shortcut)}</span>}
                    </component.Item>
                )
            }
        })
    }
    private getShortcutText(shortcut: number[]) {
        // todo 2048
        return (UIUtils.isMacOS() ? "⌘": "ctrl") + '+' + (monaco.KeyCode[shortcut[1]] || '').replace('Key', '');
    }
    public renderTitle(it) {
        return (
            <>
                {TablerUtils.renderIconComponent(it)}
                {it.label || it.name}
            </>
        )
    }
    

    public render() {
        return (
            <>
                {this.state.open &&<Pick 
                        type='confirm' 
                        visible={this.state.open} 
                        title={this.state.dangerMessage}
                        danger
                        onConfirm={()=> {
                            //this.props.onMenuClick && this.props.onMenuClick(this.state.rowItem, this.state.payload);
                            this.doAction(this.state.rowItem)
                        }}
                        onHidden={()=>{this.setState({dangerMessage: '', payload: null, open:false})}}
                    />}
                {
                    ReactDOM.createPortal(<ContexifyMenu key={1} id={this.state.namespace}>
                        {this.renderChildrenMenu(null, {
                            Submenu: ContexifySubmenu,
                            Item: ContexifyItem,
                            Separator: ContexifySeparator
                        })}
                    </ContexifyMenu>, document.body)
                }
            </>
            
        )
    }
}