/*
 * @Author: your name
 * @Date: 2020-09-01 21:39:28
 * @LastEditTime: 2021-10-26 09:30:51
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /designer/Users/iceet/work/hucsin/blocksx/packages/design-components/src/former/types/input/index.tsx
 */
import React from 'react';
import { IFormerBase } from '../../typings';
import * as Icons from '../../../Icons';
import { Input } from 'antd';

import './style.scss';

interface IFormerInput extends IFormerBase {
    value: any,
    size: any,
    disabled?: boolean,

    onChangeValue: Function;
    onFocus?: Function;
    onBlur?: Function;
    readonly?: boolean;
}
export default class FormerInput extends React.Component<IFormerInput, {readonly: boolean, value: any }> {
    public constructor(props: IFormerInput) {
        super(props);
        this.state = {
            value: props.value,
            readonly: props.readonly || false
        };
        
    }
    public UNSAFE_componentWillReceiveProps(newProps: any) {
        
        if (newProps.value != this.state.value) {
            this.setState({
                value: newProps.value
            })
        }
        if (newProps.readonly != this.state.readonly) {
            this.setState({
                readonly: newProps.readonly || false
            })
        }
    }
    private onChange =(e: any)=> {
        const { value } = e.target;
        
        this.setState({
            value: value
        });
        
        this.props.onChangeValue(value);
    }

    public render() {
        let props:any = this.props['props'] || this.props['x-type-props'] || {};
        let disabled: boolean = props.disabled || this.props.disabled;


        if (props.prefix) {
            if (Icons[props.prefix]) {
                let IconView: any = Icons[props.prefix];
                props.prefix = <IconView/>
            }

        }
        
        
        if (props.type && props.type == 'password') {
            return (
                <Input.Password size={this.props.size} {...props} disabled={this.state.readonly || disabled} value={this.state.value} onChange={this.onChange} />
            )
        } else {
            return (
                <Input size={this.props.size}  {...props} onFocus={this.props.onFocus} onBlur={this.props.onBlur} style={{width: props.width}} disabled={this.state.readonly || disabled} value={this.state.value} onChange={this.onChange} />
            )
        }
    }
}