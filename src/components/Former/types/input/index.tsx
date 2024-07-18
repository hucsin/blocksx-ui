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
import Icon from '@ant-design/icons/lib/components/Icon';

interface IFormerInput extends IFormerBase {
    value: any,
    size: any,
    disabled?: boolean,
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
                <Input.Password size={this.props.size} {...props} disabled={disabled} value={this.state.value} onChange={this.onChange} />
            )
        } else {
            return (
                <Input size={this.props.size}  {...props} style={{width: props.width}} disabled={disabled} value={this.state.value} onChange={this.onChange} />
            )
        }
    }
}