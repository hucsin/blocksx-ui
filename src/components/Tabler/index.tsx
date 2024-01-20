import React from 'react';
import ReactDOM from 'react-dom';

import { Space, Button, Input, Modal, Dropdown, Divider, Popconfirm } from 'antd';
import { utils } from '@blocksx/core';
import SearchBar from '../SearchBar';
import TablerFormer from './TablerFormer';

import { DownOutlined, CaretDownOutlined, PlusCircleOutlined } from '../Icons/index';
import i18n from '@blocksx/i18n';
import { template } from '../utils/string';

import { TablerProps, RowOperate, SearcherWhereKey, TablerField } from './typings';
import { DEFAULT_COLUMNS_ACTION, DEFAULT_BATCH_ACTION } from './config';
import TablerTable from './TablerTable';
import TablerList from './TablerList';
import AuthFilter from './AuthFilter';



interface TablerState {
    loading: boolean;
    searcher: any;
    pageSize?: number;
    pageNumber?: number;
    total: number;

    localData: boolean;
    reflush: number;
    childrenReflush :number;

    dataSource?: any;
    originalDataSource?: any; // 原始的数据

    multilineEdit?: boolean;

    selected?: number;

    formerAction?:any;
    formerName?: string;
    currentRowData?: any;
    currentRowOperate?: any;
}

/**
 * 1、将数据源的部分逻辑迁移到这里
 * 2、将公共部分逻辑迁移到这里
 */
export default class Tabler extends React.Component<TablerProps, TablerState>{
    static defaultProps = {
        type: 'table',
        searchSize: 'small',
        createText: i18n.t('Create new records'),
        rowKey: 'id',
        formerType: 'drawer',

        pageNumber: 1,
        size: 'middle',
        resizeMaxColumns: 7,
    }
    /**
     * 用来配置操作区域的尺寸
     */
    private operateSize = {
        list: 2,
        table: 3
    }
    
    private authFilter: AuthFilter
    public constructor(props: TablerProps) {
        super(props);

        this.state = {
            pageSize: props.pageSize || 10,
            total: 0,
            pageNumber: 1,
            dataSource: [],
            originalDataSource: [],
            searcher: {},
            loading: false,
            localData: false,
            reflush: props.reflush,
            childrenReflush: props.reflush
        }
        this.authFilter = new AuthFilter(this);
    }

    public componentDidMount() {
        this.initDataSource(this.props)
    }

    public UNSAFE_componentWillUpdate(newProps: any) {
        
        if (newProps.reflush != this.state.reflush) {
            console.log('reflush')
            this.setState({
                reflush: newProps.reflush
            }, () => {
                this.resetDataSource();
                
            })
        }
    }
    public reflush() {
        this.setState({
            reflush: +new Date
        })
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
    private isAppendDatasource(isAppend?:boolean) {
        
        if (this.props.type =='list') {

            return !!isAppend;
        }

        return false;
    }
    private resetDataSource(dataSource?: any, isAppend?: any) {
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
                    loading: false,
                    childrenReflush: +new Date
                })
            } else {
                // 返回为 { data: any[], total: number } 结构数据
                
                if (utils.isArray(dataSource.data)) {
                    let dataList: any = this.isAppendDatasource(isAppend) ? [...this.state.originalDataSource, ...dataSource.data] : dataSource.data;
                    this.setState({
                        dataSource: dataList,
                        originalDataSource: dataList,
                        total: dataSource.total,
                        localData: false,
                        loading: false,
                        childrenReflush: +new Date
                    })
                }
            }

        } else {

            if (utils.isFunction(props.dataSource)) {
                if (!this.state.loading) {
                    
                    let value: any = (props.dataSource as Function)({
                        pageNumber: state.pageNumber,
                        pageSize: state.pageSize,
                        ...state.searcher,
                        ...(this.props.onGetRequestParams && this.props.onGetRequestParams()) 
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
                }
            } else {
                if (utils.isArray(state.originalDataSource)) {
                    this.resetDataSource(state.originalDataSource)
                }
            }
        }
    }

    private isMultilineEdit() {
        let { multilineEdit } = this.props;
        return multilineEdit && !utils.isUndefined(this.state.multilineEdit);
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

    private renderSearcher = (isGetView?: boolean) => {
        if (!isGetView && this.props.searchRef && this.props.searchRef.current) {
            return (
                ReactDOM.createPortal(this.renderSearcher(true), this.props.searchRef.current)
            )
        }
        return (
            <SearchBar onChange={(val) => { console.log(val) }} {...this.props.searcher} size={this.props.searchSize}></SearchBar>
        )
    }

    // 过滤项目
    private filterAuthItem(listItem: RowOperate, rowItem?: any) {
        return this.authFilter.filterAuth(listItem, rowItem);

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

    private getRowAction(rowData: any) {
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
    private onActionClick(operate: RowOperate, rowData: any, rowIndex: number) {
        
         switch (operate.type) {
             case 'view':
             case 'edit':
                 // 行编辑模式
                 /*if (multilineEdit) {
                     this.setState({
                         multilineDataCache: Object.assign({}, rowData),
                         multilineEdit: rowIndex
                     })
                 } else {*/
                 
                     this.setState({
                         formerAction: operate.type,
                         formerName: operate.name,
                         currentRowOperate: operate,
                         currentRowData: Object.assign({}, rowData)
                     })
                 //}
                 break;
             case 'remove':
                 this.onRemove(rowData)
                 break;
             default:
                 this.props.onRowAction && this.props.onRowAction(operate, rowData, this)
         }
    }

    private onFormerChange(value: any) {
        let { currentRowOperate } = this.state;

        // 如果是行自定义行为操作
        if (currentRowOperate && utils.isFunction(currentRowOperate.motion)) {

            return this.resetcheck(currentRowOperate.motion(value, this));

        } else {

            switch (this.state.formerAction) {
                // 新增
                case 'create':
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
    private onAddClick =()=> {
        this.setState({
            formerAction: 'create',
            formerName: 'Create',
            currentRowData: null
        })
    }
    
    private renderRowOperate = (rowData: any, rowIndex: number) => {

        let actionList: any = this.getRowAction(rowData) || [];
        let operateSize: number = this.operateSize[this.props.type] || this.operateSize.table;

        let disabled = this.isMultilineEdit();//multilineEdit && !utils.isUndefined(this.state.multilineEdit);
        let actionMore = actionList.length >= operateSize ? actionList.splice(operateSize - 1, actionList.length) : [];
        
        let actionNode = actionList.map((it: RowOperate, index: number) => {

            if (it.confirm && !disabled) {
                // 
                return (
                    <Popconfirm
                        title={it.confirm}
                        okText={i18n.t('Confirm')}
                        key={index}
                        placement="topRight"
                        cancelText={i18n.t('Cancel')}
                        onConfirm={() => this.onActionClick(it, rowData, rowIndex)}
                    >
                        <Button
                            type="link"
                            size={this.props.size}
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
                        size={this.props.size}
                        danger={it.danger}
                        key={index}
                        disabled={disabled}
                        onClick={() => this.onActionClick(it, rowData, rowIndex)}
                    >{it.name}</Button>
                )
            }
        })

        if (actionMore.length > 0) {
            if (this.props.type == 'list') {
                return (
                    <Dropdown.Button
                        disabled={disabled}
                        size={this.props.size}
                        key="dropdown"
                        menu={this.renderBatchMenu(actionMore, rowData, rowIndex)}
                        onClick={() => {
                            this.onActionClick(actionList[0], rowData, rowIndex);
                        }}
                    >
                        {actionList[0].name}
                    </Dropdown.Button>
                )
            }

            let more = (
                <Dropdown
                    disabled={disabled}
                    placement="bottomRight"
                    overlayClassName="tabler-coloumns-actions"
                    key="dropdown"
                    menu={this.renderBatchMenu(actionMore, rowData, rowIndex)}>
                    <Button size='small' disabled={true} type="link" >···<DownOutlined /></Button>
                </Dropdown>
            )
            actionNode.push(more);
        }

        return <Space size="small">{actionNode}</Space>

    }
    private renderBatchMenu(actionList: any[], column?: any, rowIndex?: any) {

        let actionKeyMap: any = {};

        return {
            items: actionList.map((it: any, index) => {
                switch (it.type) {
                    case 'divider':
                        return {
                            type: 'divider',
                            key: 'it_divider' + index
                        }
                    case 'group':
                        return {
                            label: it.name,
                            key: 'it_group' + index,
                            children: this.renderBatchMenu(it.children, column, rowIndex).items
                        }
                    default:
                        let name = template(it.name || '', this.state);
                        let key = [it.key, it.danger, it.name].join('_');

                        actionKeyMap[key] = it;

                        return {
                            danger: it.danger,
                            key: key,
                            label: name,
                            title: name
                        }
                }
            }),
            onClick: (e) => {
                let rowOperate: any = actionKeyMap[e.key];
                // 需要确认的情况
                if (rowOperate.confirm) {
                    Modal.confirm({
                        title: i18n.t('Confirm operation'),
                        content: rowOperate.confirm,
                        okText: i18n.t('Confirm'),
                        cancelText: i18n.t('Cancel'),
                        onOk: () => {
                            this.onActionClick(rowOperate, column, rowIndex)
                        }
                    })
                } else {
                    this.onActionClick(rowOperate, column, rowIndex)
                }
            }
        }
    }
    private renderOperater = (isGetView?: boolean) => {

        if (!isGetView && this.props.toolbarRef && this.props.toolbarRef.current) {

            return (
                ReactDOM.createPortal(this.renderOperater(true), this.props.toolbarRef.current)
            )

        } else {

            let battchList = this.getBatchAction();
            let battchAddList = this.getBatchAddAction();

            return (
                <Space size={this.props.searchSize}>
                    <div className="tabler-batch-info" style={{display: 'none'}}>
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
                            ? <Dropdown disabled={this.isMultilineEdit()} placement="bottomRight" overlay={this.renderBatchMenu(battchAddList)}><Button size={this.props.size} type="primary">{this.props.createText}<DownOutlined /></Button></Dropdown>
                            : <Button disabled={this.isMultilineEdit()} size={this.props.size} onClick={this.onAddClick} type="primary" icon={<PlusCircleOutlined />}>{this.props.createText}</Button>}
                    </div>
                </Space>
            )
        }
    }
    public render() {

        let View: any = this.props.type == 'table' ? TablerTable : TablerList;
        let props: any = this.props;
        
        return (
            <>
                <TablerFormer
                     formerType={props.formerType}
                     name={this.state.formerName}
                     formerSchema={props.formerSchema}
                     action={this.state.formerAction}
                     createText={this.props.createText}
                     fields={props.fields}
                     value={this.state.currentRowData}
                     viewer={this.state.formerAction == 'view'}
                     onView={this.props.onView}
                     onClose={() => {
                         this.setState({
                             formerAction: null,
                             currentRowData: null
                         })
                     }}
                     onChangeValue={(value: any) => {
                        return this.onFormerChange(value);
                     }}
                 />
                <View
                    {...this.props}

                    pageSize={this.state.pageSize}
                    pageNumber={this.state.pageNumber}
                    total={this.state.total}
                    reflush={this.state.childrenReflush}
                    loading={this.state.loading}
                    getDataSource={() => this.state.dataSource}
                    onChangePage={(val: any ,isAppend?: boolean) => { this.setState(val, () => this.resetDataSource(isAppend)) }}

                    renderSearcher={this.renderSearcher}
                    renderOperater={this.renderOperater}
                    renderRowOperater={this.renderRowOperate}
                >
                
                </View>
            </>
        )
    }

}