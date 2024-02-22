/**
 * 表格
 */


import React from 'react';
import classnames from 'classnames';

import { IFormerBase } from '../../typings';
import { UnorderedListOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Table, Button, Dropdown } from 'antd';
import UtilsTool from '../../../utils/tool';
import Former from '../../index';

import { utils } from '@blocksx/core';

import './style.scss';

interface IFormerTable extends IFormerBase {

    properties: any;
    value: any;
    onChangeValue: Function;
    viewer?: boolean;
    onGetDependentParameters?: Function;
    destoryKey: string;


    // props['x-type-props']
    /*
        mode: 'local' | 'remote'
        pagination: true,
        pageSize: 2,
        pageURI: string,
        addURI: string,
        viewURI: string,
        editURI: string,
        removeURI: string
    */
}
interface IFormerColumn {
    dataIndex: string;
    key: any;
    title: any;
    width?: number;
    fixed?: string;
    render?: Function;
    ellipsis?: boolean;
}
export default class FormerTable extends React.Component<IFormerTable, {
    isAdd: boolean,
    value: any,
    columns: any,
    visible: boolean,
    record: any,
    recordIndex?: number,
    props: any;
    pagination?: boolean;
    relyOnParams?: any;
    currentPage: number;
    pageSize: number;
    totalNumber?: number;
    loading?: boolean;
    viewer?: boolean;
    dataSource?: any[];
    actionType: string;
}> {
    private requset: {
        onPage: Function;
        onView: Function;
        onEdit: Function;
        onDelete: Function;
        onCreate: Function;
    }
    public static defaultProps = {
        destoryKey: '$$DESTROY$$'
    }
    public constructor(props: IFormerTable) {
        super(props);

        let _props: any = props['x-type-props'] || {};
        let _value: any = props.value || [];
        let remoteMode: boolean =  this.isRemoteMode();//_props['mode'] === 'remote';

        if (remoteMode) {
            this.requset = _props;
        }

        this.state = {
            value: _value,
            columns: this.getColumns(),
            visible: false,
            record: {},
            recordIndex: 0,
            viewer: props.viewer,
            isAdd: false,
            actionType: '',
            props: _props,
            loading: false,
            // 标记是否有分页控件
            pagination: _props.pagination,
            dataSource: _value || [],
            pageSize: this.getDefaultPageSize(_props, remoteMode, _value.length),//_props['pageSize'] || 10,
            currentPage: 1,
            totalNumber: remoteMode ? 0 : _value.length
        };

    }
    public componentDidMount() {
        this.resetDataSource(1);
    }


    public UNSAFE_componentWillReceiveProps(newProps: any) {
        if (newProps.value != this.state.value) {
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
    private resetDataSource(page?: number) {
        let { value, currentPage } = this.state;
        if (this.isRemoteMode()) {
            this.resetRemoteDataSource(page || currentPage)

        } else {
            // 本地模式
            let pageSize: number = this.getDefaultPageSize(this.props, false, value.length)
            let begin: number = (currentPage - 1) * pageSize;
            
            this.setState({
                pageSize,
                dataSource: value.filter(it => !it[this.props.destoryKey]).slice(begin, begin + pageSize)
            })
        }
    }
    private setLoading(state: boolean) {
        this.setState({
            loading: state
        })
    }
    private isRemoteMode() {
        let {  mode } = this.props['x-type-props'] || {};
        
        return mode 
            ? utils.isFunction(mode) 
                ?  mode(this.props)
                : mode === 'remote' 
            : false; 
    }
    private resetRemoteDataSource(page?: number) {

        let { onPage } = this.requset;
        
        this.setLoading(true);

        onPage({
            pageNumber: page || this.state.currentPage,
            pageSize: this.state.pageSize,
            ...this.getRelyOnParams()
        }).then(({ data, total } : any) => {
            this.setState({
                dataSource: data,
                loading: false,
                totalNumber: total
            })
        })
    }

    private remoteAddOrUpdate(data: any, isAdd: boolean, former: any) {
        let { onCreate, onEdit } = this.requset;
        if (isAdd ) {
            delete data.id;
        }
        (isAdd? onCreate : onEdit)({
            ...data,
            ...this.getRelyOnParams()
        }).then(()=> {
            former.setState({loading: false})
            this.resetDataSource();
            this.onClose();
        }).catch(e=> {
            former.setState({loading: false})
        })
    }

    private getDefaultPageSize(props: any, remoteMode: boolean, valueLength: number) {

        if (remoteMode || props.pagination) {
            return props['pageSize'] || 10;
        }

        return valueLength;
    }
    private getRelyOnParams() {
        let { params = {} } = this.state.props;

        if (this.props.onGetDependentParameters) {
            Object.assign(params, this.props.onGetDependentParameters(this.props) || {})
        }
        return params;
    }
    private getValue() {

        let value = this.state.value || [];
        value = value.slice(0, value.length);



        return value;
    }

    private canShow(it: any, columns: any[]) {
        // 当列数小于2的时候，强制显示
        if (columns.length <= 2) {
            return true;
        }

        return it.column;
    }
    private onClickFistCell (record: any) {
        this.setState({
            visible: true,
            viewer: true,
            record
        })
    }
    private getColumns() {
        let columns: any[] = [];
        let properties = this.props.properties;

        for (let prop in properties) {
            columns.push(Object.assign({
                key: prop
            }, properties[prop]));
        }
        // 排序重组
        columns = columns.sort((a: any, b: any) => {
            return a['x-index'] > b['x-index'] ? 1 : -1;
        }).filter((it: any) => {
            return this.canShow(it, columns)
        }).map((it: any, index: number) => {

            let props = it['x-type-props'] || {}
            
            return {
                title: it.title,
                key: it.key + index,
                dataIndex: it.key,
                width: it.width,
                ellipsis: true,
                render: (text: any, record: any, rowIndex: number) => {
                    let field: any = properties[it.key];
                    
                    return (
                        <span 
                            className={classnames({
                                'former-first-col': index == 0
                            })}
                            onClick={()=> {this.onClickFistCell(record)}}
                            key={[rowIndex,index].join('_')}
                        >
                            {UtilsTool.renderComponentByField(field, {
                                value: text,
                                ... (field['props'] || field['x-type-props'])
                            })}
                        </span>
                    );
                }
            }
        });

        return [
            
                {
                    title: '#',
                    'x-index': -1,
                    dataIndex: 'cid',
                    key: '0',
                    width: 40,
                    render: (_, __, row)=> {
                        
                        return <span>{row+1}</span>
                    }
                }
            ,
            ...columns,
            {
                title: 'Operate',
                dataIndex: '',
                key: 'la',
                width: 20,
                fixed: 'right',
                render: (_: any, record: any, index: number) => {
                    if (this.state.viewer) {
                        return (
                            <Button type='link' size="small"  onClick={() => this.onViewRow(record, index)}>View</Button>
                        )
                    } else {
                        return (
                            <Dropdown.Button
                                size="small"
                                type="link"
                                menu={{
                                    items: [
                                            {
                                                key: 'clone',
                                                label: 'Clone',
                                            },
                                            {
                                                key: 'delete', 
                                                label: 'Delete',
                                                danger: true
                                            }
                                        ],
                                        onClick:(item: any)=> {
                                            switch(item.key) {
                                                case 'clone':
                                                    this.onCopyRow(record, index);
                                                    break;
                                                case 'delete':
                                                    //this(record, index);
                                                    this.onRemoveRow(record, index)
                                                    break;
                                            }
                                        }
                                    }} onClick={() => this.onEditRow(record, index)}>
                                Edit
                            </Dropdown.Button>
                        )
                    }
                }
            }
        ]
    }
    private actionRecord(record: any, type: string, index: number) {
        this.setState({
            record: utils.copy(record),
            recordIndex: index,
            visible: true,
            actionType: type
        })
    }
    private onEditRow(record: any, index: number) {
        this.actionRecord(record, 'Edit', index);
    }
    private onViewRow(record: any, index: number) {
        this.actionRecord(record, 'View', index);
    }
    private onCopyRow(record: any, index: number) {
        let newCopy = utils.copy(record);
        // 删除ID
        delete newCopy.id;

        this.addRowValue('Clone', index, newCopy)
    }
    private getRecordIndex(index: number) {
        return this.state.pageSize * (this.state.currentPage - 1) + index;
    }
    private onRemoveRow(record: any, index: number) {
        
        if (this.isRemoteMode() && record.id) {
            let { onDelete } = this.requset;
            this.setLoading(true);
            
            onDelete(record).then(() => {
                this.setLoading(false)
                this.resetRemoteDataSource();
            }).catch(() => {
                this.setLoading(false)
            })

        } else {
            let value = this.getValue();
            let recordIndex: number = this.getRecordIndex(index);

            if (record.id) {
                /*value[recordIndex] = {
                    [this.props.destoryKey]: {
                        id: record.id,
                        guid: record.guid
                    }
                }*/
            } 
            value.splice(recordIndex, 1);
            
            
            this.setState({
                value: value
            }, ()=> {
                this.resetDataSource();
                this.props.onChangeValue(value);
            })
        }
    }
    private addRowValue(type?: string, pos?: number, val?: any) {
        //let value = this.getValue();
        let actionType: string = type || 'Create';
        this.setState({
            isAdd: true,
            actionType,
            record: val || {},
            recordIndex: pos,
            visible: true
        })
    }
    private onTableAddClick = () => {
        this.addRowValue();
    }
    private onClose = () => {
        this.setState({
            
            visible: false,
            isAdd: false
        })
    }

    private onSaveRow = (former: any) => {
        let value = this.getValue();
        let { recordIndex, record, isAdd } = this.state;
        
        // 远程模式下面需要
        if (this.isRemoteMode()) {

            this.remoteAddOrUpdate(record, isAdd, former)

        } else {
            // 新增

            if (isAdd) {
                if (utils.isUndefined(recordIndex)) {
                    value.push(record)
                } else {
                    value.splice(recordIndex as number, 0, record);
                }

            } else {
                if (recordIndex || recordIndex === 0) {
                    value[recordIndex] = record;
                }
            }
            
            this.setState({
                value
            }, () => {
                this.props.onChangeValue(value);
                this.resetDataSource();
                former.setState({loading: false})
            })

            this.onClose();
        }
    }
    private onPageChange(page: number) {

        this.setState({
            currentPage: page
        }, () => {
            this.resetDataSource();
        })
    }
    private getPaginationConfig(): any {
        let { pagination, totalNumber, pageSize, currentPage } = this.state;

        if (false === pagination) {
            return false;
        }

        return {
            size: 'small',
            total: totalNumber,
            pageSize: pageSize,
            current: currentPage,
            onChange: (page: number) => {
                this.onPageChange(page)
            }
        }
    }

    private getDataSource() {
        return this.state.dataSource
    }
    private getDefaultSchema() {
        return {
            type: 'object',
            properties: this.props.properties
        }
    }
    private renderSummary =(data)=> {
        if (this.state.viewer) {
            return null;
        }
        return (
            <div className='ui-former-add' onClick={this.onTableAddClick}><PlusCircleOutlined /> Create new records</div>
        )
    }
    private getDefaultTitle() {
        let { actionType } = this.state;
        if (actionType == 'Create') {
            return 'Create a new records';
        }
        return `${actionType} the records`
    }
    public render() {
        return (
            <div className="former-table" >

                <Table
                    tableLayout="fixed"
                    scroll={{ x: true }}
                    pagination={this.getPaginationConfig()}
                    rowKey={(record)=>  record.id || record.__id}
                    dataSource={this.getDataSource()}
                    columns={this.state.columns}
                    loading={this.state.loading}
                    size="small"
                    
                    onRow={(record, index: number) => {
                        return {
                            onDoubleClick: () => {
                                this.onEditRow(record, index)
                            }
                        }
                    }}
                    footer={this.renderSummary}
                />
                <Former
                    type="drawer"
                    title={this.getDefaultTitle()}
                    value={this.state.record}
                    visible={this.state.visible}
                    schema={this.getDefaultSchema()}
                    viewer={this.state.viewer}
                    column={'two'}
                    width={600}
                    onSave={(value, former) => {
                        this.setState({
                            record: {
                                ...value,
                                __id: +new Date
                            }
                        }, () => {
                            this.onSaveRow(former)
                        })
                    }}
                    okText ="Save"
                    size='small'
                    
                    autoclose={false}
                    cancelText='Cancel'
                    onClose={()=> {
                        this.setState({
                            visible: false
                        })
                    }}

                />
            </div>
        )
    }
}