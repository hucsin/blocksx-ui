/*
 * @Author: your name
 * @Date: 2020-09-01 21:41:05
 * @LastEditTime: 2021-08-24 08:10:58
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: /designer/Users/iceet/work/hucsin/blocksx/packages/design-components/src/former/types/number/index.tsx
 */
import React from 'react';
import classnames from 'classnames';
import { IFormerBase } from '../../typings';
import { InputNumber } from 'antd';
import './style.scss'

interface IFormerInput extends IFormerBase {
    value: any,
    size?: any;
    onChangeValue: Function;
    readonly?: boolean;
}
export default class FormerInput extends React.Component<IFormerInput, { readonly: boolean, value: any }> {
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
    private onChange =(value: any)=> {
        
        this.setState({
            value: value
        });
        
        this.props.onChangeValue(value);
    }

    public render() {
        let props:any = this.props['props'] || this.props['x-type-props'] || {};
        return (
            <InputNumber size={this.props.size} {...props}  style={{width: props.width}} disabled={this.state.readonly || this.props.disabled}  value={this.state.value} onChange={this.onChange} />
        )
    }
}