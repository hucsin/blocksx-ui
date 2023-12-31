/**
 * 简易表格功能
 * 只处理简单的表格，表单，不处理复杂的表格表单逻辑
 * 功能如下：
 * 1、常规操作
 *      1. 编辑
 *      2. 详情
 *      3. 删除
 * 2、批量操作
 * 
 */

import React from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';

import { Spin, Table, Input, Select, Radio, Space, Dropdown, Menu, Button, Divider, Popconfirm, Modal } from 'antd';
import { DownOutlined, CaretDownOutlined, PlusCircleOutlined } from '../Icons/index';
import { utils } from '@blocksx/core';
import i18n from '@blocksx/i18n';
import { template } from '../utils/string';

import { TablerProps, RowOperate, SearcherWhereKey, TablerField } from './typings';
import { DEFAULT_COLUMNS_ACTION, DEFAULT_BATCH_ACTION } from './config';


import './styles/index.scss';
import AuthFilter from './AuthFilter';
import ResizableTitle from './TablerResizableTitle';
import FilterDropdown from './TablerFilterDropdown';
import TablerCell from './TablerCell';
import TablerFormer from './TablerFormer';

export interface TablerState {
    quickValue?: any;
    columns?: any;
    // 检索条件
    searcher: any;
    total?: number; // 总条数
    selected?: number;// 选中条数
    selectedRowKeys?: any[];
    pageSize?: number;
    dataSource?: any;
    originalDataSource?: any; // 原始的数据
    currentPage?: number;
    // 标记是否为本地数据
    localData?: boolean;
    cacheSize?: any;
    cacheFilter?: any;
    // 单行编辑控制属性
    multilineEdit?: number | undefined;
    multilineDataCache?: object; // 当行数据缓存

    // 数据缓存
    currentRowData?: any;
    formerAction?: any;

    loading?: boolean;
    reflush?: any;
}

export default class Tabler extends React.Component<TablerProps, TablerState> {

    static defaultProps = {
        pageSize: 5,
        currentPage: 1,
        size: 'middle',
        resizeMaxColumns: 7,
        rowKey: 'id',
        formerType: 'drawer',
        createText: i18n.t('Create new records'),
        formerAction: '',
        quickValue: '',
        rowSelection: false
    }
    private authFilter: AuthFilter;
    private tableDOM?: any;
    private columns: any[];

    public constructor(props: TablerProps) {
        super(props);
        this.state = {
            currentPage: 1,
            total: 0,
            selected: 0,
            selectedRowKeys: [],
            pageSize: props.pageSize,
            searcher: {},
            localData: true,
            cacheSize: {},
            cacheFilter: {},
            loading: false,
            reflush: props.reflush
        };

        this.authFilter = new AuthFilter(this);
    }
    public componentDidMount() {
        this.initDataSource(this.props);
        this.tableDOM = ReactDOM.findDOMNode(this);
    }
    public UNSAFE_componentWillUpdate(newProps: any) {
        if (newProps.reflush !== this.state.reflush) {
            this.setState({
                reflush: newProps.reflush
            }, ()=> this.resetDataSource())
        }
    }
    private initDataSource(props: TablerProps) {

        // 传入未数组或则是 undefined 的情况
        if (utils.isArray(props.dataSource) || utils.isUndefined(props.dataSource)) {
            this.setState({
                dataSource: props.dataSource || [],
                originalDataSource: props.dataSource || [],
                localData: true,
                total: (props.dataSource || []).length
            });
        } else {
            this.resetDataSource();
        }
    }
    private filterLocalDataItem(value: any, search: SearcherWhereKey): boolean {
        // type: 'match' | 'include' | 'exclusive' | 'range' ;

        switch (search.type) {
            case 'match': // 等于
                if (utils.isArray(search.value)) {
                    return search.value.indexOf(value) > -1
                }
                return value == search.value;
            case 'include': // 包含
                if (utils.isArray(search.value)) {
                    return search.value.indexOf(value) > -1;
                } else {
                    if (utils.isString(search.value) && utils.isString(value)) {
                        return value.indexOf(search.value) > -1;
                    }
                    return false;
                }
            case 'exclusive': // 不包含
                if (utils.isArray(search.value)) {
                    return search.value.indexOf(value) == -1;
                } else {
                    if (utils.isString(search.value) && utils.isString(value)) {
                        return value.indexOf(search.value) == -1;
                    }
                    return false;
                }
            case 'range': // 区间
                if (utils.isArray(search.value)) {
                    let leftValue = search.value[0];
                    let rightValue = search.value[1];

                    if (!utils.isUndefined(leftValue)) {
                        if (leftValue > value) {
                            return false;
                        }
                    }
                    if (!utils.isUndefined(rightValue)) {
                        if (rightValue < value) {
                            return false;
                        }
                    }
                    return true;
                }
            default: {
                return false;
            }
        }
    }
    private filterLocalData(dataSource?: any[]) {
        let { searcher = {} } = this.state;

        if (Object.keys(searcher).length > 0) {
            if (dataSource) {
                return dataSource.filter((row: any) => {
                    for (let key in searcher) {
                        if (!this.filterLocalDataItem(row[key], searcher[key])) {
                            return false
                        }
                    }
                    return true;
                })
            }
        }
        return dataSource;
    }
    private resetDataSource(dataSource?: any) {
        let props = this.props;
        let state = this.state;

        if (dataSource) {
            // 直接返回为数组格式
            if (utils.isArray(dataSource)) {
                // localData需要过滤下数据
                let data: any = this.filterLocalData(dataSource)
                this.setState({
                    dataSource: data,
                    originalDataSource: dataSource,
                    total: data.length,
                    localData: true,
                    loading: false
                })
            } else {
                // 返回为 { data: any[], total: number } 结构数据
                if (utils.isArray(dataSource.data)) {
                    this.setState({
                        dataSource: dataSource.data,
                        originalDataSource: dataSource.data,
                        total: dataSource.total,
                        localData: false,
                        loading: false
                    })
                }
            }

        } else {

            if (utils.isFunction(props.dataSource)) {

                let value: any = (props.dataSource as Function)({
                    pageNumber: state.currentPage, 
                    pageSize: state.pageSize, 
                    searcher: state.searcher
                });

                this.setState({
                    loading: true
                });

                if (utils.isPromise(value)) {
                    value.then((val: any) => {
                        this.resetDataSource(val);
                    })
                } else {
                    this.resetDataSource(value);
                }
            } else {
                if (utils.isArray(state.originalDataSource)) {
                    this.resetDataSource(state.originalDataSource)
                }
            }
        }
    }
    private onFormerChange(value: any) {

        switch (this.state.formerAction) {
            // 新增
            case 'add':
                if (this.props.onAdd) {
                    return this.resetcheck(this.props.onAdd(value))
                }
                break;
            // 编辑
            case 'edit':
                if (this.props.onEdit) {
                    return this.resetcheck(this.props.onEdit(value));
                }
                break;
        }
    }
    private onRemove = (coloum: any) => {
        // 删除
        if (this.props.onRemove) {
            return this.resetcheck(this.props.onRemove(coloum))
        }
    }
    private resetcheck(mise: any) {

        if (utils.isPromise(mise)) {
            return mise.then((val: any) => {
                this.resetDataSource()
            })
        } else {
            return this.resetDataSource()
        }
    }

    private onSearchInput = (e) => {
        let searcherProps: any = this.props.searcher;

        this.onSearch({
            [`${searcherProps.searchKey}`]: {
                type: 'match',
                value: e
            }
        })
    }
    private onSearch = (params: any) => {

        let { searcher } = this.state;
        // 删除
        for (let prop in params) {
            let item: any = params[prop];
            if (item.value == '') {
                delete searcher[prop];
                delete params[prop];
            }
        }

        this.setState({
            searcher: Object.assign({
                ...searcher,
                ...params
            })
        }, () => {
            this.resetDataSource()
        })
    }

    private onSearchSelect = (event: any) => {
        let searcherProps: any = this.props.searcher;
        let quickValue: any = event && event.target ? event.target.value : event;

        this.setState({
            quickValue
        })

        if (searcherProps && searcherProps.quick) {
            this.onSearch({
                [`${searcherProps.quick.field}`]: {
                    type: 'match',
                    value: quickValue
                }
            })
        }


    }
    private onSelectChange = (selectedRowKeys: any) => {
        this.setState({
            selectedRowKeys,
            selected: selectedRowKeys.length
        })
    }

    private getDataSource(): any[] {
        return this.state.dataSource as any[]
    }
    private getColumnByField(field: TablerField, total: number, index: number) {
        let { searcher = {}, cacheFilter = {}, cacheSize, multilineEdit, multilineDataCache = {} } = this.state;
        let canResize: boolean = total > this.props.resizeMaxColumns
        let isLast: any = !canResize ? false : total === index + 1;
        let defaultWidth: number = this.tableDOM ? Math.max(6 * 150, this.tableDOM.offsetWidth) / Math.max(6, total) : 150;
        let { tablerColumn = {} } = field;
        
        let column = {
            title: field.name,
            key: field.key + index,
            dataIndex: field.key,
            ellipsis: true,
            width: isLast || !canResize ? undefined : cacheSize[field.key] || tablerColumn.width || defaultWidth,
            onHeaderCell: (column: any, rowIndex: number) => ({
                width: column.width,
                key: [index,rowIndex].join('-'),
                onResize: (e: any, data: any) => {
                    let { size } = data;

                    cacheSize[field.key] = size.width;

                    this.setState({
                        cacheSize
                    });
                },
            }),
            render: (text: any, record: object, rowIndex: number) => {
                let value = text;

                if (this.state.multilineEdit === rowIndex) {
                    if (!utils.isUndefined(multilineDataCache[field.key])) {
                        value = multilineDataCache[field.key];
                    }
                }

                return (
                    <TablerCell
                        value={value}
                        record={record}
                        key={[rowIndex, index].join('_')}
                        rowIndex={rowIndex}
                        editable={multilineEdit === rowIndex && tablerColumn.editable}
                        field={field}
                        onChange={(value: any) => {
                            let multilineDataCache = this.state.multilineDataCache || {};
                            multilineDataCache[field.key] = value;

                            this.setState({
                                multilineDataCache: multilineDataCache
                            })
                        }}
                    ></TablerCell>
                )
            }
        }

        if (tablerColumn.filter && !this.isMultilineEdit()) {
            Object.assign(column, {
                //filtered: Math.random() > 0.5,//!!cacheFilter[field.key],
                filteredValue: !!cacheFilter[field.key] ? ["d"] : undefined,
                filterDropdown: (data: any) => {
                    let { confirm } = data;

                    return (
                        <FilterDropdown
                            value={searcher[field.key]}
                            key={field.key}
                            onSearch={(value: SearcherWhereKey) => {

                                if (value && !utils.isUndefined(value.value)) {
                                    searcher[field.key] = value;
                                    cacheFilter[field.key] = true;
                                } else {
                                    delete searcher[field.key];
                                    cacheFilter[field.key] = false;
                                }

                                this.setState({
                                    searcher,
                                    cacheFilter
                                }, () => {
                                    confirm();
                                    this.resetDataSource();
                                });
                            }}
                            onClear={() => {
                                delete searcher[field.key];
                                cacheFilter[field.key] = false;

                                this.setState({
                                    searcher,
                                    cacheFilter
                                }, () => {
                                    confirm();
                                    this.resetDataSource();
                                });
                            }}
                            fieldKey={field.key}
                            field={field}
                            dataSource={this.props.dataSource}

                        ></FilterDropdown>
                    )
                }
            })
        }

        return column;
    }
    private isTablerColumn(it: any) {
        return it.column || it.tablerColumn
    }
    private getColumns(): any {
        let { fields = [] } = this.props;
        let group: any = {};

        let columns = fields.filter((it: any) => {
            if (this.isTablerColumn(it)) {
                let { tablerColumn = {} } = it;

                if (tablerColumn.group) {
                    if (!group[tablerColumn.group]) {
                        group[tablerColumn.group] = [];
                        group[tablerColumn.group].push(it)
                        return true;
                    } else {
                        group[tablerColumn.group].push(it)
                        return false;
                    }
                }
                return true;
            }
        });

        columns = columns.map((it: any, index: number) => {
            let { tablerColumn = {} } = it;

            if (tablerColumn.group) {
                return {
                    title: tablerColumn.group,
                    children: group[tablerColumn.group].map((it: any, idx: number) => this.getColumnByField(it, columns.length, index + idx + 1))
                }
            }
            return this.getColumnByField(it, columns.length, index)
        });

        columns.unshift({
            title: '#',
            width: 40,
            key: '10000',
            align: 'center',
            render: (text: any, column: any, rowIndex: number) => {
                return (rowIndex + 1);
            }
        })

        // 添加操作列
        columns.push({
            title: i18n.t('Operate'),
            fixed: 'right',
            key: '10002',
            width: 140,
            render: (text: any, column: any, rowIndex: number) => this.renderColumnAction(this.getColumnAction(column), column, rowIndex)
        })
        return this.columns = columns;
    }

    private isShowTitle(): boolean {
        return true
    }
    // 过滤项目
    private filterAuthItem(listItem: RowOperate, rowItem?: any) {
        return this.authFilter.filterAuth(listItem, rowItem);

    }
    private getColumnAction(rowData: any) {
        let { rowOperate = [] } = this.props;
        let actionList: RowOperate[] = DEFAULT_COLUMNS_ACTION.slice(0, DEFAULT_COLUMNS_ACTION.length);

        // 加入自定义数据
        if (rowOperate.length > 0) {
            rowOperate.forEach((it: RowOperate) => {
                if (it.batch !== 'only') {
                    actionList.push(it);
                }
            })
        }

        return actionList.sort((left: any, right: any) => {

            if (left.align > right.align) {
                return 1;
            }
            return -1;
        }).filter((it: RowOperate) => {
            return this.filterAuthItem(it, rowData)
        });
    }
    // 保存
    private onSaveMultilineEdit() {
        let { rowKey } = this.props;
        let { multilineDataCache = {}, localData, originalDataSource = [] } = this.state;
        if (localData) {
            if (!utils.isUndefined(multilineDataCache[rowKey])) {
                let currentRowIndex = originalDataSource.findIndex((it: any) => {
                    return it[rowKey] === multilineDataCache[rowKey]
                });
                Object.assign(originalDataSource[currentRowIndex], multilineDataCache);
                this.resetDataSource(originalDataSource);

                this.setState({
                    multilineDataCache: {},
                    multilineEdit: undefined
                })
            }
        }
    }

    private onActionClick(item: any, column: any, rowIndex: number) {

        let { multilineEdit } = this.props;

        switch (item.key) {
            case 'view':
            case 'edit':
                // 行编辑模式
                if (multilineEdit) {
                    this.setState({
                        multilineDataCache: Object.assign({}, column),
                        multilineEdit: rowIndex
                    })
                } else {
                    this.setState({
                        formerAction: item.key,
                        currentRowData: Object.assign({}, column)
                    })
                }
                break;
            case 'remove':
                this.onRemove(column)
                break;
            default:
                this.props.onRowAction && this.props.onRowAction(item, column)
        }

    }
    private onAddClick = () => {
        this.setState({
            formerAction: 'add',
            currentRowData: {}
        })
    }
    private renderColumnAction(actionList: any[], column: any, rowIndex: number) {

        // 单行编辑模式
        if (this.state.multilineEdit === rowIndex) {
            return (
                <Space size="small">
                    <Button type='link' key="save" onClick={() => {
                        this.onSaveMultilineEdit();
                    }}>保持</Button>
                    <Button type='link' key='cancel' onClick={() => {
                        this.setState({
                            multilineEdit: undefined,
                            multilineDataCache: {}
                        })
                    }}>取消</Button>
                </Space>
            )

        } else {

            let disabled = this.isMultilineEdit();//multilineEdit && !utils.isUndefined(this.state.multilineEdit);
            let actionMore = actionList.length > 3 ? actionList.splice(2, actionList.length) : [];
            let actionNode = actionList.map((it: RowOperate, index: number) => {

                if (it.danger && !disabled) {
                    // 
                    return (
                        <Popconfirm
                            title={i18n.t('Confirm the [{name}]operation', {name: it.name})}
                            okText={i18n.t('Confirm')}
                            key={index}
                            placement="topRight"
                            cancelText={i18n.t('Cancel')}
                            onConfirm={() => this.onActionClick(it, column, rowIndex)}
                        >
                            <Button
                                type="link"
                                size="small"
                                danger={it.danger}
                                key={index}
                            >
                                {it.name}
                            </Button>
                        </Popconfirm>
                    )

                } else {
                    return (
                        <Button
                            type="link"
                            size='small'
                            danger={it.danger}
                            key={index}
                            disabled={disabled}
                            onClick={() => this.onActionClick(it, column, rowIndex)}
                        >{it.name}</Button>
                    )
                }
            })

            if (actionMore.length > 0) {
                let more = (
                    <Dropdown
                        disabled={disabled}
                        placement="bottomRight"
                        overlayClassName="tabler-coloumns-actions"
                        key="dropdown"
                        menu={this.renderBatchMenu(actionMore, column, rowIndex)}>
                        <Button size='small' disabled={true} type="link" >···<DownOutlined /></Button>
                    </Dropdown>
                )
                actionNode.push(more);
            }

            return <Space size="small">{actionNode}</Space>
        }
    }
    private renderSearchQuick() {
        let { size } = this.props;
        let { quick } = this.props.searcher;
        let itemList: any = [...quick.data, { value: '', label: 'All' }]

        switch (quick.type) {
            case 'select':
                return (
                    <Select disabled={this.isMultilineEdit()} size={size} value={this.state.quickValue} mode={quick.mode} onChange={this.onSearchSelect}>
                        {itemList.map((it: any) => {
                            return (
                                <Select.Option key={it.value} value={it.value}>{it.label}</Select.Option>
                            )
                        })}
                    </Select>
                )
            default:
                return (
                    <Radio.Group disabled={this.isMultilineEdit()} size={size} value={this.state.quickValue} onChange={this.onSearchSelect}>
                        {itemList.map((it: any) => {
                            return (
                                <Radio.Button value={it.value} key={it.value}>{it.label}</Radio.Button>
                            )
                        })}
                    </Radio.Group>
                )
        }
    }
    private renderBatchMenu(actionList: any[], column?: any, rowIndex?: any) {
        return {
            items: actionList.map((it: any, index) => {
                    console.log(it, index, 8888)
                    switch (it.type) {
                        case 'divider':
                            return {
                                type: 'divider',
                                key: 'it_divider' + index
                            }
                        case 'group':
                            return {
                                label:  it.name,
                                key: 'it_group' + index,
                                children: this.renderBatchMenu(it.children, column, rowIndex).items
                            }
                        default:
                            let name = template(it.name || '', this.state)
                            return {
                                danger: it.danger,
                                key: [it.key, it.danger, it.name].join('_'),
                                label: name,
                                title: name
                            }
                    }
                }),
                onClick:(e) => {
                    let { key } = e;
                    let splitKey: string[] = key.split('_');
                    // 需要确认的情况
                    if (splitKey[1] == 'true') {
                        Modal.confirm({
                            title: "请确认操作",
                            content: `是否执行[${splitKey[2]}]操作`,
                            okText: '确认',
                            cancelText: '取消',
                            onOk: () => {
                                this.onActionClick({ key: splitKey[0] }, column, rowIndex)
                            }
                        })
                    } else {
                        this.onActionClick({ key: splitKey[0] }, column, rowIndex)
                    }
                }
        }
    }
    private getBatchAction() {
        let { rowOperate = [] } = this.props;
        let batchList: any = DEFAULT_BATCH_ACTION.slice(0, DEFAULT_BATCH_ACTION.length);
        let rowBatch: any = [];

        if (rowOperate.length > 0) {
            rowOperate.forEach((it: RowOperate) => {
                if (it.batch) {
                    rowBatch.push(it)
                }
            })
        }

        if (rowBatch.length > 0 && batchList.length > 0) {
            batchList = [
                ...batchList,
                {
                    type: 'divider'
                },
                ...rowBatch
            ];
        }

        let batchButton: any = batchList.filter((it: RowOperate) => {
            return this.filterAuthItem(it);
        });

        if (batchButton.length == 1) {
            return []
        }
        return batchButton;
    }
    private getBatchAddAction() {
        let { increase, auth = {} } = this.props;
        let batchAddList: any = [];

        if (auth.add !== false && increase) {
            increase.forEach((it: any, index: number) => {
                batchAddList.push({
                    type: 'add',

                    name: it.name,
                    defaultValue: it.defaultValue
                })
            })
        }

        return batchAddList;
    }

    private renderTitle(): any {
        if (this.isShowTitle()) {
            let { searcher, size } = this.props;
            let battchList = this.getBatchAction();
            let battchAddList = this.getBatchAddAction();

            return (
                <div className="tabler-title">
                    <div className="tabler-operate">
                        {/* 批量操作 */}
                        <Space size={size}>
                            <div className="tabler-batch-info">
                                <span>{this.state.total}</span> rows of data in total{this.state.selected ? <span>, selected <span>{this.state.selected}</span> rows</span> : null} <Divider type="vertical" />
                            </div>
                            {battchList && battchList.length ?
                                <div className="tabler-batch-action">
                                    {battchList.length && <Dropdown disabled={this.isMultilineEdit()} placement="bottomRight" overlay={this.renderBatchMenu(battchList)}><span>批量操作<CaretDownOutlined /></span></Dropdown>}
                                </div>
                                : null}
                            {/* 新增操作 */}
                            <div className="tabler-batch-add">
                                {battchAddList.length
                                    ? <Dropdown disabled={this.isMultilineEdit()} placement="bottomRight" overlay={this.renderBatchMenu(battchAddList)}><Button size={size} type="primary">{this.props.createText}<DownOutlined /></Button></Dropdown>
                                    : <Button disabled={this.isMultilineEdit()} size={size} onClick={this.onAddClick} type="primary" icon={<PlusCircleOutlined />}>{this.props.createText}</Button>}
                            </div>
                        </Space>
                    </div>
                    {searcher ? <div className="tabler-searcher">
                        <Space size={size}>
                            {/* 检索区域 */}
                            <Input.Search
                                size={size}
                                placeholder={searcher.placeholder}
                                onSearch={this.onSearchInput}
                                disabled={this.isMultilineEdit()}
                            ></Input.Search>

                            {/* 快捷 检索区 */}
                            {searcher.quick && searcher.quick.data ? this.renderSearchQuick() : null}
                        </Space>
                    </div> : null}
                </div>
            )
        }
        return null;
    }
    private getTableWidth() {
        let width = 40;

        if (this.columns) {
            this.columns.forEach((it: any) => {
                if (it.width) {
                    width += it.width;
                }
            })
        }
        return width + 160;
    }
    private isMultilineEdit() {
        let { multilineEdit } = this.props;
        return multilineEdit && !utils.isUndefined(this.state.multilineEdit);
    }
    public render() {
        let props: any = this.props;

        return (
            <div className={classnames('tabler-wrapper', {
                'tabler-wrapper-multilineEdit': this.isMultilineEdit()
            })}>
                <TablerFormer
                    formerType={props.formerType}
                    formerSchema={props.formerSchema}
                    action={this.state.formerAction}
                    createText={this.props.createText}
                    fields={props.fields}
                    value={this.state.currentRowData}
                    viewer={this.state.formerAction == 'view'}
                    onView={this.props.onView}
                    onClose={() => {
                        this.setState({
                            formerAction: null
                        })
                    }}
                    onChangeValue={(value: any) => {
                        return this.onFormerChange(value);
                    }}
                />
                <Spin spinning={this.state.loading}>
                    <Table
                        rowKey={this.props.rowKey || 'id'}
                        title={() => this.renderTitle()}
                        size={this.props.size}
                        columns={this.getColumns()}
                        tableLayout={'fixed'}
                        dataSource={this.getDataSource()}
                        

                        scroll={this.columns.length <= this.props.resizeMaxColumns + 1 ? undefined : { x: this.getTableWidth() }}
                        rowSelection={this.props.rowSelection !== false && {
                            selectedRowKeys: this.state.selectedRowKeys,
                            onChange: this.onSelectChange,
                            columnWidth: 40,
                            fixed: true
                        } as any}
                        components={{
                            header: {
                                cell: ResizableTitle
                            }
                        }}
                        pagination={{
                            pageSize: this.state.pageSize,
                            total: this.state.total,
                            onChange: (pageNumber, pageSize)=> {
                                this.setState({
                                    pageSize: pageSize,
                                    currentPage: pageNumber
                                }, () => {
                                    this.resetDataSource()
                                })
                            },
                        }}
                    ></Table>
                </Spin>
            </div>
        )
    }


}