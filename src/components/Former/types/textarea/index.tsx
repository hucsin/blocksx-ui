/*
 * @Author: your name
 * @Date: 2020-09-18 17:59:23
 * @LastEditTime: 2022-03-02 20:59:54
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: /packages/design-components/src/former/types/textarea/index.tsx
 */
import React from 'react';
import { utils } from '@blocksx/core';
import { IFormerBase } from '../../typings';
import { Input,Tooltip } from 'antd';

interface IFormerTextarea extends IFormerBase {
    value: any,
    pre?: boolean;
    onChangeValue: Function;
    readonly?: boolean;
    errorMessage?: string;
}

class FormerTextareaViewer extends React.Component<IFormerTextarea, {disabled: boolean,errorMessage : string}> {
    public constructor(props:any) {
        super(props)
        this.state = {
            disabled: props.readonly,
            errorMessage: props.errorMessage
        }
    }
    public render() {
       if (this.props.value) {
            if (this.props.pre) {
                return (
                    <pre>
                        {this.props.value}
                    </pre>
                )
            }
            return (
                <p>{this.props.value}</p>
            )
        }

        return <span key={1} className='ui-label-empty'>{'<null>'}</span>
    }
}

export default class FormerTextarea extends React.Component<IFormerTextarea, { disabled?: boolean, value: any, errorMessage: string }> {

    public static Viewer: any = FormerTextareaViewer;
    public constructor(props: IFormerTextarea) {
        super(props);
        
        this.state = {
            value: props.value || '',
            errorMessage: props.errorMessage || '',
            disabled: this.getPropsDisabled(props) ||  props.readonly
        };
    }
    public UNSAFE_componentWillReceiveProps(newProps: any) {
        
        if (newProps.value != this.state.value) {
            this.setState({
                value: newProps.value || ''
            })
        }
       
        if (newProps.errorMessage != this.state.errorMessage) {
            this.setState({
                errorMessage: newProps.errorMessage
            })
        }

        let disabled: any =  this.getPropsDisabled(newProps) ;
        if (!utils.isUndefined(newProps.readonly)) {
            if (newProps.readonly != this.state.disabled) {
                this.setState({
                    disabled:disabled || newProps.readonly
                })
            }
        }
        if (disabled != this.state.disabled) {
            this.setState({
                disabled: disabled
            })
        }
        
    }
    private getPropsDisabled(props: any) {
        let xprops: any = props['x-type-props'] || props['props'] || {};
        return xprops.disabled;
    }
    private onChange =(e: any)=> {
        const { value } = e.target;
        
        this.props.onChangeValue(value);
    }
    private getStatus() {
        return this.state.errorMessage ? 'error' : ''
    }

    public render() {
        let props: any = this.props['x-type-props'] || this.props['props'] || {};
        
        return (
            <Tooltip title={this.state.errorMessage} placement='topLeft'>
                <Input.TextArea status={this.getStatus()} autoSize={{
                    minRows: props.minRows || 2,
                    maxRows: props.maxRows || 3
                }} {...utils.omit(this.props['x-type-props'], ['minRows', 'maxRows'])} disabled={this.state.disabled || this.props.disabled}  value={this.state.value} onChange={this.onChange} />
            </Tooltip>
        )
    }
}