/**
 * 单选
 */

 import React from 'react';
 import classnames from 'classnames';
 import { IFormerBase } from '../../typings';
 import * as FormerIcon from '../../../Icons';
 import { Radio } from 'antd';
 import './style.scss';

 interface IFormerRadio extends IFormerBase {
    size?: any;
    dataSource?: any;
    onChangeValue: Function;
    value: any;
    disabled?: boolean;
 }

 export default class FormerRadio extends React.Component<IFormerRadio, { props:any,disabled?: boolean, value: any }>{
    
    public static defaultProps = {
        size: 'small'
    }
    public constructor(props: IFormerRadio) {
        super(props);

        this.state = {
            props: props['x-type-props'] || {},
            value: props.value,
            disabled: false
        }
        
    }
    public UNSAFE_componentWillUpdate(newProps: IFormerRadio) {
        if (newProps.disabled!==this.state.disabled) {
            this.setState({
                disabled: newProps.disabled
            })
        }
        
        if (newProps.value !== this.state.value) {
            this.setState({
                value: newProps.value
            })
        }
    }
    private onChangeValue =(e: any)=> {
        let { value } = e.target;

        this.setState({
            value: value
        }, () => this.props.onChangeValue(value));

    }
    public UNSAFE_componentWillReceiveProps(newProps: any) {
        if (newProps.value != this.state.value) {
            this.setState({
                value: newProps.value
            })
        }
    }
    private getDatasource() {
      return this.props['dataSource'] || this.state.props['dataSource'];
    }
    private renderButton() {
        let dataSource: any = this.getDatasource();

        return (
            <Radio.Group buttonStyle="solid" size={this.props.size} disabled={this.state.disabled}  onChange={this.onChangeValue} value={this.state.value}>
                {Array.isArray(dataSource) && dataSource.map((it: any) => {
                    let VIcon = it.icon ? FormerIcon[`${it.icon}`] : null;
                    return (
                        <Radio.Button key={it.value} value={it.value}>{VIcon ? <VIcon/> :it.label}</Radio.Button>
                    )
                })}
            </Radio.Group>
        )
    }
    private renderBlock() {
        let dataSource: any = this.getDatasource();

        return (
            <div className="former-radio-block">
                {
                    Array.isArray(dataSource) ? dataSource.map((it: any, index:number) => {
                        let VIcon = it.icon ? FormerIcon[`${it.icon}`] : null;
                        
                        return (
                            <div 
                                className={classnames('former-radio-block-item', {
                                    'former-radio-block-current': it.value === this.state.value
                                })}
                                key={index}
                                onClick={() => this.onChangeValue({
                                    target: {
                                        value: it.value
                                    }
                                })}
                                title={it.label}
                            >
                                {it.value === this.state.value ? <span className="former-radio-block-right"><FormerIcon.CheckOutlined/></span> : null}
                                {
                                    VIcon ? <VIcon/> : it.image ? <img src={it.image} /> : it.label
                                }
                            </div>
                        );
                    }) : null
                }
            </div>
        );
    }
    public render() {
        let { props } = this.state;

        // 按钮模式
        switch(props.type) {
            case 'block':
                return this.renderBlock();
            default:
                return this.renderButton();
        }
        
    }
 }