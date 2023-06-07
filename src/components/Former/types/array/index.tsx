/*
 * @Author: your name
 * @Date: 2020-09-01 21:37:36
 * @LastEditTime: 2021-08-24 08:10:07
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: /designer/Users/iceet/work/hucsin/blocksx/packages/design-components/src/former/types/array/index.tsx
 */
import React from 'react';
import classnames from 'classnames';

import { PlusCircleOutlined } from '@ant-design/icons';

import FormerArrayItem from './item';
import { IFormerArray } from '../../typings';

import "./style.less";

interface IFormerArrays extends IFormerArray {
    value: any[],
    onChangeValue: Function
}

export default class FormerArray extends React.Component<IFormerArrays, { value: any }> {

    static Item = FormerArrayItem;

    public constructor(props: IFormerArrays) {
        super(props);

        this.state = {
            value: props.value
        };
    }
    private onArrayItemRemove(index: number) {
        let value = this.state.value;
            value.splice(index, 1);

        this.setState({
            value: value
        });

        this.props.onChangeValue(value);
    }
    private getDefaultValueByType() {
        let { items }  = this.props;

        if (items) {
            switch (items.type) {
                case 'object':
                    return {};
                case 'string':
                    return '';
            }
        }
        return '';
    }
    private onArrayItemAdd =()=> {
        let value = this.state.value || [];
            value.push(this.getDefaultValueByType());
        
        this.setState({
            value: value
        })
        this.props.onChangeValue(value);
    }
    private getChildren() {
        return React.Children.map(this.props.children, (it:any, index:number) => {
            
            let props = Object.assign({}, it.props);
            props.children = React.cloneElement(props.children);

            return React.cloneElement(it, Object.assign(props, {
                index: index,
                onArrayItemRemove: (index: number) => {
                    this.onArrayItemRemove(index);
                }
            }))
        })
    }
    
    private getEmptyChildren() {
        return (
            <div className="former-array-empty" onClick={this.onArrayItemAdd}>点击新增数组项</div>
        )
    }

    public render() {
        let children: any = this.props.children;
        let hasChildren = children && children.length > 0;
        
        return (
            <div className={
                classnames("former-array", {
                    
                })
            }>
                <div className="former-array-add" onClick={this.onArrayItemAdd}><PlusCircleOutlined/></div>
                {hasChildren ? this.getChildren(): this.getEmptyChildren()}
            </div>
        )
    }
}