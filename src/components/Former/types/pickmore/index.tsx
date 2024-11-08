/**
 * 1v1 绑定, 非rely场景
 */
import React from 'react';
import classnames from 'classnames';
import { utils } from '@blocksx/core';
import i18n from '@blocksx/i18n';
import { IFormerBase } from '../../typings';
import Former from '../../../Former';
import { Table, Drawer, Space, Button, Alert } from 'antd';
import { BlockOutlined } from '@ant-design/icons';
import TablerUtils from '../../../utils/tool';
import FormerTool from '../../../utils/FormerTool';

import Tabler from '../../../Tabler';

import './style.scss';

interface FormerPickProps extends IFormerBase {
    value: any;
    rowKey?: string;
    size: any;
    notice?: string;
    fields?: any;
    searcher?: any;
    disabled?: boolean;
    onChangeValue: Function;
}

interface FormerPickState {
    open: boolean;
    value: any;
    dataSource: any;
    
    cacheValue: any;
    cacheOriginValue: any;
    viewOpen: any;
    viewer?: boolean;
    record?: any;
}

export default class FormerPickMore extends React.Component<FormerPickProps, FormerPickState> {

    private searbarRef: any;
    private labelValueMap: any;
    public static defaultProps = {
        rowKey: 'id',
        notice: 'Select a record from the data in the table below, and the system will automatically establish a binding relationship!'
    }
    public constructor(props: FormerPickProps) {
        super(props);

        this.state = {
            open: false,
            value: this.getDefaultValue(props.value),
            dataSource: props.value,
            viewer: props.viewer,
            cacheValue: null,
            cacheOriginValue: null,
            viewOpen: false,
            record: null
        }

        this.searbarRef = React.createRef();
    }
    private getDefaultValue(value){
        return value ? value.map(it => {
            if (utils.isPlainObject(it)) {
                return it[this.props.rowKey || 'id']
            }
            return it
        }) : []
    }
    public UNSAFE_componentWillReceiveProps(newProps: any) {
        let trueValue: any = this.getDefaultValue(newProps.value);
        if (trueValue.toString() != this.state.value.toString()) {
            this.setState({
                value: newProps.value
            })
        }
        if (newProps.viewer != this.state.viewer) {
            this.setState({
                viewer: newProps.viewer
            })
        }
    }
    
    private getFields() {
        return this.props.fields.filter(field => {
            return (field.column && field.major !== false) || field.major
        })
    }
    private getNoticeMessage() {
        return this.props.notice
    }
    private renderContent() {
        let typeProps: any = this.props['x-type-props'] || this.props['props'];
        
        return ( 
            <div className='ui-pickone-wrapper'>
                <Alert showIcon message={this.getNoticeMessage()} type='warning' />
                <Tabler
                    key={2}
                    multilineEdit={false}
                    fields={this.getFields()}
                    searcher={this.props.searcher}
                    dataSource={typeProps.onPage}
                    size='small'
                    mode="pickmore"
                    selectedRowKeys={this.state.value}
                    onChangeValue={this.onChangeValue}
                    auth={
                        {
                            view: false,
                            edit: false,
                            remove: false
                        }
                    }
                    noOperater={true}
                />
            </div>

        )
    }
    private onChangeValue = (rowKeys: any, rows:any)=> {
        
        this.setState({
            cacheValue: rowKeys,
            cacheOriginValue: rows
        })
    }
    private renderTitle() {
        return i18n.t('Bind the records', this.props)
    }
    private renderExtra() {
        return (
            <span ref={this.searbarRef}></span>
        )
    }
    private onSave = ()=> {
        this.setState({
            value: this.state.cacheValue,
            dataSource: this.state.cacheOriginValue,
            cacheValue: null,
            cacheOriginValue: null,
            open: false
        }, ()=> {
            if (this.props.onChangeValue) {
                this.props.onChangeValue(this.markTrueValue(this.state.value))
            }
        })
        
    }
    private renderFooter() {
        return (
            <Space>
                <Button size="small" disabled={!this.state.cacheValue || this.state.cacheValue.length==0} onClick={this.onSave} type="primary">{i18n.t('Binding the selected records')}</Button>
                <Button size="small"  onClick={()=>this.setState({open:false})} type="default">{i18n.t('Cancel')}</Button>
            </Space>
        )
    }
    private renderDrawer() {
        return (
            <Drawer
                title={this.renderTitle()}
                className='ui-former fromer-pick-wrapper'
                width={700}
                extra={this.renderExtra()}
                size='default'
                open={this.state.open}
                onClose={(v: any) => {
                    this.setState({
                        open: false
                    })
                }}
                
                footer={this.renderFooter()}
            >
                {this.renderContent()}

            </Drawer>
        )
    }
    private onClickView(record:any) {
        this.setState({
            viewOpen: true,
            record
        })
    }
    private removeItem(record: any) {
        let rowKey: any = record[this.props.rowKey || 'id'];
        let { value, dataSource } = this.state;

        this.setState({
            value: value.filter(it=> it != rowKey),
            dataSource: dataSource.filter(it=> it[this.props.rowKey || 'id'] != rowKey)
        }, () => {
            if (this.props.onChangeValue) {
                this.props.onChangeValue(this.markTrueValue(this.state.value))
            }
        })
    }
    private markTrueValue(value: any) {
        return value.map(it => {
            return {
                [this.props.rowKey || 'id'] : it
            }
        })
    }
    private getColumns() {
        let fields: any = this.props.fields;

        let columns: any =  fields.filter(field => {
            return field.column && field.major !== false && !field.motion
        }).map((field:any, index:number) => {

            return {
                title: field.name,
                key: field.key,
                dataIndex: field.key,
                width: field.width,
                ellipsis: true,
                render: (text: any, record: any, rowIndex: number) => {

                    return (
                        <span
                            className={classnames({
                                'former-first-col': index == 0
                            })}
                            key={[rowIndex,index].join('_')}
                            onClick={()=> this.onClickView(record)}
                         >
                            {FormerTool.renderComponentByField(field, {
                                value: text,
                                ... (field['props'] || field['x-type-props'])
                            })}
                        </span>
                    );
                }
            }
        })

        columns.unshift({
            title: '#',
            key: '2',
            width: 40,
            render: (_,__, row) => {

                return <span>{row+1}</span>
            }
        })
        if (!this.props.viewer) {
            columns.push({
                title: 'Operate',
                key: 323,
                width: 60,
                render:(text,record) => {
                    return (
                        <Button size="small" onClick={() => this.removeItem(record)} danger type="link">{i18n.t('Delete')}</Button>
                    )
                }
            })
        }

        return columns;
    }
    private onTableAddClick =() => {
        this.setState({
            open: true
        })
    }
    private renderSummary = (data) => {
        if (this.state.viewer) {
            return null;
        }
        return (
            <div className='ui-former-add' onClick={this.onTableAddClick}><BlockOutlined /> Binding new records</div>
        )
    }
    private getDefaultSchema =()=> {
        return TablerUtils.getDefaultSchema(this.props.fields)
    }
    public render() {
        return (
            <div className='former-pickmore former-table'>
                {this.renderDrawer()}
                <Table
                    tableLayout="fixed"
                    scroll={{ x: true }}
                    pagination={false}
                    rowKey={(record: any) => record.id || record.__id}
                    dataSource={this.state.dataSource}
                    columns={this.getColumns()}
                    size="small"
                    footer={this.renderSummary}
                />

                <Former
                    key={33}
                    type="drawer"
                    title={'View binding data details'}
                    value={this.state.record}
                    visible={this.state.viewOpen}
                    schema={this.getDefaultSchema()}
                    viewer={true}
                    column={'two'}
                    width={600}
                    okText ="Save"
                    //size='small'
                    
                    autoclose={false}
                    cancelText='Cancel'
                    onClose={()=> {
                        this.setState({
                            viewOpen: false
                        })
                    }}

                />
            </div>
        )
    }
}

