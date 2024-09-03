import React from 'react';
import { Icons } from '@blocksx/ui'
import { Table, Descriptions } from 'antd';


interface OutputTextValueProps {
    type: 'json' | 'text' | 'auto',
    value: any;
}
interface OutputTextValueState {
    value: any;
    type: any;
    columns: any;
}

export default class OutputTextValue extends React.Component<OutputTextValueProps, OutputTextValueState> {

    public constructor(props: OutputTextValueProps) {
        super(props);

        this.state = {
            type: props.type,
            value: props.value,
            columns: this.getTableColumns(props.value)
        }
    }

    public UNSAFE_componentWillReceiveProps(nextProps: Readonly<OutputTextValueProps>, nextContext: any): void {
        if (nextProps.value != this.state.value) {
            this.setState({
                value: nextProps.value,
                columns: this.getTableColumns(nextProps.value)
            })
        }

        if (nextProps.type != this.state.type) {
            this.setState({
                type: nextProps.type
            })
        }
    }

    public renderJson() {
        return JSON.stringify(this.state.value, null, 2)
    }
    public renderText() {
        return JSON.stringify(this.state.value)
    }
    public renderAuto() {
        return Array.isArray(this.state.value) 
            ? this.renderTable()
            : this.renderDescriptions();
    }

    public renderDescriptions() {
        return 'dd'
    }



    public render() {

        switch(this.state.type) {
            case 'json':
                return this.renderJson();
            case 'text':
                return this.renderText();
            default:
                return this.renderAuto();
        }
    }
}