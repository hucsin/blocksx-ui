import React from 'react';
import { utils } from '@blocksx/core';

import ValueViewTable from './table';
import ValueViewForm from './form';

import './style.scss';

interface ValueViewProps {
    type: 'auto' | 'json' | 'text',
    value: any
}

interface ValueViewState {
    type: any;
    value: any;
}

export default class ValueView extends React.Component<ValueViewProps, ValueViewState> {
    public constructor(props: ValueViewProps) {
        super(props);

        this.state = {
            type: props.type,
            value: props.value
        }
    }

    public UNSAFE_componentWillReceiveProps(nextProps: Readonly<ValueViewProps>): void {
        if (nextProps.value != this.state.value) {
            this.setState({
                value: nextProps.value
            })
        }

        if (nextProps.type != this.state.type) {
            this.setState({
                type: nextProps.type
            })
        }
    }

    public renderJSON(value?: any) {
        return JSON.stringify(value || this.state.value, null, 2)
    }

    public renderTEXT() {
        return JSON.stringify(this.state.value)
    }

    public renderAUTO() {   
        let { value } = this.state;
        if (utils.isArray(value)) {
            if (utils.isArrayObject(value)) {
                return (
                    <ValueViewTable value={value}/>
                )
            } else {
                return <pre>{this.renderJSON(value)}</pre>
            }
        } else {
            return <ValueViewForm value ={value} />
        }
    }

    public render() {

       /* return <ValueViewForm value={{
            key: 12,
            bna: 2323,
            baaidu: {
                kdy: 2,
                bad: 23,
                gige: {
                    ke: 3,
                    ba: 44,
                    adf: [
                        {
                            da: 3
                        }
                    ]
                }
            },
            asdf: [2,3],
            dfsfad: [
                {
                    key: 1,
                    adf: {
                        key: 2323,
                        name: 'dasdfasdf'
                    },
                    baidu:'dfdfd',
                    key1: 1,
                    baid1u:'dfdfd',
                    key2: 1,
                    bai2du:'dfdfd'
                }
            ]
        }} />*/
         
        switch(this.state.type) {
            case 'json':
                return <pre>{this.renderJSON()}</pre>;
            case 'text':
                return this.renderTEXT();
            default: 
                return this.renderAUTO();
        }
    }
}