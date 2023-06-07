/*
 * @Author: your name
 * @Date: 2020-09-01 21:39:21
 * @LastEditTime: 2021-08-24 08:11:29
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: /designer/Users/iceet/work/hucsin/blocksx/packages/design-components/src/former/types/switch/index.tsx
 */
import React from 'react';
import classnames from 'classnames';
import { IFormerBase } from '../../typings';
import { Switch } from 'antd';
import './style';

interface IFormerSwitch extends IFormerBase {
    value: any,
    onChangeValue: Function
}

export default class FormerSwitch extends React.Component<IFormerSwitch, { value: any }> {
    public constructor(props: IFormerSwitch) {
        super(props);
        this.state = {
            value: props.value
        }
    }
    public UNSAFE_componentWillReceiveProps(newProps: any) {
        if (newProps.value != this.state.value) {
            this.setState({
                value: newProps.value
            })
        }
    }
    private onChange = (checked: boolean)=> {
        this.setState({
            value: checked
        });

        this.props.onChangeValue(checked);
    }

    public render() {
        return (
            <div className="former-switch">
                <Switch  size="small" {...this.props['x-type-props']} disabled={this.props.disabled}  checked={this.state.value} onChange={this.onChange} />
            </div>
        )
    }
}