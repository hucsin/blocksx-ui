
import React from 'react';
import { IFormerBase } from '../../typings';
import dayjs from 'dayjs';
import { DatePicker } from "antd";
import './style.scss'

interface FormerDateProps extends IFormerBase {
    value: any,
    size: any,
    disabled?: boolean,

    range?: boolean,
    format?: string;
    onChangeValue: Function;
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
            value: props.value,
            range: typeof typeProps.range == 'undefined' ? props.range : typeProps.range,
            format: typeProps.format || props.format,
            placeholder: typeProps.placeholder,
            disabled: props.disabled
        };
    }
    public UNSAFE_componentWillReceiveProps(newProps: any) {
        
        if (newProps.value != this.state.value) {
            this.setState({
                value: newProps.value
            })
        }
        if (newProps.disabled != this.state.disabled) {
            this.setState({
                disabled: newProps.disabled
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

        if (this.state.range) {
            let rangeValue: any = this.state.value || [];
            
            return (
                <DatePicker.RangePicker 
                    size={this.props.size}
                    disabled={disabled}  
                    value={rangeValue.map(it => dayjs(it, this.state.format)) as any} 
                    format={this.state.format}
                    onChange={this.onChangeValue}
                />
            )
        }
       
        return(<DatePicker 
            disabled={disabled}  
            size={this.props.size}
            placeholder={this.state.placeholder}
            value={this.state.value && dayjs(this.state.value as any, this.state.format)} 
            format={this.state.format}
            onChange={this.onChangeValue}
        />)
    }
}