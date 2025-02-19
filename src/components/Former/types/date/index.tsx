
import React from 'react';
import { utils } from '@blocksx/core';
import { IFormerBase } from '../../typings';

import { DatePicker, Tooltip } from "antd";
import './style.scss'

export interface FormerDateProps extends IFormerBase {
    value: any,
    size: any,
    disabled?: boolean,
    showTime?: boolean,
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
    value: any;
    range?: boolean;
    format?: string;
    placeholder?: string;
    disabled?: boolean;
    errorMessage?: string;
}
export default class FormerDate extends React.Component<FormerDateProps, FormerDateState> {
    
    public static defaultProps  = {
        range: false,
        format: 'YYYY/MM/DD'
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
    private isShowTime() {
        let { format = "" } = this.state;

        return this.props.showTime || format.includes('HH');
    }
    public render() {
        let props:any = this.props['props'] || this.props['x-type-props'] || {};
        let disabled: boolean = props.disabled || this.props.disabled;
        let { value } = this.state;

        let dayjsValue =  value ? utils.getDayjs(value, this.state.format) : value;

        if (this.state.range) {
            let rangeValue: any = this.state.value || [];
            
            return (
                <Tooltip title={this.state.errorMessage} placement='topLeft'>
                    <DatePicker.RangePicker 
                        size={this.props.size}
                        disabled={disabled}  
                        width={props.width}
                        value={rangeValue.map(it => utils.getDayjs(it, this.state.format)) as any} 
                        format={this.state.format}
                        onChange={this.onChangeValue}
                    />
                </Tooltip>
            )
        }

        return(<Tooltip title={this.state.errorMessage} placement='topLeft'>
            <DatePicker 
                disabled={disabled}  
                size={this.props.size}
                {...props}

                width={props.width}
                style={{width: props.width}}
                status={this.state.errorMessage ? 'error' : ''}
                showTime={this.isShowTime()}
                placeholder={this.state.placeholder || this.state.format}
                defaultValue={dayjsValue} 
                format={this.state.format}
                onChange={this.onChangeValue}
            />
        </Tooltip>)
    }
}