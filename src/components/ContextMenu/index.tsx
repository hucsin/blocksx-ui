import React from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import { message as AntMessage } from 'antd';
import { Icons, Pick } from '@blocksx/ui';
import { utils } from '@blocksx/core';
import i18n from '@blocksx/i18n';

import {
    Menu,
    Item,
    Separator,
    Submenu,
    useContextMenu,
} from "react-contexify";

import "react-contexify/dist/ReactContexify.css";

import "./style.scss";


export interface ContextMenuItem {
    name?: string;
    type: string;
    icon?: string;
    danger?: boolean;
    children?: ContextMenuItem[]
}

interface ContextMenuProps {
    menu: any;
    type: string;
    id: string;
    onMenuClick?: Function;
}
interface ContextMenuState {
    key: string;
    menu: ContextMenuItem[],
    open:boolean;
    current: any;
    dangerMessage: string;
}

export default class ContextMenu extends React.Component<ContextMenuProps, ContextMenuState> {

    private defaultMessage: string = i18n.t('Do you want to delete this module');
    public static contextMenu: any = {};


    public static setContextMenu = (id: string) => {
        ContextMenu.contextMenu[id] = useContextMenu({
            id:id
        })
    }

    public static getContextMenu = (id: string) => {
        return ContextMenu.contextMenu[id];
    }

    public constructor (props: ContextMenuProps) {
        super(props);

        this.state = {
            key: [props.id, props.type].join('.'),
            menu: props.menu,
            open: false,
            dangerMessage: '',
            current: null
        }

        ContextMenu.setContextMenu(props.id);
    }

    public componentWillUpdate (newProps: any) {
        let key: string = [newProps.id, newProps.type].join('.');
        if (key != this.state.key) {
            this.setState({
                key: key,
                menu: newProps.menu
            })
        }
    }
    private showConfirm(rowItem: any, message?: string) {
        this.setState({
            open: true,
            current: rowItem,
            dangerMessage: message || this.defaultMessage//,utils.isString(rowItem.danger) ? rowItem.danger : this.defaultMessage
        })
    }
    public onMenuClick(rowItem: any) {

        if (rowItem.danger) {

            if (utils.isPlainObject(rowItem.danger)) {
                
                let { message = '', condition, errTips = ''} = rowItem.danger;

                if (utils.isFunction(condition)) {
                    if (condition(rowItem, this.props.id)) {
                        return this.showConfirm(rowItem, message);
                    } else {
                        return AntMessage.error({
                            content: errTips
                        })
                    }
                } 

                this.showConfirm(rowItem, message);

            } else {
                this.showConfirm(rowItem, utils.isString(rowItem.danger) ? rowItem.danger : '')
            }

            
        } else {
            this.props.onMenuClick && this.props.onMenuClick(rowItem);
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
                    <Item className={classnames({
                        'ui-menu-danger': it.danger
                    })} onClick={()=> {
                        // test    WORKSPACE.PANEL.CODER.META
                        // doAction
                        this.onMenuClick(it)
                    }} key={i}>{this.renderTitle(it)}</Item>
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
            if (Icons[it.icon]) {
                let ViewIcon: any = Icons[it.icon];
                return ViewIcon ? <ViewIcon /> : null;
            }
        }
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
                            this.props.onMenuClick && this.props.onMenuClick(this.state.current);
                        }}
                        onHidden={()=>{this.setState({dangerMessage: '', current: null, open:false})}}
                    />}
                {
                    ReactDOM.createPortal(<Menu id={this.props.id}>
                        {this.renderChildrenMenu()}
                    </Menu>, document.body)
                }
            </>
            
        )
    }
}