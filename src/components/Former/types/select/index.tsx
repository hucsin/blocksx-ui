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
import { utils, keypath } from '@blocksx/core';
import { Select, Tooltip } from 'antd';
import TablerUtils from '../../../utils/tool';
import SmartRequest from '../../../utils/SmartRequest';

import './style.scss';

export interface FormerSelectProps extends IFormerBase {
    value: any,
    size?: any,
    dict?: any;
    former?:any;
    mode?: string,
    autoEnums?: any;
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

    dependency?: any;
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

    dependency?: any;
    
    autoEnumsDependency?: any;
}


export default class FormerSelect extends React.Component<FormerSelectProps, FormerSelectState> {
    
    public static defaultProps = {
        'x-mode': 'lazy',
        popupMatchSelectWidth: true
    }
    private autoEnumsRequest?: any;
    public constructor(props: FormerSelectProps) {
        super(props);
        let isMultiple: boolean = this.isMultiple();
        let datasource: any [] = this.getDefaultDatasource(props);

        this.state = {
            value: isMultiple ? this.fixedMultipleValue(props.value) : props.value,
            dataSource: datasource,
            relyon: props.relyon || {},
            originSource: datasource,
            loading: false,
            multiple: isMultiple,
            runtimeValue: props.runtimeValue,
            readonly: props.readonly || false,
            errorMessage: props.errorMessage || '',
            dependency: props.dependency
        };

        this.initAutoEnumsRequest();
        
    }
    private initAutoEnumsRequest() {
        let { autoEnums } = this.props;
        if (autoEnums && autoEnums.type == 'findPanelView') {
            this.autoEnumsRequest = SmartRequest.createAutoEnumsRequest(autoEnums, () => {
                return this.getAutoEnumsDependecy();
            });
        }
    }
    private clearValue(value: any) {
        let props:any = this.props['props'] || this.props['x-type-props'] || {};

        let isLabelValue: boolean = utils.isLabelValue(value);
        
        if (isLabelValue && !props.labelValue) {
            value = value.value;
        }

        return utils.isUndefined(value) ? value : value +'';
    }
    private makeGroupDataSource(datasource: any) {
        let list: any = [];
        let group : any = {};

        datasource.forEach(it => {
            
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
        } else {
            if (utils.isArray(props.fieldDict)) {
                datasource = datasource.concat(props.fieldDict);
            }
        }
        return datasource
    }
    private isLazyLoader() {
        return this.props['x-mode'] == 'lazy';
    }
    public componentDidMount() {
        if (!this.isLazyLoader()){
            this.fetchData();
        }
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

        if (newProps.dependency != this.state.dependency) {
            this.setState({
                dependency: newProps.dependency
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
    private onFocus =()=> {
        if (this.isLazyLoader()) {
            this.fetchData()
        }
    }
    private setLoading(loading: boolean) {
        this.setState({
            loading: loading
        })
    }
    private getAutoEnumsDependecy() {
        let { autoEnums, former } = this.props;
        if (autoEnums && autoEnums.params) {
            let dependency: any = former.getValue() || {};
            let autoEnumsDependency: any = {};

            Object.entries(autoEnums.params).forEach(([key, value]) => {
                if (typeof value == 'boolean') {
                    autoEnumsDependency[key] = dependency[key];
                }
            })

            return autoEnumsDependency;
        }
        return {};
    }
    
    private isChangeAutoEnumsDependency() {
        let { former } = this.props;
        let { autoEnumsDependency = {} } = this.state;
        let dependency: any = former.getValue() || {};
        
        if (dependency) {
            for (let key in autoEnumsDependency) {
                if (autoEnumsDependency[key] != dependency[key]) {
                    return true;
                }
            }
        }

        return false;
    }

    private needRefreshData() {
        return (this.props.autoEnums && this.isChangeAutoEnumsDependency()) || !utils.isValidArray(this.state.dataSource) || (this.state.search !== this.state.query); 
    }
    private fetchData(data?: any) {
        let { autoEnums } = this.props;
        let { dataSource } = this.props['x-type-props'] || {};
        let isLabelValue: boolean = utils.isPlainObject(this.state.value);
        let source: any = data ||  dataSource || this.props.dataSource;

        if (!source && autoEnums) {
            // 创建自动枚举
            // 从接口获取，自动和依赖关系绑定
            source = this.autoEnumsRequest;
        }
        
        if (source) {
            // TODO 如果参数变化之后不cache
            if (this.needRefreshData()) {
                this.setLoading(true);
                // loading 之前清空
                if (autoEnums) {
                    this.setState({
                        dataSource: [],
                        value: ''
                    })
                }
                
                UtilsDatasource.getSource(source, {
                    //...this.state.runtimeValue, 
                    query: this.state.search
                }).then((data: any) => {
                    let datasource: any = isLabelValue ? this.markDataSource([this.state.value, ...data]) :data;
                    this.setState({
                        dataSource: datasource,
                        loading: false,
                        originSource: datasource,
                        query: this.state.search,
                        value: autoEnums ? '' : this.state.value,
                        autoEnumsDependency: this.getAutoEnumsDependecy()
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
        }).map (it => ({...it, value: it.value, label: it.label}))
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
    public renderLabel(value: any,label:string) {
        
        let dataSource: any = this.getDatasource();
        let find: any = dataSource.find(it => it.value == value);   
        if (find) {
            if (find.icon) {
                return (<>{TablerUtils.renderIconComponent(find)}<span>{find.label}</span></>)
            } else {
                if (find.color) {
                    return (<>
                        <span className='ui-label-name' style={{backgroundColor: find.color}}></span>
                        {label}
                    </>)
                }
            }
        }
        return label;
    }
    private getDatasource() {
        let { dataSource = [], dependency } = this.state;

        if (dependency) {
            //dataSource = dataSource.filter(it => dependency.includes(it.value));
            dataSource = dataSource.filter(it => {
                if (it.dependency) {
                    return Object.entries(it.dependency).some(([key, value]:any) => {
                       let dependValue: any = keypath.get(dependency, key);
                       return value.includes(dependValue);
                    });
                }
                return true;
            });
        }
        
        return this.makeGroupDataSource(dataSource);
    }
    public render() {
        let props:any = this.props['props'] || this.props['x-type-props'] || {};
        let popupMatchSelectWidth = props.popupMatchSelectWidth !== undefined ? props.popupMatchSelectWidth : this.props.popupMatchSelectWidth;
        let disabled: boolean = props.disabled || this.props.disabled;

        let tooltip: string = props.tooltip =='auto' ? this.findCurrentLabel().label  : props.tooltip || this.props.tooltip;
        let value: any = this.clearValue(this.state.value);
        let dataSource: any = this.getDatasource();
        
        return (
            <Tooltip title={this.state.errorMessage || tooltip} placement='topLeft'>
                <Select
                    allowClear={!utils.isUndefined(props.autoClear) ? props.autoClear : this.props.autoClear}    
                    
                    status={this.getStatus()}
                    {...props}
                    placeholder={props.placeholder || this.props.placeholder}
                    onFocus={this.onFocus}
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
                    options={dataSource}
                    optionRender={(value:any) => {
                        return this.renderLabel(value.value, value.label)
                    }}
                    labelRender={({ value, label }: any) => {
                        return this.renderLabel(value, label)
                    }}
                >
                </Select>
            </Tooltip>
        )
    }
}
