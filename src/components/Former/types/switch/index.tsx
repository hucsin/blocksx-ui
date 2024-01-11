/*
 * @Author: your name
 * @Date: 2020-09-01 21:39:21
 * @LastEditTime: 2021-08-24 08:11:29
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: /designer/Users/iceet/work/hucsin/blocksx/packages/design-components/src/former/types/switch/index.tsx
 */
import React from 'react';
import { Switch } from 'antd';

import { IFormerBase } from '../../typings';
import Utils from '../../../utils';

import './style.scss';

interface IFormerSwitch extends IFormerBase {
    value: any;
    size?: any;
    loading?: boolean;
    onChangeValue: Function;
}

export default class FormerSwitch extends React.Component<IFormerSwitch, { value: any; loading: any }> {
    public static defaultProps = {
        loading: false
    }
    public constructor(props: IFormerSwitch) {
        super(props);
        this.state = {
            value: props.value,
            loading: false
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

        if (this.props.loading) {
            this.setState({
                loading: true
            })
        }

        Utils.withPromise(this.props.onChangeValue(checked), () => {
            this.setState({
                value: checked,
                loading: false
            });
        }, ()=> this.setState({loading: false}))
    }

    public render() {
        let props: any = this.props['x-type-props'] || {};
        let loading: boolean = this.state.loading && this.props.loading;
        let size: any = this.props.size || props.size || 'small';

        return (
            <div className="former-switch">
                <Switch
                    {...this.props['x-type-props']} 
                    loading  = {loading}
                    size     = {size}
                    disabled = {this.props.disabled}  
                    checked  = {this.state.value} 
                    onChange = {this.onChange} 
                />
            </div>
        )
    }
}