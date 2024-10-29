import React from 'react';
import { utils } from '@blocksx/core';
import { Table,Popover } from 'antd';
import * as Icons from '../../Icons';
import ValueViewForm from '../form';


export default class ValueViewTable extends React.Component<{ value: any }, { value: any, columns: any }> {

    public constructor(props: any) {
        super(props);

        this.state = {
            value: props.value, 
            columns: this.getTableColumns(props.value)
        }
    }

    public UNSAFE_componentWillReceiveProps(nextProps: Readonly<{ value: any; }>): void {
        if(nextProps.value != this.state.value) {
            this.setState({
                value: nextProps.value,
                columns: this.getTableColumns(nextProps.value)
            })
        }
    }

    public getTableColumns(_value?: any) {
        let value = _value || this.state.value;
        let keys: any = new Map();

        value.forEach(it => {
            Object.keys(it).forEach(key=> {
                keys.set(key, 1)
            })
        })

        return Array.from(keys.keys());
        
    }
    private getTableRenderColumns(columns: any ) {
        return [{
            key: '#',
            title: <span className='ui-empty'>#</span>,
            width: 22,
            fixed: 'left',
            render: (_,__, index)=> {
                return <span className='ui-empty'>{index + 1}</span>;
            }
        },...columns.map(it => {
            return {
                key: it,
                title: utils.labelName(it),
                dataIndex: it,
                render: (_,text,t) => {
                    return this.renderCellItem(_)
                }
            }
        }), {
            key: '',
            width: 25,
            fixed: 'right',
            render: (record: any) => {
                let column = Object.keys(record).length > 8 ? 2 : 1;
                return this.renderPopover(
                    <span className='ui-valueview-table-button'><Icons.PicRightOutlined /></span>,
                    <ValueViewForm column ={column} value={record} />,
                    Math.max(column * 250, 350)
                )
            }
        }]
    }
    public renderPopover(children: any, content: any, width: number = 500) {
        return (
            <Popover overlayStyle={{width: width}} title={<><Icons.FileTextOutlined/> Detailed Fields</>} align={{offset: [14,-10]}} placement='topRight' overlayClassName="ui-tooltip-valueview"  content={content}>
                {children}
            </Popover>
        )
    }
    public renderCellItem(cell: any) {
        if (Array.isArray(cell)) {
            if (utils.isArrayObject(cell)) {
                return (
                    this.renderPopover(
                        <span className='ui-empty'>{'<Array>'}</span>,
                        <ValueViewTable value={cell}/>
                    )
                )
            } else {
                return JSON.stringify(cell)
            }
        } else {
            if (utils.isPlainObject(cell)) {
                return (
                    this.renderPopover(
                        <span className='ui-empty'>{'<Object>'}</span>,
                        <ValueViewForm value={cell}/>
                    )
                )
            }
        }
        return cell;
    }
    public renderTable() {
        return (
            <div className="ui-valueview-table">
                <Table 
                    size="small"
                    scroll={{ x: 'max-content',y: 26* 8 }}
                    columns={this.getTableRenderColumns(this.state.columns.slice(0, 5))}
                    dataSource={this.state.value}
                    pagination={false}
                ></Table>
            </div>
        )
    }
    public render() {
        return this.renderTable()
    }
}