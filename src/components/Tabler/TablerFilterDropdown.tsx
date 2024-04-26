import React from 'react';
import { Input,Space, Button, Select } from 'antd';
import classnames from 'classnames';

import { utils } from '@blocksx/core';
import { TablerField, LabelValue, SearcherWhereKey } from './typings';

interface FilterDropdownProps {
    fieldKey: string;
    field: TablerField;
    dataSource?: Function | any[];
    value?: SearcherWhereKey;
    searchType?: any;
    onSearch?: Function;
    onClear?: Function;
}
interface FilterDropdownState {
    value: SearcherWhereKey;
    single: boolean; // 单值
    range: boolean; // 区间
    dict: LabelValue[];
    query: string[];
    leftValue?: any;
    type?: string;
    rightValue?: any;
}


export default class FilterDropdown extends React.Component<FilterDropdownProps, FilterDropdownState> {
    static defaultProps = {
        searchType: [
            {
                value: 'match',
                label: '等于'
            },
            {
                value: 'unmatch',
                label: '不等于'
            },
            {
                value: 'include',
                label: '包含'
            },
            {
                value: 'exclusive',
                label: '不包含'
            },
            {
                value: 'range',
                label: '区间'
            }
        ]
    };
    private cache: any;
    private timer?: any;
    public constructor (props: FilterDropdownProps) {
        super(props);

        this.state = {
            single: true,
            range: false,
            dict: [],
            query: [],
            type: 'match',
            value: props.value || {
                type: 'match'
            }
        };
        this.cache = {};
    }
    public componentDidMount () {

        let { field } = this.props;
        let dict: any = field.dict;
        let { type, value } = this.state.value;

        // 有dict 的时候需要处理下dict
        if (dict) {
            if (utils.isFunction(dict)) {
                dict = dict(field);
                // 异步
                if (utils.isPromise(dict)) {
                    dict.then((dict: LabelValue[]) => {
                        this.setState({
                            dict
                        });
                    })
                }
            }

            // 同步
            if (utils.isArray(dict)) {
                this.setState({
                    dict: dict
                });
            }

            // 设置leftValue，rightValue
            if (utils.isArray(value)) {
                this.setState({
                    leftValue: value[0],
                    rightValue: value[1],
                    type
                })
            }
        } else {
            this.setState({
                leftValue: value,
                type
            })
        }
    }
    private getSearchType () {
        return this.props.searchType;
    }
    private setValue (value:any, isLast?:boolean) {
        if (isLast) {
            this.setState({
                rightValue: value
            })
        } else {
            this.setState({
                leftValue: value
            })
        }
    }
    private matchValue (value: string, search: string) {
        let match = this.cache[search];
        if (!match) {
            match = this.cache[search] = new RegExp(search, 'ig')
        }

        return !!value.match(match)
    }
    private setQuery (dataSource: any):any {
        let { fieldKey } = this.props;
        let query:string[] = [];

        if (dataSource) {
            if (utils.isArray(dataSource)) {
                dataSource.forEach((it: any) => {
                    it[fieldKey] && query.push(it[fieldKey])
                })
            } else {
                return this.setQuery(dataSource.data)
            }
        }

        this.setState({
            query
        })
    }
    private querySearch (search: any) {
        let { dataSource, fieldKey } = this.props;
        
        // 简单做一个截留
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }

        this.timer = setTimeout(() => {
            if (utils.isFunction(dataSource)) {
                let query = (dataSource as Function)(1, 10, {
                    [`${fieldKey}`]: {
                        type: 'include',
                        value: search
                    }
                })
                if (utils.isPromise(query)) {
                    query.then((val: any)  => {
                        this.setQuery(val)
                    })
                } else {
                    this.setQuery(query);
                }
            } else {
                // filter
                if (utils.isArray(dataSource)) {
                    let query: string[] = [];
                    (dataSource as any[]).forEach((it: any) => {
                        if (this.matchValue(it[fieldKey] || "", search)) {
                            query.push(it[fieldKey])
                        }
                    });
                    this.setState({
                        query
                    })
                }
            }
        }, 300)
    }
    // 只有select 这种带有词典的选项才能用select模式
    // langborder
    private renderGroupItem (isLast?: boolean) {
        let { leftValue, rightValue, range, dict, query } = this.state;
        let value = isLast ? rightValue : leftValue;
        // select
        if (utils.isValidArray(dict)) {

            return (
                <Select
                    allowClear
                    key = {isLast ? '1111' : '2222'}
                    value = {value}
                    className={classnames({
                        'filter-input-first': !isLast,
                        'filter-input-last': isLast
                    })}
                    popupClassName="tabler-filter-dropdownList"
                    mode  = 'multiple'
                    onChange = {(value: any) => {
                        this.setValue (value, isLast);
                    }}
                >
                    {dict.map((it:LabelValue) => {
                        return (
                            <Select.Option key={it.value} value={it.value}>{it.label}</Select.Option>
                        )
                    })}
                </Select>
            )
        // query
        } else {
           return ( <Select
                showSearch
                value={value}
                placeholder={value}
                defaultActiveFirstOption={false}
                
                filterOption={false}
                key = {isLast ? '1111' : '2222'}
                popupClassName="tabler-filter-dropdownList"
                className={classnames({
                    'filter-input-first': !isLast,
                    'filter-input-last': isLast
                })}
                onSearch={(value: any) => {
                    if (value) {
                        this.querySearch(value);
                        this.setValue (value, isLast);
                    } else {
                        this.setState({
                            query: []
                        })
                    }
                    
                }}
                onChange={(value:any) => {
                    this.setValue (value, isLast);
                }}
                notFoundContent={null}
            >
                {query.map((it: any, index: number) => {
                    return (
                        <Select.Option key={index} value={it}>{it}</Select.Option>
                    )
                })}
            </Select>
           )
        }
    }
    private renderDefaultSearch () {
        let searchType = this.getSearchType();
        return (
            <Space.Compact className={classnames({
                'input-group': true,
                'input-group-range': this.state.range
            })}>
                {this.renderGroupItem()}
                {this.state.range ? <Input
                    className="input-split"
                    style={{
                        borderLeft: 0,
                        borderRight: 0,
                        pointerEvents: 'none',
                    }}
                    key="444"
                    placeholder="~"
                    disabled
                /> : null}
                {this.state.range ? this.renderGroupItem(true) : null}
                <Select 
                    key="right-select"
                    popupClassName="tabler-filter-dropdownList"
                    value={this.state.type} 
                    
                    onChange={(value: any)=>{
                        this.setState({
                            type: value,
                            range: value === 'range'
                        })
                    }}
                    className="input-group-search"
                >
                    {searchType.map((it: any) => {
                        return <Select.Option key={it.value} value={it.value}>{it.label}</Select.Option>
                    })}
                </Select>
            </Space.Compact>
        )
    }

    private renderTimeSearch () {

    }
    private renderDateSearch () {

    }
    private onSearch =()=> {
        if (this.props.onSearch) {
            let { type, range, leftValue, rightValue } = this.state;
            this.props.onSearch({
                type: type,
                value: range ? [leftValue, rightValue] : leftValue
            })
        }
    }
    private onClear =()=> {
        this.setState({
            leftValue: undefined,
            rightValue: undefined,
            query: []
        })
        if (this.props.onClear) {
            this.props.onClear();
        }
    }
    private renderSearch(): React.ReactNode {
        return this.renderDefaultSearch()
    }
    public render() {
        return (
            <div className="tabler-filter-dropdown">
                <h3>过滤条件</h3>
                <div className="tabler-filter-input">
                    {this.renderSearch()}
                </div>
                <div className="tabler-filter-buttons">
                    <Button key="1" size="small" onClick={this.onClear}>清空</Button>
                    <Button key="2" size="small" type="primary" onClick={this.onSearch}>检索</Button>
                </div>
            </div>
        )
    }
}