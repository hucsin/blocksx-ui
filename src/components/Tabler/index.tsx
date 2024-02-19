import React from 'react';
import ReactDOM from 'react-dom';

import { Space, Button, Modal, Dropdown, Divider, Popconfirm } from 'antd';
import { utils } from '@blocksx/core';
import SearchBar from '../SearchBar';
import TablerFormer from './TablerFormer';
import SmartDrawer from '../SmartDrawer';

import { DownOutlined, CaretDownOutlined } from '../Icons/index';
import i18n from '@blocksx/i18n';
import { template } from '../utils/string';

import { TablerProps, RowOperate, SearcherWhereKey } from './typings';
import { DEFAULT_COLUMNS_ACTION, DEFAULT_BATCH_ACTION } from './config';
import TablerTable from './TablerTable';
import TablerList from './TablerList';
import AuthFilter from './AuthFilter';
import TablerUtils from '../utils/tool';





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

    selectedRowKeys?: any[];
    rowSelection?: boolean;

    smartPageOpen?: boolean;
    smartPageData?: any;
    mode: any;
    value?: any;
}


interface TablerValueProps extends TablerProps {
    selectedRowKeys?: any [];
    batchOpertate?: any[]
    mode?: string;
    onChangeValue?: Function;
}

/**
 * 1、将数据源的部分逻辑迁移到这里
 * 2、将公共部分逻辑迁移到这里
 */
export default class Tabler extends React.Component<TablerValueProps, TablerState>{
    static defaultProps = {
        type: 'table',
        searchSize: 'small',
        createText: i18n.t('Create new records'),
        rowKey: 'id',
        formerType: 'drawer',
        rowSelection: false,
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
    public constructor(props: TablerValueProps) {
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
            rowSelection: props.mode ==  'pickmore' ?  true: props.rowSelection,
            reflush: props.reflush,
            childrenReflush: props.reflush,
            value: props.selectedRowKeys,

            smartPageOpen: false,
            smartPageData: {} ,
            mode: props.mode
        }
        this.authFilter = new AuthFilter(this);
    }

    public componentDidMount() {
        this.initDataSource(this.props)
    }

    public UNSAFE_componentWillUpdate(newProps: any) {
        
        if (newProps.reflush != this.state.reflush) {
            this.setState({
                reflush: newProps.reflush
            }, () => {
                this.resetDataSource();
                
            })
        }
        
        if (newProps.selectedRowKeys != this.state.selectedRowKeys) {
            this.setState({
                selectedRowKeys: newProps.selectedRowKeys,
                value: newProps.selectedRowKeys
            })
        }

        if (newProps.mode != this.state.mode) {
            this.setState({
                mode: newProps.mode
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

    private renderSearcher = (isGetView?: boolean) => {

        if (this.props.noSearcher) {
            return null;
        }

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
        let batchAddList: any = [];
        let batchOpertate: any = this.props.batchOpertate;
        let batchOpertateMap: any = {};

        // 判断是否是
        if (batchOpertate && batchOpertate.length) {
            batchOpertate.forEach((it, index) => {
                batchOpertateMap[it.type] = it;

                if (!it.disabled) {
                    batchAddList.push({
                        ...it,
                        id: index
                    })
                }
            })
        }


        if ((!batchOpertateMap['record.create'] || (batchOpertateMap['record.create'].disabled !== true))) {
            
            batchAddList.unshift({
                type: 'record.create',
                icon: 'PlusCircleOutlined',
                name: batchOpertateMap['record.create'] 
                    ? batchOpertateMap['record.create'].name || this.props.createText 
                    : this.props.createText
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
    private onActionClick(operate: RowOperate, rowData: any, rowIndex?: number) {
        
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
                if (operate.motion && utils.isFunction(operate.motion)) {
                    return operate.motion(rowData, this)
                }
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
    private onBatchAddClick =(action: any)=> {

        if (utils.isPlainObject(action)) {
            // 添加
            if (action.type == 'record.create') {
                this.setState({
                    formerAction: 'create',
                    formerName: 'Create',
                    currentRowData: null
                })
            }
        } else {
            let batchOpertate: any = this.props.batchOpertate;

            if (batchOpertate[action]) {

                this.setState({
                    smartPageOpen:true,
                    smartPageData: batchOpertate[action]
                })
            }

        }
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
    private renderBatchAddList(battchAddList: any) {
        let first:any = battchAddList.shift();

        if (battchAddList.length == 0) {

            return (
                <Button  type="primary" onClick={() => this.onBatchAddClick(first)} icon={TablerUtils.renderIconComponent(first)}>
                    {first.name}
                </Button>
            )
        }  else {
            
            return <Dropdown.Button
                icon={TablerUtils.renderIconComponent({ icon: 'DownOutlined'})}
                type='primary'
                menu={{items: battchAddList.map(it => { 
                    return {
                        key: it.id,
                        icon: TablerUtils.renderIconComponent(it),
                        label: it.name,
                        onClick: e => this.onBatchAddClick(e.key)
                    }
                })}}
                onClick={()=> this.onBatchAddClick(first)}
            >
                {TablerUtils.renderIconComponent(first)}{first.name}
            </Dropdown.Button>
        }
    }
    private renderOperater = (isGetView?: boolean) => {

        if (this.props.noOperater) {
            return null;
        }

        if (!isGetView && this.props.toolbarRef && this.props.toolbarRef.current) {

            return (
                ReactDOM.createPortal(this.renderOperater(true), this.props.toolbarRef.current)
            )

        } else {

            let battchList = this.getBatchAction();
            let battchAddList = this.getBatchAddAction();

            return (
                <Space size={this.props.searchSize}>
                    
                    {battchList && battchList.length ?
                        <div className="tabler-batch-action">
                            {battchList.length && <Dropdown disabled={this.isMultilineEdit()} placement="bottomRight" overlay={this.renderBatchMenu(battchList)}><span>批量操作<CaretDownOutlined /></span></Dropdown>}
                        </div>
                        : null}
                    {/* 新增操作 */}
                    <div className="tabler-batch-add">
                        {this.renderBatchAddList(battchAddList)}
                    </div>
                </Space>
            )
        }
    }
    private getRowOperateLength() {
        let actionList: any = this.getRowAction({}) || [];

        return actionList.length;
    }
    private onSelectedRow =(selectedRowKeys: any[], selectedRow: any[])=> {
        
        this.setState({
            value: selectedRowKeys
        })
        if (this.props.onChangeValue) {
            this.props.onChangeValue(selectedRowKeys, selectedRow);
        }
    }
    private onDoView =(rowData: any)=> {
        this.onActionClick({type: 'view', name: 'View', key: 'view'}, rowData)
    }
    public render() {

        let View: any = this.props.type == 'table' ? TablerTable : TablerList;
        let props: any = this.props;
        
        return (
            <React.Fragment>
                <SmartDrawer 
                    key={'2smart'}
                    open={this.state.smartPageOpen}
                    {...this.state.smartPageData}
                    onClose={()=> this.setState({smartPageOpen: false})}
                />
                <TablerFormer
                     key={'2fomer'}
                     formerType={props.formerType}
                     name={this.state.formerName}
                     column={this.props.formerColumn}
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
                    key={'2view'}
                    {...this.props}

                    pageSize={this.state.pageSize}
                    pageNumber={this.state.pageNumber}
                    total={this.state.total}
                    reflush={this.state.childrenReflush}
                    loading={this.state.loading}
                    mode={this.state.mode}
                    getDataSource={() => this.state.dataSource}
                    onChangePage={(val: any ,isAppend?: boolean) => { this.setState(val, () => this.resetDataSource(isAppend)) }}

                    selectedRowKeys={this.state.value}
                    rowSelection={this.state.rowSelection}
                    renderSearcher={this.renderSearcher}
                    renderOperater={this.renderOperater}
                    renderRowOperater={this.renderRowOperate}
                    rowOperateLength={this.getRowOperateLength()}
                    onSelectedRow={this.onSelectedRow}

                    onClickFistCell={this.onDoView}
                >
                
                </View>
            </React.Fragment>
        )
    }

}