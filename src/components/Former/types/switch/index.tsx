/*
 * @Author: your name
 * @Date: 2020-09-01 21:39:21
 * @LastEditTime: 2021-08-24 08:11:29
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: /designer/Users/iceet/work/hucsin/blocksx/packages/design-components/src/former/types/switch/index.tsx
 */
import React from 'react';
import { Switch, Tooltip } from 'antd';
import classnames from 'classnames';

import * as Icons from '../../../Icons';
import { IFormerBase } from '../../typings';
import Utils from '../../../utils';

import './style.scss';

interface IFormerSwitch extends IFormerBase {
    checkedIcon?: string;
    unCheckedText?: string;
    checkedText?: string;
    canOff?: boolean;
    unCheckedIcon?: string;
    value: any;
    size?: any;
    loading?: boolean;
    onChangeValue: Function;
}

class FormerSwitchViewer extends React.Component<{value: any}> {
    public render() {
        return (
            <Switch checked={this.props.value} disabled size={'small'}></Switch>
        )
    }
}

export default class FormerSwitch extends React.Component<IFormerSwitch, { value: any; loading: any }> {
    public static Viewer: any = FormerSwitchViewer;
    public static defaultProps = {
        loading: false,
        type: 'string'
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
        let props: any = this.props['x-type-props'] || this.props['props'] || {};
        let loading: boolean = this.state.loading && this.props.loading;
        let size: any = props.size || this.props.size || 'small';
        
        let unCheckedIcon: string = props.unCheckedIcon || this.props.unCheckedIcon;
        let checkedIcon: string = props.checkedIcon || this.props.checkedIcon;

        let UncheckedIconView: any = Icons[unCheckedIcon];
        let CheckedIconView: any = Icons[checkedIcon];
        
        return (
            <div className={classnames({
                "former-switch":true,
                [`former-size-${size}`]: size
            })}>
                <Tooltip title={this.props.tooltip}>
                    <Switch
                        {...this.props['x-type-props']} 
                        unCheckedChildren= {UncheckedIconView ? <UncheckedIconView/> : this.props.unCheckedText}
                        checkedChildren={CheckedIconView ? <CheckedIconView/> : this.props.checkedText}
                        loading  = {loading}
                        size     = {size}
                        disabled = {(false === this.props.canOff ? this.state.value : false) || this.props.disabled}  
                        checked  = {this.state.value} 
                        onChange = {this.onChange} 
                    />
                </Tooltip>
            </div>
        )
    }
}