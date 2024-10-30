import React from 'react';
import classnames from 'classnames';
import { utils } from '@blocksx/core';
import { Descriptions } from 'antd';

import ValueViewTable from './table/index'

export default class ValueViewForm extends React.Component<{ value: any, column?: number, title?: string}, { value: any, total: number}> {
  
    public constructor(props: any) {
        super(props);

        this.state = {
            value: props.value,
            total: Object.keys(props.value).length
        }
    }

    public UNSAFE_componentWillReceiveProps(nextProps: Readonly<{ value: any; }>): void {
        if(nextProps.value != this.state.value) {
            this.setState({
                value: nextProps.value,
                total: Object.keys(nextProps.value).length
            })
        }
    }
    public getLayoutData() {
        let { value } = this.state;
        let keys: any = Object.keys(value);
        let defaultTitle: string = this.props.title || 'default';
        let layoutIndex: any = [{
            type: 'object',
            value: defaultTitle
        }]
        let layout: any = {[`${defaultTitle}`]: {}};

        keys.forEach(it => {
            let val: any = value[it];
            if (utils.isArray(val)) {
                if (utils.isArrayObject(val)) {
                    layoutIndex.push({
                        type: 'table',
                        value: it
                    });
                    layout[it] = val 
                } else {
                    layout[defaultTitle][it] = val;
                }
            } else {
                if (utils.isPlainObject(val)) {
                    layoutIndex.push({
                        type: 'value',
                        value: it
                    });
                    layout[it] = val;
                } else {
                    layout[defaultTitle][it] = val
                }
            }
        })

        return {
            layout,
            layoutIndex
        }
    }
    public renderItem(type: string, value: any, title: string) {
        switch(type) {
            case 'value':
                return (
                    <ValueViewForm  value={value} title={title} />
                )
            case 'table':
                return (
                    <div className='ant-descriptions'>
                        <div className='ant-descriptions-title '>{title}<span className='ui-empty'>{'<Array>'}</span></div>
                        <div className='ant-descriptions-view'><ValueViewTable value={value} /></div>
                    </div>
                )
            case 'object':
                let valueLength: number = Object.keys(value).length;
                let column: number = this.props.column || (valueLength < 8 ? 1 : 2 );

                return (
                    <Descriptions  column={ column } className={classnames({
                        [`ui-valueview-${title}`]: true
                    })} title={title == 'default' ? '' : <>{title }<span className='ui-empty'>{'<Object>'}</span></>} items={this.getDescritions(value, title == 'default' ? '' : title)} />
                )

        }
    }
    public getDescritions(value:any, title:string): any {
        return Object.entries(value).map(([key, value]) => {

            if (Array.isArray(value)) {
                value = JSON.stringify(value);
            }
            let valueLength: number = String(value).length;
            return {
                key: key,
                label: title ? ['',key].join('.') :utils.labelName(key),
                span: valueLength > 25 ?  valueLength < 100 ? 2 : 3 : 1,
                children: typeof value =='boolean'? value.toString() : value
            }
        })
    }
    public render() {
        let { layout, layoutIndex }= this.getLayoutData();
        let defaultTitle: string = this.props.title || 'default';
        
        return (
            <div className={classnames({
                'ui-valueview': true,
                [`ui-valueview-wrapper-${defaultTitle}`]: defaultTitle
            })}>
                {
                    layoutIndex.map(({type, value}) => this.renderItem(type, layout[value], value))
                }
            </div>
        )
    }
}