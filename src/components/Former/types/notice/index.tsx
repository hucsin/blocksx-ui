import React from 'react';
import { utils } from '@blocksx/core';
import Markdown from '../../../Markdown';
import Avatar from '../avatar';

import './style.scss';

export default class FormerNotice extends React.Component<{value?: any, icon?: any, color?: any, props?: any, notice?: any}, {notice: any,color: any,icon:any,value: any}> {

    public static Viewer: any = FormerNotice;
    public static defaultProps ={
        icon: 'NotificationOutlined#ccc'
    }
    public constructor(props:any){
        super(props);

        this.state = {
            icon: this.getDefaultIcon(props),
            value: props.value,
            color: this.getDefaultColor(props),
            notice: this.getNotice(props)
        }
    }
    private getNotice(props: any) {
        let trueProps: any = props['x-type-props'] || {};

        return props.notice || trueProps.notice;
    }
    private getDefaultIcon(propsc: any) {
        let { props = { }, icon } = propsc;
        return icon || props.icon ;
    }
    private getDefaultColor(propsc: any) {
        let { props = { }, color } = propsc;
        return color || props.color ;
    }
    public UNSAFE_componentWillReceiveProps(nextProps: any): void {
        if (nextProps.value != this.state.value) {
            this.setState({
                value: nextProps.value,
                icon: this.getDefaultIcon(nextProps)
            })
        }
        if (nextProps.icon != this.state.icon) {
            this.setState({
                value: nextProps.value,
                icon: this.getDefaultIcon(nextProps)
            })
        }

        if (nextProps.notice != this.state.notice) {
            this.setState({
                notice: this.getNotice(nextProps)
            })
        }
    }
    private getSize(value: string = '') {
        if (value.length > 100) {
            return 48;
        }

        return this.props.icon ? 42 : 36
    }
    public render() {

        let { icon, color, notice, value } = this.state;
        let { props } = this.props;

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

        if (props) {
            if (props.icon) {
                icon = props.icon;
            }
        }
        
        return value ? (
            <div className='ui-former-notice'>
                {icon && <Avatar size={this.getSize(value)} color={color} icon={icon}/>}
                <Markdown>{value}</Markdown>
            </div>
        ) : null;
    }
}