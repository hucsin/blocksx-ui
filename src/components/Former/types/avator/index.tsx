import React from 'react';
import { Avatar } from 'antd';
import { utils } from '@blocksx/core';

import * as Icons from '../../../Icons/index';
import { IFormerBase } from '../../typings';

export interface IMircoAvator extends IFormerBase {
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


export default class MircoAvatar extends React.Component<IMircoAvator> {
    static defaultProps = {
        autoColor: true,
        shape: 'circle'
    }
    private defaultColor: any = [
        '#f56a00',
        '#87d068',
        '#1677ff',
        '#e916ff',
        '#4907c9',
        '#02a79f',
        '#0a7c1f',
        '#847a02',
        '#841b02',
        '#d2ac05'
    ]
    private getColor(text) {
        let hash: number = Math.abs(utils.hashcode(text));
        let number = hash % this.defaultColor.length;
        return this.defaultColor[number];
    }
    public render() {

        let props: any = {...this.props, ...this.props['x-type-props']};
        let icon: any  = props.value || props.icon || props.url;
        let color: any = props.color || (props.autoColor && this.getColor(icon || props.text)) || ''
        
        
        if (props.text) {
            return <Avatar size={props.size} shape={props.shape}  style={{background:color, ...props.style}}>{props.text}</Avatar>
        }
        
        if (icon) { 
            if (icon.match(/[\/\.]/)) {
                return <Avatar size={props.size} shape={props.shape} style={{backgroundColor:color, ...props.style}}  src={icon} />
            }
            let IconView: any = Icons[icon];
            if (IconView) {
                return <Avatar 
                 shape = {props.shape}
                 size = {props.size} style={{
                    background:color, 
                    fontColor: props.autoColor ? '#fff' : '',
                    ...props.style
                }} icon={<IconView/>} />
            }
        }
        return <Avatar/>
    }
}