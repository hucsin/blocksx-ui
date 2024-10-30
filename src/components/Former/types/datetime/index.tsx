import React from 'react';
import Date, {FormerDateProps } from '../date';

export default class FormerDatetime extends React.Component<FormerDateProps, {value: any, disabled?: boolean, errorMessage?: string}> {
    public static defaultProps = {
        format: 'YYYY/MM/DD HH:mm:ss'
    }
    public constructor(props: FormerDateProps) {
        super(props);
        this.state = {
            value: props.value,
            disabled: props.disabled
        }
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
    public render() {
        return <Date {...this.props} value={this.state.value} showTime disabled={this.state.disabled} errorMessage={this.state.errorMessage} />
    }
}