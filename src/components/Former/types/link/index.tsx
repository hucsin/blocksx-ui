/*
 * @Author: your name
 * @Date: 2021-10-18 16:10:17
 * @LastEditTime: 2021-10-27 10:26:49
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /designer/Users/iceet/work/hucsin/blocksx/packages/design-components/src/former/types/select/index.tsx
 */


import React from 'react';
import * as Icons from '../../../Icons';

import { IFormerBase } from '../../typings';
import './style.scss'


export interface IFormerLabel extends IFormerBase {
    value: any;
}

export interface SFormerLabel {
    value: any;
}

export default class FormerLabel extends React.Component<IFormerLabel, SFormerLabel> {
    public constructor(props: IFormerLabel) {
        super(props);
        this.state = {
            value: props.value,
        }
    }
    public render() {
        // @ts-ignore
        let defaultOrigin: any = window.location.origin;
        let props: any = this.props['props'] || this.props['x-type-props'];
        let { origin = defaultOrigin, path = '/', target='_blank'} = props;

        let url: string = origin + path + this.state.value;
        
        return (<span className='ui-link'>
            <Icons.OpenWindowUtilityOutlined/>
            <a href={url} target={target} >{url}</a>
        </span>)
    }
}
