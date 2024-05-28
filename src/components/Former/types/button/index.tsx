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
import TablerUtils from '../../../utils/tool';
import Drawer from './drawer';
import { Button } from 'antd';

import './style.scss';

interface IFormerInput extends IFormerBase {
    value: any,
    props: any;
    size: any,
    disabled?: boolean,
    onChangeValue: Function
}

export default class FormerButton extends React.Component<IFormerInput, { value: any, open: boolean }> {
    public static Viewer:any = FormerButton;
    public constructor(props: IFormerInput) {
        super(props);
        this.state = {
            value: props.value,
            open: false
        };
    }
    public UNSAFE_componentWillReceiveProps(newProps: any) {
        if (newProps.value != this.state.value) {
            this.setState({
                value: newProps.value
            })
        }
    }
    
    private renderIcon() {
        let { props = {} } = this.props;

        return TablerUtils.renderIconComponent(props);
    }

    private renderButton() {
        let { props = {} } = this.props;
        return (
            <Button type='link' icon={this.renderIcon()} onClick={()=> {this.setState({open: true})}} size="small" >{props.text}</Button>
        )
    }

    // link ,router, smartpage

    public render() {
        let { props = {} } = this.props;
        console.log(this.props, 222)
        
        if (props.type == 'smartpage') {
            return (
                <>
                    <Drawer onClose={()=>{this.setState({open: false})}} meta={props} record={this.props['recordValue']}  open={this.state.open} />
                    {this.renderButton()}
                </>
            )
        }

        console.log(this.props)
        return this.renderButton();
    }
}