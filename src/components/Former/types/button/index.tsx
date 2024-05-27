/*
 * @Author: your name
 * @Date: 2020-09-01 21:39:28
 * @LastEditTime: 2021-10-26 09:30:51
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /designer/Users/iceet/work/hucsin/blocksx/packages/design-components/src/former/types/input/index.tsx
 */
import React from 'react';
import classnames from 'classnames';
import { IFormerBase } from '../../typings';

import { Button } from 'antd';

interface IFormerInput extends IFormerBase {
    value: any,
    size: any,
    disabled?: boolean,
    onChangeValue: Function
}
export default class FormerButton extends React.Component<IFormerInput, { value: any }> {
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
    

    public render() {
        return (
            <Button value="d" size="small" />
        )
    }
}