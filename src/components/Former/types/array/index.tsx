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

import { PlusOutlined } from '@ant-design/icons';

import FormerArrayItem from './item';
import { IFormerArray } from '../../typings';

import "./style.scss";

interface IFormerArrays extends IFormerArray {
    value: any[],
    validation?: any;
    onChangeValue: Function;

    children?:any;

    moreItems?: any;
}

export default class FormerArray extends React.Component<IFormerArrays, { value: any }> {

    static Item = FormerArrayItem;
    private contextRef: any ;
    public constructor(props: IFormerArrays) {
        super(props);
        
        this.state = {
            value: props.value
        };

        this.contextRef = React.createRef();
    }
    private onChangeValue(value) {
        this.setState({
            value: value
        });

        this.props.onChangeValue(value);
    }
    private onChangeItemValue(value: any ,index: number) {
        let cuurentValue = this.state.value || [];

        cuurentValue[index] = value;
      
        this.onChangeValue(cuurentValue)

    }
    private onArrayItemRemove(index: number) {
        let value = this.state.value;
            value.splice(index, 1);

        this.onChangeValue(value);
    }
    private onArrayItemMove(index: number, step: number) {
        let value = this.state.value;
        let current: any = value[index];
        value.splice(index, 1)
        value.splice(Math.min(value.length,Math.max(0,index + step)),0, current);
        
        let currentValue = value.filter(Boolean);
        
        this.onChangeValue(currentValue)
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

        setTimeout(()=> {
            //
            if (this.contextRef.current) { 
                this.contextRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
            
        }, 0)
    }
    private getChildren() {
        let value: any = this.state.value || [];
        return React.Children.map(this.props.children, (it:any, index:number) => {
            
            let props = Object.assign({}, it.props);
            props.children = React.cloneElement(props.children);
            
            return React.cloneElement(it, Object.assign(props, {
                index: index,
                moreItems: this.props.moreItems,
                value: value[index],
                isLastItem: index === value.length -1,
                onArrayItemRemove: (index: number) => {
                    this.onArrayItemRemove(index);
                },
                onArrayItemMove: (index: number, step: number) => {
                    this.onArrayItemMove(index, step)
                },
                onChangeValue: (value: any, index: number) => {
                    this.onChangeItemValue(value, index);
                }
            }))
        })
    }
    
    public render() {
        let children: any = this.props.children;
        let hasChildren = children && children.length > 0;
        let { validation = {} } = this.props;
        let maxItems: number = validation.maxItems || 20;
        let limited: boolean = children.length >= maxItems;
        return (
            <div className={
                classnames("former-array", {
                    'former-array-nochildren': !hasChildren
                })
            }>
                <div className='former-array-content'>
                    {this.getChildren()}
                    <span  ref={this.contextRef}></span>
                </div>
                {limited? <div className='former-array-limit'>
                    Exceeds the maximum allowed number of items {!!children.length && <span>(total: {children.length})</span>}
                </div> :
                <div className="former-array-empty" onClick={this.onArrayItemAdd}><PlusOutlined/>Click to add array items {!!children.length && <span>(total: {children.length})</span>}</div>}
            </div>
        )
    }
}