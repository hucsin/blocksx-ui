/*
 * @Author: your name
 * @Date: 2020-09-18 17:59:23
 * @LastEditTime: 2022-03-02 20:59:54
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: /packages/design-components/src/former/types/textarea/index.tsx
 */
import React from 'react';
import classnames from 'classnames';
import { IFormerBase } from '../../typings';
import { Input } from 'antd';

interface IFormerTextarea extends IFormerBase {
    value: any,
    onChangeValue: Function
}

class FormerTextareaViewer extends React.Component<IFormerTextarea> {
    public constructor(props:any) {
        super(props)
    }
    public render() {
       if (this.props.value) {

            return (
                <pre>
                    {this.props.value}
                </pre>
            )
        }

        return <span key={1} className='ui-label-empty'>{'<null>'}</span>
    }
}

export default class FormerTextarea extends React.Component<IFormerTextarea, { value: any }> {

    public static Viewer: any = FormerTextareaViewer;
    public constructor(props: IFormerTextarea) {
        super(props);

        this.state = {
            value: props.value || ''
        };
    }
    public UNSAFE_componentWillReceiveProps(newProps: any) {
        if (newProps.value != this.state.value) {
            this.setState({
                value: newProps.value || ''
            })
        }
    }
    private onChange =(e: any)=> {
        const { value } = e.target;
        
        this.props.onChangeValue(value);
    }

    public render() {
        return (
            <Input.TextArea rows={3} {...this.props['x-type-props']} disabled={this.props.disabled}  value={this.state.value} onChange={this.onChange} />
        )
    }
}