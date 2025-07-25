
import React from 'react';
import { IFormerBase } from '../../typings';
import { utils } from '@blocksx/core'
import { TimePicker, Tooltip } from "antd";

import './style.scss'

interface FormerDateProps extends IFormerBase {
    value: any,
    size: any,
    disabled?: boolean,

    range?: boolean,
    format?: string;
    onChangeValue: Function;
    errorMessage?: string;
}   

interface DateProps {
    range?: boolean,
    format?: string;
    placeholder?: string;
}

interface FormerDateState {
    value: string | [string, string];
    range?: boolean;
    format?: string;
    placeholder?: string;
    disabled?: boolean;
    errorMessage?: string;
}
export default class FormerDateTime extends React.Component<FormerDateProps, FormerDateState> {
    public static defaultProps  = {
        range: false,
        format: 'HH:mm:ss'
    }
    public constructor(props: FormerDateProps) {
        super(props);
        let typeProps:DateProps = this.props['props'] || this.props['x-type-props'] || {};
        this.state = {
            value: this.getFixedTime(props.value),
            range: typeof typeProps.range == 'undefined' ? props.range : typeProps.range,
            format: typeProps.format || props.format,
            placeholder: typeProps.placeholder,
            disabled: props.disabled,
            errorMessage: props.errorMessage
        };
    }
    private getFixedTime(value) {
        if (value == '@now') {
            return utils.getDayjs(new Date(), this.props.format).format(this.props.format);
        }
        return value;
    }
    public componentDidMount(): void {
        // 处理默认值为@now的情况
        let { value } = this.props;
        if (value =='@now') {
            this.onChangeValue(null, this.getFixedTime(value))
        }
    }
    public UNSAFE_componentWillReceiveProps(newProps: any) {
        
        if (newProps.value != this.state.value) {
            this.setState({
                value: this.getFixedTime(newProps.value)
            })
        }
        if (newProps.disabled != this.state.disabled) {
            this.setState({
                disabled: newProps.disabled
            })
        }
        if (newProps.errorMessage != this.state.errorMessage) {
            this.setState({
                errorMessage: newProps.errorMessage
            })
        }
    }
    private onChangeValue =(e: any, datestring: any) => {
        
        if (datestring) {
            this.setState({
                value: datestring
            })
            this.props.onChangeValue && this.props.onChangeValue(datestring)
        }
    }
    public render() {
        let props:any = this.props['props'] || this.props['x-type-props'] || {};
        let disabled: boolean = props.disabled || this.props.disabled;
        let { value } = this.state;
        let dayjsValue: any ;
      
        if (value) {
            dayjsValue = value.includes('/') ? value : '1970/01/01 '  + value;
        }
        
        return(<Tooltip title={this.state.errorMessage} placement='topLeft'>
            <TimePicker 
                disabled={disabled}  
                {...props}
                style={{width: props.width}}
                size={this.props.size}
                status={this.state.errorMessage ? 'error' : ''}
                placeholder={this.state.placeholder || this.state.format}
                value={dayjsValue && utils.getDayjs(dayjsValue, this.state.format)} 
                //format={this.state.format}
                onChange={this.onChangeValue}
            />
        </Tooltip>)
    }
}