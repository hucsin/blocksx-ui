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
import * as Icons from '../../../Icons';
import { utils } from '@blocksx/core';
import { Select, Tooltip } from 'antd';

import './style.scss';

export interface FormerSelectProps extends IFormerBase {
    value: any,
    size?: any,
    dict?: any;
    mode?: string,
    viewer?: boolean;
    onChangeValue: Function,
    placeholder?: string;
    relyon?: any;
    'x-type-props'?: any
    'x-mode'?: 'lazy' | 'cache',
    popupClassName?: string;
    dataSource?: any;
    autoClear?: any;
    popupMatchSelectWidth?: boolean;
    readonly?: boolean;
    errorMessage?: string;
}



export interface FormerSelectState {
    value: any;
    dataSource: any[];
    originSource: any[],
    relyon: any;
    loading: boolean;
    multiple: boolean;
    runtimeValue?: any;

    search?: string;
    query?: string;
    readonly?: boolean;
    errorMessage?: string;
}


export default class FormerSelect extends React.Component<FormerSelectProps, FormerSelectState> {
    
    public static defaultProps = {
        'x-mode': 'lazy',
        popupMatchSelectWidth: true
    }
    public constructor(props: FormerSelectProps) {
        super(props);
        let isMultiple: boolean = this.isMultiple();
        let datasource: any [] = this.getDefaultDatasource(props);
        this.state = {
            value: isMultiple ? this.fixedMultipleValue(props.value) : props.value,
            dataSource: this.makeGroupDataSource(datasource),
            relyon: props.relyon || {},
            originSource: datasource,
            loading: false,
            multiple: isMultiple,
            runtimeValue: props.runtimeValue,
            readonly: props.readonly || false,
            errorMessage: props.errorMessage || ''
        };

    }
    private clearValue(value: any) {
        let props:any = this.props['props'] || this.props['x-type-props'] || {};

        let isLabelValue: boolean = utils.isLabelValue(value);
        
        if (isLabelValue && !props.labelValue) {
            value = value.value;
        }

        return value;
    }
    private makeGroupDataSource(datasource: any) {
        let list: any = [];
        let group : any = {};

        datasource.forEach(it => {

            if (it.icon && typeof it.label =='string') {
                let IconView: any = Icons[it.icon];
                if (IconView) {
                    it.label = (<><IconView clasName="dd"/><span>{it.label}</span></>)
                }
            }

            if (it.group) {
                if (!group[it.group]) {
                    group[it.group] = [];
                    list.push({
                        title: it.group,
                        label: it.group,
                        options: group[it.group]
                    })
                }
                group[it.group].push(it)
            } else {
                list.push(it)
            }
        })
        return list;
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
        if (newProps.readonly != this.state.readonly) {
            this.setState({
                readonly: newProps.readonly || false
            })
        }

        if (newProps.errorMessage != this.state.errorMessage) {
            this.setState({
                errorMessage: newProps.errorMessage
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
        let props:any = this.props['props'] || this.props['x-type-props'] || {};

        let isLabelValue: boolean = utils.isLabelValue(value);
        if (isLabelValue && !props.labelValue) {
            value = value.value;
        }

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
                    let datasource: any = isLabelValue ? this.markDataSource([this.state.value, ...data]) :data;
                    this.setState({
                        dataSource: this.makeGroupDataSource(datasource),
                        loading: false,
                        originSource: datasource,
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
        }).map (it => ({value: it.value,label: it.label}))
    }

    private renderRemarks(remarks: any) {
        if (remarks) {
            return (
                <span className='design-former-select-remarks'>({remarks})</span>
            )
        }
    }
    

    private findCurrentLabel() {
        return this.state.originSource.find(it=> it.value == this.state.value) || {}
    }
    private getStatus() {
        return this.state.errorMessage ? 'error' : ''
    }
   
    public render() {
        let props:any = this.props['props'] || this.props['x-type-props'] || {};
        let popupMatchSelectWidth = props.popupMatchSelectWidth !== undefined ? props.popupMatchSelectWidth : this.props.popupMatchSelectWidth;
        let disabled: boolean = props.disabled || this.props.disabled;

        let tooltip: string = props.tooltip =='auto' ? this.findCurrentLabel().label  : props.tooltip || this.props.tooltip;
        let value: any = this.clearValue(this.state.value);
        
        
        return (
            <Tooltip title={this.state.errorMessage || tooltip} placement='topLeft'>
                <Select
                    allowClear={this.props.autoClear}    
                    placeholder={this.props.placeholder}
                    status={this.getStatus()}
                    {...this.props['x-type-props']}
                    onFocus={() => {
                        if (this.isLazyLoader()) {
                            this.fetchData();
                        }
                    }}
                    style={
                        {
                            width: props.width 
                        }
                    }
                    
                    popupMatchSelectWidth={popupMatchSelectWidth}
                    mode={this.props.mode}
                    showSearch={true}
                    labelInValue={props.labelValue}
                    popupClassName={this.props.popupClassName}
                    disabled={this.state.readonly || disabled}
                    loading={this.state.loading}
                    onSearch={this.onSearch}
                    onChange={this.onChange}
                    size={this.props.size}
                    value={value}
                    options={this.state.dataSource}
                >
                </Select>
            </Tooltip>
        )
    }
}
