/**
 * 表格
 */


import React from 'react';
import classnames from 'classnames';

import { IFormerBase } from '../../typings';
import { UnorderedListOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Table, Button, Dropdown, Tooltip } from 'antd';

import FormerTool from '../../../utils/FormerTool';
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
    extendsFor?: any;
    fields?: any[];
    errorMessage?: string;
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
    formerViewer?: boolean;
    dataSource?: any[];
    actionType: string;
    errorMessage?: string
}> {
    private requset: {
        onPage: Function;
        onView: Function;
        onEdit: Function;
        onDelete: Function;
        onCreate: Function;
    }
    private uniquedMap: Map<string, any>;
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
            totalNumber: remoteMode ? 0 : _value.length,
            errorMessage: props.errorMessage
        };

        this.uniquedMap = this.getUniquedMap()

    }
    private getUniquedMap() {
        let map: Map<string, any> = new Map();
        let {fields} = this.props;

        if (fields) {
            fields.forEach(it=> {
                if (it.isUniqued) {
                    map.set(it.fieldKey, it)
                }
            })
        }
        return map;
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
        if (newProps.errorMessage != this.state.errorMessage) {
            this.setState({
                errorMessage: newProps.errorMessage
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
            actionType: 'View',
            formerViewer: true,
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
                            {FormerTool.renderComponentByField(field, {
                                value: text,
                                size: 'small',
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
            isAdd: type =='Create' ? true : false,
            record: utils.copy(record),
            recordIndex: index,
            visible: true,
            formerViewer: type !=='View' ? false : true,
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
            formerViewer: actionType !== 'View' ? false : true,
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
        let title = ((this.props.title||'').replace(/[\s]/ig, '') || this.props['x-group'] || 'record').toLowerCase()
        
        let { actionType } = this.state;
        if (actionType == 'Create') {
            return 'Create a new ' + title;
        }
        return `${actionType} the ${title}`
    }
    private validationValue(value: any) {
        if (this.uniquedMap.size > 0) {
            let validationError: string[] = [];
            let valueList: any[] = this.state.value || [];

            this.uniquedMap.forEach((item, key) => {
                if (valueList.find(it => (it[key] == value[key]) && value.id !== it.id)) {
                    validationError.push(item.fieldName)
                }
            })

            return validationError.length ? `The value for field [${validationError.join(',')}] is duplicated.` : null;
        }
    }
    private getFormerKey() {
        
        let key: string = this.state.record && this.state.record['id'];
        return [this.state.actionType, this.state.recordIndex, key].join('_'); 
    }
    public render() {
        let { extendsFor = {}} = this.props;
        let { props = {} } = this.state;
        let formerType = props['formerType'] || 'drawer';
        let pageMeta = extendsFor.meta || {};


        return (

            <Tooltip title={this.state.errorMessage} placement='topLeft'>
            <div className={classnames({
                "former-table": true,
                "former-table-error": this.state.errorMessage
            })} >
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
                
                {this.state.visible && <Former
                    type={formerType}
                    title={this.getDefaultTitle()}
                    icon="GoogleSheetsBrandFilled"
                    value={this.state.record || {}}
                    visible={this.state.visible}
                    onVisible={(visible)=> {
                        this.setState({
                            visible
                        })
                    }}
                    schema={this.getDefaultSchema()}
                    viewer={this.state.formerViewer}
                    column={utils.isMobileDevice() ? 'one': 'two'}
                    placement={'rightTop'}
                    key={this.getFormerKey()}
                    width={formerType == 'popover' ? 450 : 700}
                    groupType={pageMeta.props && pageMeta.props.groupType}
                    groupMeta={pageMeta.props && pageMeta.props.groupMeta}
                    canmodify={this.state.record && !!this.state.record['id']}
                    onSave={(value, former, message) => {
                        
                        if (message = this.validationValue(value)) {

                            return Promise.reject(message);
                            // todo
                        } else {
                            this.setState({
                                record: {
                                    ...value,
                                    __id: +new Date
                                }
                            }, () => {
                                this.onSaveRow(former)
                            })
                        }
                    }}
                    okText ="Save"
                    size='default'
                    
                    autoclose={false}
                    cancelText='Cancel'
                    onClose={()=> {
                        this.setState({
                            visible: false
                        })
                    }}

                ><span className='table-former-footer' >1</span></Former>}
            </div>
            </Tooltip>
        )
    }
}