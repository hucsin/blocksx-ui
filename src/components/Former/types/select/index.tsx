/*
 * @Author: your name
 * @Date: 2021-10-18 16:10:17
 * @LastEditTime: 2022-03-02 17:09:52
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /designer/Users/iceet/work/hucsin/blocksx/packages/design-components/src/former/types/select/index.tsx
 */


import React from 'react';
import { IFormerBase } from '../../typings';

import UtilsDatasource from '../../../utils/datasource';
import { utils } from '@blocksx/core';
import { Select } from 'antd';

import './style.scss';

export interface FormerSelectProps extends IFormerBase {
    value: any,
    size?: any,
    mode?: string,
    onChangeValue: Function,
    relyon?: any;
    'x-type-props'?: any
    'x-mode'?: 'lazy' | 'cache',
    popupClassName?: string;
    dataSource?: any;
}



export interface FormerSelectState {
    value: any;
    dataSource: any[];
    relyon: any;
    loading: boolean;
    multiple: boolean;
    runtimeValue?: any;

    search?: string;
    query?: string;
}

export default class FormerSelect extends React.Component<FormerSelectProps, FormerSelectState> {
    public static defaultProps = {
        'x-mode': 'lazy'
    }
    public constructor(props: FormerSelectProps) {
        super(props);
        let isMultiple: boolean = this.isMultiple();
        this.state = {
            value: isMultiple ? this.fixedMultipleValue(props.value) : props.value,
            dataSource: this.getDefaultDatasource(props),
            relyon: props.relyon || {},
            loading: false,
            multiple: isMultiple,
            runtimeValue: props.runtimeValue
        };

    }
    private getDefaultDatasource(props: any) {
        let datasource: any = [];

        if (utils.isLabelValue(props.value)) {
            datasource.push(props.value)
        }
        if (utils.isArray(props.dataSource)) {
            datasource = datasource.concat(props.dataSource);
        }
        return datasource
    }
    private isLazyLoader() {
        return this.props['x-mode'] == 'lazy';
    }
    public componentDidMount() {
        if (!this.isLazyLoader())
            this.fetchData();
    }
    public UNSAFE_componentWillReceiveProps(newProps: any) {
        if (newProps.value != this.state.value) {
            this.setState({
                value: this.isMultiple() ? this.fixedMultipleValue(newProps.value) : newProps.value
            })
        }

        if (newProps.runtimeValue != this.state.runtimeValue) {
            this.setState({
                runtimeValue: newProps.runtimeValue
            })
        }

    }

    private fixedMultipleValue(value) {
        if (!utils.isArray(value)) {
            return [value]
        }
        return value;
    }

    private isMultiple() {
        let typeProps: any = this.props['x-type-props'] || {};

        return !!typeProps['mode']
    }
    private onChange = (value: any) => {

        this.setState({
            value: value
        }, () => this.props.onChangeValue(value));
    }
    private onSearch =(v) => {
        this.setState({
            search: v
        }, () => {
            this.fetchData()
        })
    }
    private setLoading(loading: boolean) {
        this.setState({
            loading: loading
        })
    }

    private fetchData(data?: any) {
        let { dataSource } = this.props['x-type-props'] || {};
        let isLabelValue: boolean = utils.isPlainObject(this.state.value);
        let source: any = data || dataSource || this.props.dataSource;

        if (source) {
            
            // TODO 如果参数变化之后不cache
            if (!utils.isValidArray(this.state.dataSource) || (this.state.search !== this.state.query)) {
                this.setLoading(true);
                
                UtilsDatasource.getSource(source, {
                    //...this.state.runtimeValue, 
                    query: this.state.search
                }).then((data: any) => {
                    
                    this.setState({
                        dataSource: isLabelValue ? this.markDataSource([this.state.value, ...data]) :data,
                        loading: false,
                        query: this.state.search
                    })
                })
            }
        }
    }
    private markDataSource(data) {
        let cache: any ={};
        return data.filter(it => {
            if (!cache[it.value]) {
                cache[it.value] = true;
                return true;
            }
        })
    }

    private renderRemarks(remarks: any) {
        if (remarks) {
            return (
                <span className='design-former-select-remarks'>({remarks})</span>
            )
        }
    }
    private renderChildren() {
        let dataSource: any[] = this.state.dataSource;

        return dataSource.map((it => {
            let value: any = it.value || it.key;
            let label: any = it.label || it.name;

            return (
                <Select.Option key={value} value={value}>{label}{this.renderRemarks(it.remarks)}</Select.Option>
            )
        }))
    }

    public render() {
        return (
            <Select
                {...this.props['x-type-props']}
                onFocus={() => {
                    if (this.isLazyLoader()) {
                        this.fetchData();
                    }
                }}
                mode={this.props.mode}
                showSearch={true}
                popupClassName={this.props.popupClassName}
                disabled={this.props.disabled}
                loading={this.state.loading}
                onSearch={this.onSearch}
                onChange={this.onChange}
                size={this.props.size}
                value={this.state.value}
            >
                {this.renderChildren()}
            </Select>
        )
    }
}
