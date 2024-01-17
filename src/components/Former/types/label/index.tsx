/*
 * @Author: your name
 * @Date: 2021-10-18 16:10:17
 * @LastEditTime: 2021-10-27 10:26:49
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /designer/Users/iceet/work/hucsin/blocksx/packages/design-components/src/former/types/select/index.tsx
 */


import React from 'react';
import { Tag } from 'antd';
import { utils } from '@blocksx/core';


import { IFormerBase } from '../../typings';
import UtilsDatasource from '../../../utils/datasource';

import './style.scss'


export interface IFormerLabel extends IFormerBase {
    value: any;
    dataSource?: any;
}

export interface SFormerLabel {
    value: any;
    dataSource: any
}

export default class FormerLabel extends React.Component<IFormerLabel, SFormerLabel> {
    public constructor(props: IFormerLabel) {
        super(props);


        this.state = {
            value: props.value,
            dataSource: null
        }
    }
    public componentDidMount() {
        if (this.props.dataSource && !this.props.viewer) {
            UtilsDatasource.getSource(this.props.dataSource, this.props.relyon).then((data: any) => {
                this.setState({
                    dataSource: data
                })
            })
        }
    }
    private getLabelByValue(_value) {

        let { dataSource } = this.state;
        if (utils.isArray(dataSource)) {
            let find: any = dataSource.find((it: any) => {
                if (it.value === _value || it.key === _value) {
                    return true;
                }
            })
            if (find) {
                return find.label || find.name;
            }
        }

        if (typeof _value == 'boolean') {
            return _value ? 'True' : 'False'
        }

        return utils.isNullValue(_value) || _value == ''
            ? <span className='ui-label-empty'>{'<null>'}</span> : this.getValue(_value);
    }
    private getValue(val: any) {
        if (utils.isPlainObject(val)) {
            return val.label || val.name || val.value || val.key;
        }
        return val;
    }
    private getShowValue() {
        let { value } = this.state;

        if (Array.isArray(value)) {
            return value.map((it) => this.getLabelByValue(it))
        }
        return this.getLabelByValue(value);
    }
    public render() {
        let value: any = this.getShowValue();
        return Array.isArray(value) ? (
            <span className="former-label">
                {value.map(it => {
                    return <Tag key={it} color="#ccc">{it}</Tag>
                })}
            </span>
        ) : <span className="former-label"> {value}</span>
    }
}
