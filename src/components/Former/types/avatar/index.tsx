import React from 'react';
import { Avatar, Space, Tooltip } from 'antd';
import { utils } from '@blocksx/core';


import * as Icons from '../../../Icons/index';
import { IFormerBase } from '../../typings';

import './style.scss';

export interface IMircoAvatar extends IFormerBase {
    size?: any;
    icon?: string;
    url?: string;
    value?: string;
    text?: string;
    
    color?: string;
    subcolor?: string;

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
    public renderItem(props: any, icon: string, color: string, tips: string= '', fontColor?: string) {

        
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
            
            let iconreg: any = this.getColorByIcon(icon);
            let IconView: any = Icons[iconreg.icon];
            
            if (IconView) {
                return (<Tooltip title={tips}><Avatar 
                 shape = {props.shape}
                 size = {props.size} style={{
                    background:iconreg.color || color, 
                    
                    fontSize: props.size  * 2/3 ,
                    
                    color: fontColor || (props.autoColor ? '#fff' : ''),
                    ...props.style,
                }} icon={<IconView/>} /></Tooltip>)
            }
        }
        return <Avatar/>
    }
    public getColorByIcon(icon:string) {
        let iconRex: any = {};
        if (icon) {
            if (icon.match(/#/)) {
                let matchicon: any = icon.split('#');
                iconRex.icon = matchicon[0];
                iconRex.color = '#' + matchicon[1];
            } else {
                iconRex.icon = icon;
            }
        }
        return iconRex;
    }
    private getSubSize()  {
        let props: any = this.getProps();
        let size: any = props.size * 2/3;
        return parseInt(size, 10)
    }
    private getProps() {
        let props: any = {...this.props, ...this.props['x-type-props']};

        if (typeof props.size !='number') {
            props.size=  32
        }

        return  props;
    }
    public render() {
        
        let props: any = this.getProps();
        let icon: any  = props.value || props.icon || props.url;
        let subsize: number = this.getSubSize();
        
        if (Array.isArray(icon)) {

            if (utils.isArrayObject(icon)) {
       
                return (
                    <Avatar.Group className='ui-avatar-group'>
                        {icon.map(ic => this.renderItem(props,ic.icon, ic.color, ic.name))}
                    </Avatar.Group>
                )
            } else {
                
                let iconreg: any = this.getColorByIcon(icon[0]);
                // merge 模式
                return (
                    <div className='ui-avatar-merge'>
                        {this.renderItem(props, icon[0], iconreg.color)}
                        {icon[1] && <span className='ui-sub'>{this.renderItem({...props, shape: 'sh',style :{ width: subsize, height: subsize, fontSize: 14}, size: subsize}, icon[1], this.props.subcolor || '#ffffff', '', iconreg.color || this.props.color)}</span>}
                    </div>
                )
            }
        } else {
            return this.renderItem(props, icon, props.color || (props.autoColor && this.getColor(icon || props.text)) || '')
        }
    }
}