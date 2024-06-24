import React from 'react';
import { Avatar, Space, Tooltip } from 'antd';
import { utils } from '@blocksx/core';


import * as Icons from '../../../Icons/index';
import { IFormerBase } from '../../typings';

export interface IMircoAvatar extends IFormerBase {
    size?: any;
    icon?: string;
    url?: string;
    value?: string;
    text?: string;
    color?: string;
    autoColor?: boolean;
    style?: any;
    shape?: 'circle' | 'square'
}


export default class MircoAvatar extends React.Component<IMircoAvatar> {
    static Viewer: any = MircoAvatar;
    static defaultProps = {
        autoColor: true,
        shape: 'circle'
    }
    private defaultColor: any = [
        '#2ECC71',
        '#3498DB',
        '#9B59B6',
        '#6C7A89',
        '#F2CA27',
        '#E67E22',
        '#E74C3C',
    ]
    private getColor(text) {
        let hash: number = Math.abs(utils.hashcode(text));
        let number = hash % this.defaultColor.length;
        return this.defaultColor[number];
    }
    public renderItem(props: any, icon: string, color: string, tips?: string) {

        
        if (props.text) {
            return (<Tooltip title={tips}>
                <Avatar size={props.size} shape={props.shape}  style={{background:color, ...props.style}}>{props.text}</Avatar>
            </Tooltip>)
        }
        
        if (icon) { 
            if (icon.match(/[\/\.]/)) {
                return (<Tooltip title={tips}><Avatar size={props.size} shape={props.shape} style={{backgroundColor:color, ...props.style}}  src={icon} /></Tooltip>)
            }
            // 如果icon是 xxx#ffff模式
            if (icon.match(/#/)) {
                let matchicon: any = icon.split('#');
                icon = matchicon[0];
                color = '#' + matchicon[1];
            }

            let IconView: any = Icons[icon];
            if (IconView) {
                return (<Tooltip title={tips}><Avatar 
                 shape = {props.shape}
                 size = {props.size} style={{
                    background:color, 
                    fontColor: props.autoColor ? '#fff' : '',
                    ...props.style
                }} icon={<IconView/>} /></Tooltip>)
            }
        }
        return <Avatar/>
    }
    public render() {
        
        let props: any = {...this.props, ...this.props['x-type-props']};
        let icon: any  = props.value || props.icon || props.url;
        
        if (Array.isArray(icon)) {
            return (
                <Avatar.Group className='ui-avatar-group'>
                    {icon.map(ic => this.renderItem(props,ic.icon, ic.color, ic.name))}
                </Avatar.Group>
            )
        } else {
            return this.renderItem(props, icon, props.color || (props.autoColor && this.getColor(icon || props.text)) || '')
        }
    }
}