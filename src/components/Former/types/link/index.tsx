/*
 * @Author: your name
 * @Date: 2021-10-18 16:10:17
 * @LastEditTime: 2021-10-27 10:26:49
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /designer/Users/iceet/work/hucsin/blocksx/packages/design-components/src/former/types/select/index.tsx
 */


import React from 'react';
import classnames from 'classnames';
import { utils } from '@blocksx/core';
import * as Icons from '../../../Icons';

import { IFormerBase } from '../../typings';

import { Tooltip } from 'antd';
import './style.scss'


export interface IFormerLabel extends IFormerBase {
    value: any;
    recordValue?: any;
    former?: any;
}

export interface SFormerLabel {
    value: any;
}

export default class FormerLink extends React.Component<IFormerLabel, SFormerLabel> {
    public static Viewer = FormerLink;
    public constructor(props: IFormerLabel) {
        super(props);
        this.state = {
            value: props.value,
        }
    }
    public UNSAFE_componentWillReceiveProps(nextProps: Readonly<IFormerLabel>, nextContext: any): void {
        if (nextProps.value != this.props.value) {
            this.setState({ value: nextProps.value })
        }
    }
    public render() {
        // @ts-ignore
        let defaultOrigin: any = window.location.origin;
        let { value = '' } = this.state;
        let props: any = this.props['props'] || this.props['x-type-props'];
        let { icon, dir,  name, notice,  origin = defaultOrigin, path = '/', target='_blank', params = {}} = props;
        let formerValue: any = {...(this.props.recordValue || {}),...(this.props.former ? this.props.former.getSafeValue() :  {}), ...this.state};
        
        let url: string = (utils.template(String(value).match(/^https?:\/\//) ? value : origin + path + encodeURIComponent(value), formerValue) || '');

        let tips: string = notice || url;

        let display: string = utils.shortenString(name ? utils.template(name, formerValue) : url, 65);
        let IconView: any = Icons[icon] || Icons['OpenWindowUtilityOutlined'];

        Object.entries(params).forEach((([key, value]:any)=> {
            if (!url.includes('?')) {
                url += '?'
            }
            url += '&' + key +'='+ encodeURIComponent(value)
        }))
        
        return (<span className={classnames({
                    'ui-link': true,
                    [`ui-link-dir-${dir}`]: dir
                })}>    
            <IconView/>
            <Tooltip title={tips}><a href={url} target={target} >{display}</a></Tooltip>
        </span>)
    }
}
