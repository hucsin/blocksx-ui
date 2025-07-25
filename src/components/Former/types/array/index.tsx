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

import { Tooltip } from 'antd'; 

import "./style.scss";

interface IFormerArrays extends IFormerArray {
    value: any[],
    former: any;
    validation?: any;
    onChangeValue: Function;

    children?:any;

    moreItems?: any;
    props?: any;
    fieldName?: string;
    readonly?: boolean;

    errorMessage?: string;
}

export default class FormerArray extends React.Component<IFormerArrays, { errorMessage?: string, disabled: boolean, value: any, readonly: boolean }> {

    static Item = FormerArrayItem;
    private contextRef: any ;
    public constructor(props: IFormerArrays) {
        super(props);
        
        this.state = {
            value: props.value,
            disabled: this.getDisabled(props),
            readonly: props.readonly || false,
            errorMessage: props.errorMessage || ''
        };
        
        this.contextRef = React.createRef();
    }
    private getDisabled(propss: any) {
        let { props = {} } = this.props;

        return ((propss || this.state).readonly) || (typeof props.disabled !== 'undefined' ? props.disabled : this.props.disabled);
    }
    public UNSAFE_componentWillReceiveProps(nextProps: Readonly<IFormerArrays>): void {
        if (nextProps.value !== this.state.value) {
            this.setState({
                value: nextProps.value
            })
        }
        if (nextProps.readonly !== this.state.readonly) {
            this.setState({
                readonly: nextProps.readonly || false
            })
        }
        if (nextProps.errorMessage !== this.state.errorMessage) {
            this.setState({
                errorMessage: nextProps.errorMessage || ''
            })
        }
    }
    private onChangeValue(value) {
        this.setState({
            value: value
        });

        this.props.onChangeValue(value);
    }
    private onChangeItemValue(value: any ,index: number) {
        let cuurentValue = this.state.value || [];

        cuurentValue[index] = {...cuurentValue[index], ...value};

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
        let { props = {  } } = this.props;
        let defaultSize: string = props.size || 'default';
        
        let value: any = this.state.value || [];
        return React.Children.map(this.props.children, (it:any, index:number) => {
            
            let props = Object.assign({}, it.props);
            props.children = React.cloneElement(props.children);
            
            return React.cloneElement(it, Object.assign(props, {
                index: index,
                moreItems: this.props.moreItems,
                value: value[index],
                size: defaultSize,
                former: this.props.former,
                disabled: this.state.disabled,
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
    private renderFooter() {

        let children: any = this.props.children;
        let { validation = {}, props = {} } = this.props;
        let maxItems: number = validation.maxItems || 20;
        let limited: boolean = children.length >= maxItems;

        if (this.state.disabled) {
            return (
                <div className='former-array-limit'>{props.notice}</div>
            )
        } else {
            return limited ? <div className='former-array-limit'>
                Exceeds the maximum allowed number of items {!!children.length && <span>(total: {children.length})</span>}
            </div> :
                <div className="former-array-empty" onClick={this.onArrayItemAdd}>
                    <PlusOutlined/>Click to add {(this.props.fieldName || 'array items').toLowerCase()} {!!children.length && <span>(total: {children.length})</span>}
                </div>
        }
        
    }
    public render() {
        let children: any = this.props.children;
        let hasChildren = children && children.length > 0;
        return (
            <Tooltip title={this.state.errorMessage}>
                <div className={
                    classnames("former-array", {
                        'former-array-error': !!this.state.errorMessage,
                        'former-array-nochildren': !hasChildren,
                        'former-array-disabled': this.state.disabled
                    })
                }>
                    <div className='former-array-content'>
                        {this.getChildren()}
                        <span  ref={this.contextRef}></span>
                    </div>
                    {this.renderFooter()}    
                </div>
            </Tooltip>
        )
    }
}