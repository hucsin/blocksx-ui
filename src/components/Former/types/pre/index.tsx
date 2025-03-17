import { utils } from '@blocksx/core';
import React from 'react';

import './style.scss';

export default class PreFormer extends React.Component<any, any> {
    public constructor(props: any) {
        super(props);

        this.state = {
            value: props.displayValue || props.value
        }

    }
    public UNSAFE_componentWillReceiveProps(nextProps: Readonly<any>, nextContext: any): void {
        if (utils.isUndefined(nextProps.displayValue)) {
            if (nextProps.value != this.state.value) {
                this.setState({
                    value: nextProps.value
                })
            }
        } else {
            if (nextProps.displayValue != this.state.value) {
                this.setState({
                    value: nextProps.displayValue
                })
            }
        }
    }
    public render() {
        return (
            <pre className='pre-former-wrapper'>
                {this.state.value}
            </pre>
        )
    }
}