import React from 'react';
import { Avatar } from 'antd';
import { utils } from '@blocksx/core';

import * as Icons from '../Icons';


export interface IMircoAvatar {
    size?: any;
    icon?: string;
    url?: string;
    text?: string;
    color?: string;
    autoColor?: boolean;
    style?: any;
    shape: 'circle' | 'square';
    onClick?: Function;
}


export default class MircoAvatar extends React.Component<IMircoAvatar> {
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
    private onClick =()=> {
        this.props.onClick && this.props.onClick();
    }
    private getSafeProps() {
        let props: any = {}
        for(let prop in this.props) {
            if (prop.match(/^on/)) {
                props[prop] = this.props[prop]
            }
        }
        return props;
    }
    public render() {

        let icon: any = this.props.icon || this.props.url;
        let color: any = this.props.color || (this.props.autoColor && this.getColor(icon || this.props.text) ) || ''
        let safePorps: any = this.getSafeProps();
        if (this.props.text) {
            return <Avatar {...safePorps} onClick={this.onClick} size={this.props.size} shape={this.props.shape}  style={{background:color, ...this.props.style}}>{this.props.text}</Avatar>
        }
        
        if (icon) { 
            if (icon.match(/[\/\.]/)) {
                return <Avatar {...safePorps} onClick={this.onClick} size={this.props.size}   shape={this.props.shape} style={{backgroundColor:color, ...this.props.style}}  src={icon} />
            }
            let IconView: any = Icons[icon];
            
            if (IconView) {
                return (<Avatar 
                    {...safePorps} 
                    onClick={this.onClick}
                    shape={this.props.shape}
                    
                    size={this.props.size} style={{
                        background:color, 
                        fontColor: this.props.autoColor ? '#fff' : '',
                        ...this.props.style
                    }} icon={<IconView/>} 
                />)
            }
        }
        return <Avatar  onClick={this.onClick}/>
    }
}