/**
 * 单选
 */

 import React from 'react';
 import classnames from 'classnames';
 import { utils } from '@blocksx/core';
 import { IFormerBase } from '../../typings';
 import * as FormerIcon from '../../../Icons';
 import UtilsDatasource from '../../../utils/datasource';
 import { Tooltip } from 'antd';
 import './style.scss';

 interface IFormerRadio extends IFormerBase {
    size?: any;
    dict?: any;
    dataSource?: any;
    onChangeValue: Function;
    value: any;
    disabled?: boolean;
 }

 export default class FormerRadio extends React.Component<IFormerRadio, {dataSource: any, props:any,disabled?: boolean, value: any }>{
    public static Viewer: any = FormerRadio;
    public static defaultProps = {
        size: 'small'
    }
    public constructor(props: IFormerRadio) {
        super(props);
        
        this.state = {
            props: props['x-type-props'] || {},
            value: props.value,
            disabled: props.disabled,
            dataSource: this.props.dataSource
        }
        
    }

    
    public componentDidMountss() {
        let dataSource: any = this.props.dataSource || this.state.props.dataSource;
        
        dataSource && UtilsDatasource.getSource(dataSource, {}).then(result => {

            this.setState({
              //  dataSource: result
            })
        })
    }
    private getLabelValue(value: any) {
        if (value && utils.isLabelValue(value)){
            return value.value;
        }
        return value;
    }

    public UNSAFE_componentWillReceiveProps(newProps: IFormerRadio) {
        
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
        
        if (this.props.viewer || this.state.disabled) {
            return;
        }
        let { value } = e.target;
        
        this.setState({
            value: value
        }, () => this.props.onChangeValue(value));

    }
    private getDatasource() {
      let datasource: any = this.state.dataSource || [];
      
      if (!datasource.length) {
        datasource = this.props.dict || [];
      }
      // 过滤 视图前面
      if (this.props.viewer) {
        return datasource.filter(it => it.value === this.state.value)
      }

      return datasource;
    }
    private renderButton() {
        let dataSource: any = this.getDatasource();
        
        let value: any = this.getLabelValue(this.state.value)
        return (
            
            /*<Radio.Group buttonStyle="solid" size={this.props.size} disabled={this.state.disabled}  onChange={this.onChangeValue} defaultValue={value}>
                {Array.isArray(dataSource) && dataSource.map((it: any) => {
                    
                    let VIcon = it.icon ? FormerIcon[`${it.icon}`] : null;
                    return (
                        <Radio.Button key={it.value} value={it.value}>{VIcon ? <VIcon/> :it.label}</Radio.Button>
                    )
                })}
            </Radio.Group>*/

            <div className='former-radio-button'>
                {dataSource.map((it: any) => {
                    
                    let VIcon = it.icon ? FormerIcon[`${it.icon}`] : null;
                    
                    return (
                        <label onClick={()=>{
                            
                            this.onChangeValue({
                                target: {
                                    value: it.value
                                }
                            })
                        }} className={classnames({
                            'ui-selected': it.value == value
                        })} key={it.value} >{VIcon ? <Tooltip title={it.description || it.label}><VIcon/></Tooltip> :it.label}</label>
                    )
                })}
            </div>
            
        )
    }
    private renderBlock() {
        let dataSource: any = this.getDatasource();
        let value: any = this.getLabelValue(this.state.value);
        
        return (
            <div className="former-radio-block">
                {
                    Array.isArray(dataSource) ? dataSource.map((it: any, index:number) => {
                        let VIcon = it.icon ? FormerIcon[`${it.icon}`] : null;
                        // 

                        return (
                            <div 
                                className={classnames('former-radio-block-item', {
                                    'former-radio-block-current': it.value === value,
                                    'former-radio-viewer': this.props.viewer,
                                    'former-radio-disabled': this.state.disabled
                                })}
                                key={index}
                                onClick={() => this.onChangeValue({
                                    target: {
                                        value: it.value
                                    }
                                })}
                                title={it.label}
                            >
                                {it.value === value ? <span className="former-radio-block-right"><FormerIcon.CheckOutlined/></span> : null}
                                {
                                    VIcon ? <VIcon/> : it.image ? <img src={it.image} /> : null
                                }
                                <span className='ui-text'>{it.label}</span>
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