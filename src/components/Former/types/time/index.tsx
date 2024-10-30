
import React from 'react';
import { IFormerBase } from '../../typings';
import dayjs from 'dayjs';
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
            value: props.value,
            range: typeof typeProps.range == 'undefined' ? props.range : typeProps.range,
            format: typeProps.format || props.format,
            placeholder: typeProps.placeholder,
            disabled: props.disabled,
            errorMessage: props.errorMessage
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

        return(<Tooltip title={this.state.errorMessage} placement='topLeft'>
            <TimePicker 
                disabled={disabled}  
                {...props}
                style={{width: props.width}}
                size={this.props.size}
                status={this.state.errorMessage ? 'error' : ''}
                placeholder={this.state.placeholder || this.state.format}
                value={this.state.value && dayjs(this.state.value as any, this.state.format)} 
                //format={this.state.format}
                onChange={this.onChangeValue}
            />
        </Tooltip>)
    }
}