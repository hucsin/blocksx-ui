/**
 *
 * 喜欢星标
 */

import React from 'react';
import { IFormerBase } from '../../typings';
import { LoadingOutlined } from '../../../Icons'
import { Rate } from 'antd';
import { consume } from '../../../utils/dom';
import Utils from '../../../utils';

interface FormerRateProps extends IFormerBase {
    value: any;
    size: any;
    disabled?: boolean;
    loading?: boolean;
    onChangeValue: Function;
}

interface FormerRateState {
    value: any;
    star: number;
    loading: boolean;
    disabled?: boolean;
}

export default class FormerRate extends React.Component<FormerRateProps, FormerRateState> {
    public static defaultProps = {
        star: 1,
        size: 'default',
        type: 'string'
    }
    public constructor(props: FormerRateProps) {
        super(props);

        let typeProps: any = props['x-type-props'] || {}
        
        this.state = {
            value: props.value ? 1 : 0,
            loading: false,
            star: typeProps['star'] || 1,
            disabled: false
        }
    }
    public UNSAFE_componentWillUpdate(newProps: FormerRateProps) {
        let newValue: any = newProps.value ? 1 : 0;

        if (newValue!== this.state.value) {
            this.setState({
                value: newValue
            })
        }
        if (newProps.disabled !== this.state.disabled) {
            this.setState({
                disabled: newProps.disabled
            })
        }
    }
    public onChange =(e)=> {

        if (this.props.onChangeValue) {
            this.setState({loading: true});

            Utils.withPromise(this.props.onChangeValue(!!e), () => {
                this.setState({
                    loading:false,
                    value: e
                })
            }, () => {
                this.setState({loading:false})
            })
        }
    }
    public render() {
        return (
            <span onClick={e=>consume(e)}>
                {this.state.loading && this.props.loading 
                    ? <LoadingOutlined/>
                    : <Rate count={1} onChange={this.onChange} value={this.state.value} /> }
            </span>

        )
    }
}

