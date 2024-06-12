/**
 * 检索bar
 * 包含两部分,快速选区和
 */

import React from 'react';
import { Space, Input, Switch } from 'antd';
import { debounce } from 'throttle-debounce';


import { select as FormerSelect , radio as FormerRadio } from '../Former/types'
 
export interface LabelValue {
    label: any;
    value: any;
}
export interface SearchBarProps {
    type?: string; // 检索模式 模糊搜索,模糊精确检索
    onChange?: Function;
    direction?: 'left' | 'right'; //检索区域布局方向, 默认left
    size?: any;
    disabled?: boolean;
    placeholder?: string;
    searchKey?: string; // 检索key 
    // 检索区域类型, 没指定就是全部字段
    //searchField?: string[] | string; // 只在本地数据模式下生效，
    // 只能加入一个快捷检索区域
    quick?: {
        type: 'select' | 'radio' | 'switch'; // 类型 select, radio
        mode?: "multiple" | "tags";
        field: string; // 字段
        data: LabelValue[];
        defaultValue?: any;
        props?: any;
    },
    value?: string;
    query?: string;
}

interface SearchBarState {
    disabled?: boolean;
    value?: string;
    query?: string;
}

export default class SearchBar extends React.Component<SearchBarProps, SearchBarState> {
    public static defaultProps = {
        direction: 'left',
        searchKey: 'query'
    }
    public constructor(props: SearchBarProps) {
        super(props);

        this.state = {
            disabled: props.disabled,
            value: props.quick?.defaultValue
        }
    }
    private onChangeValue =()=> {
        let value: any = {};
        
        if (this.props.searchKey) {
            value[this.props.searchKey] = this.state.query;
        }

        if (this.props.quick) {
            value[this.props.quick.field || 'quick'] = this.state.value;
        }

        this.props.onChange && this.props.onChange(value)
    }
    private onChangeQuickValue =(event: any)=> {
        let quickValue: any = (event && event.target) ? event.target.value : event;
        
        
        this.setState({
            value: quickValue
        }, this.onChangeValue)
    }
    private onChange = (event: any)=> {
        this.onChangeQueryValue(event);
    }
    public onChangeQueryValue =(event: any) => {
        
        let value: any = event && event.target ? event.target.value : event;
        
        this.setState({
            query: value
        },this.onChangeValue)
    }
    public renderQuick() {

        let { size, quick } = this.props;
        
        if (quick) {
            let dataSource: any = [...quick.data];

            switch (quick.type) {
                case 'switch':
                    let props = quick.props || {};
                    
                    return (
                        <Switch 
                            unCheckedChildren = {props.unCheckedText}
                            checkedChildren = {props.checkedText}
                            onChange={(checked)=> {
                                let value: any = checked;

                                if (checked) {
                                    if (typeof props.checkedValue !== 'undefined') {
                                        value = props.checkedValue
                                    }
                                } else {
                                    if (typeof props.unCheckedValue !== 'undefined') {
                                        value = props.unCheckedValue ;
                                    }
                                }

                                this.onChangeQuickValue(value === null ? undefined : value)
                            }}
                        />
                    )
                    break;
                case 'select':
                    return (
                        <FormerSelect 
                            value={this.state.value} 
                            size={size}
                            type='string'
                            
                            autoClear={true}
                            onChangeValue={this.onChangeQuickValue}
                            dataSource={dataSource}
                            x-type-props={{mode:quick.mode}} 
                        ></FormerSelect>
                    )
                default:
                    return (
                        <FormerRadio
                            value={this.state.value}
                            size={size}
                            dataSource={dataSource}
                            type='string'
                            onChangeValue={this.onChangeQuickValue}
                        ></FormerRadio>
                    )
            }
        }
    }

    public renderSearch() {
        
       return <Input.Search
            size={this.props.size}
            allowClear
            placeholder={this.props.placeholder}
            defaultValue={this.state.query}
            onSearch={this.onChangeQueryValue}
            disabled={this.state.disabled}
            onChange={debounce(300,this.onChange)}
        ></Input.Search>
    }

    public render() {

        
        if (this.props.direction == 'left') {
            return (
                <Space size={this.props.size}>
                    {this.renderQuick()}
                    {this.renderSearch()}
                    
                </Space>
            )
        } else {
            return (
                <Space size={this.props.size}>
                    {this.renderSearch()}
                    {this.renderQuick()}
                    
                </Space> 
            )
        }
    }

}