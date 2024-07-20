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
    onChangeValue: Function
}
export default class FormerInput extends React.Component<IFormerInput, { value: any }> {
    public constructor(props: IFormerInput) {
        super(props);

        this.state = {
            value: props.value
        };
    }
    public UNSAFE_componentWillReceiveProps(newProps: any) {
        if (newProps.value != this.state.value) {
            this.setState({
                value: newProps.value
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
        return (
            <InputNumber size={this.props.size} {...this.props['x-type-props']} disabled={this.props.disabled}  value={this.state.value} onChange={this.onChange} />
        )
    }
}