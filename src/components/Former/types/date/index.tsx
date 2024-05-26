
import React from 'react';
import { IFormerBase } from '../../typings';
import dayjs from 'dayjs';
import { DatePicker } from "antd";

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
}

interface FormerDateState {
    value: string | [string, string];
    range?: boolean;
    format?: string;
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
            format: typeProps.format || props.format
        };
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
        
        if (this.state.range) {
            let rangeValue: any = this.state.value || [];
            
            return (
                <DatePicker.RangePicker 
                    size={this.props.size}
                    disabled={this.props.disabled}  
                    value={rangeValue.map(it => dayjs(this.state.format, it)) as any} 
                    format={this.state.format}
                    onChange={this.onChangeValue}
                />
            )
        }
        return(<DatePicker 
            disabled={this.props.disabled}  
            size={this.props.size}
            value={this.state.value && dayjs(this.state.format, this.state.value)} 
            format={this.state.format}
            onChange={this.onChangeValue}
        />)
    }
}