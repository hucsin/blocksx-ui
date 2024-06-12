/*
 * @Author: your name
 * @Date: 2020-09-01 21:39:28
 * @LastEditTime: 2021-10-26 09:30:51
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /designer/Users/iceet/work/hucsin/blocksx/packages/design-components/src/former/types/input/index.tsx
 */
import React from 'react';
import { ColorPicker, Tooltip } from 'antd';
import classnames from 'classnames';
import { IFormerBase } from '../../typings';
import './style.scss'

interface IFormerColor extends IFormerBase {
    value: any,
    size?: any,
    disabled?: boolean,
    onChangeValue: Function
}

class FormerColorView extends React.Component<IFormerColor, { value: any }> {
    public render() {
        return (
            <>
                <span className='ui-former-color-view' style={{background:this.props.value}}></span>
                <span  className='ui-former-color-viewtext'>{this.props.value}</span>
            </>
        )
    }
}

export default class FormerColor extends React.Component<IFormerColor, { value: any }> {
    public static Viewer: any = FormerColorView;

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
        let hexColor: string = '#' + e.toHex()
        
        this.setState({
            value: hexColor
        });
        
        this.props.onChangeValue(hexColor);
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
