/*
 * @Author: your name
 * @Date: 2020-09-01 21:39:28
 * @LastEditTime: 2021-10-26 09:30:51
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /designer/Users/iceet/work/hucsin/blocksx/packages/design-components/src/former/types/input/index.tsx
 */
import React from 'react';
import { ColorPicker } from 'antd';
import classnames from 'classnames';
import { IFormerBase } from '../../typings';


interface IFormerColor extends IFormerBase {
    value: any,
    size?: any,
    disabled?: boolean,
    onChangeValue: Function
}
export default class FormerColor extends React.Component<IFormerColor, { value: any }> {
    public constructor(props: IFormerColor) {
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
      
        return (
            <ColorPicker 
                arrow ={false}
                className={classnames({
                    [`former-colorpicker-${this.props.size}`]: this.props.size
                })}
                {...this.props['x-type-props']} 
                disabled={this.props.disabled} 
                value={this.state.value} onChange={this.onChange} 
            />
        )
    }
}