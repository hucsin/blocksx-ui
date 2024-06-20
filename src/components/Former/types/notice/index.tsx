import React from 'react';
import { utils } from '@blocksx/core';
import Markdown from '../../../Markdown';
import Avatar from '../avator';

import './style.scss';

export default class FormerNotice extends React.Component<{value?: any, icon?: any, props?: any, notice?: any}, {notice: any,color: any,icon:any,value: any}> {

    public static defaultProps ={
        icon: 'NotificationOutlined#ccc'
    }
    public constructor(props:any){
        super(props);

        this.state = {
            icon: this.getDefaultIcon(props),
            value: props.value,
            color: this.getDefaultColor(props),
            notice: props.notice
        }
    }
    private getDefaultIcon(propsc: any) {
        let { props = { }, icon } = propsc;
        return icon || props.icon ;
    }
    private getDefaultColor(propsc: any) {
        let { props = { }, color } = propsc;
        return color || props.color ;
    }
    public  UNSAFE_componentWillReceiveProps(nextProps: any): void {
        if (nextProps.value != this.state.value) {
            this.setState({
                value: nextProps.value,
                icon: this.getDefaultIcon(nextProps)
            })
        }

        if (nextProps.notice != this.state.notice) {
            this.setState({
                notice: nextProps.notice
            })
        }
    }
    public render() {

        let { icon, color, notice, value } = this.state;

        if (utils.isPlainObject(notice)) {
            if (notice.icon) {
                icon = notice.icon
            }
            if (notice.notice) {
                value = notice.notice;
            }
            if (notice.color) {
                color = notice.color;
            }
        } else {
            if (utils.isString(notice)) {
                value = notice;
            }
        }
        
        return value ? (
            <div className='ui-former-notice'>
                {icon && <Avatar size={this.props.icon ? 36 :24} color={color} icon={icon}/>}
                <Markdown>{value}</Markdown>
            </div>
        ) : null;
    }
}