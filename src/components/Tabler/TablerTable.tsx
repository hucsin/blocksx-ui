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
 
 import { Spin, Table, Space, Button } from 'antd';
 
 import { utils } from '@blocksx/core';
 import i18n from '@blocksx/i18n';
 
 import { TablerProps, SearcherWhereKey, TablerField } from './typings';
 
 
 import './styles/index.scss';
 
 import ResizableTitle from './TablerResizableTitle';
 import FilterDropdown from './TablerFilterDropdown';
 import TablerCell from './TablerCell';
 
 
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
     pageNumber?: number;
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
 
 export default class TablerTable extends React.Component<TablerProps, TablerState> {
 
     static defaultProps = {
         pageSize: 10,
         type: 'table',
         
         formerAction: '',
         quickValue: '',
         rowSelection: false
     }
     private tableDOM?: any;
     private columns: any[];
 
     public constructor(props: TablerProps) {
         super(props);
         this.state = {
             pageNumber: 1,
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
 
         
     }
     public componentDidMount() {
         //this.initDataSource(this.props);
         this.tableDOM = ReactDOM.findDOMNode(this);
     }
     
     public UNSAFE_componentWillUpdate(newProps: any) {
         if (newProps.reflush !== this.state.reflush) {
             this.setState({
                 dataSource: this.getDataSource(),
                 reflush: newProps.reflush
             }/*, ()=> this.resetDataSource()*/)
         }

         if (newProps.total !== this.state.total) {
            this.setState({
                total: newProps.total
            })
         }

         if (newProps.loading !== this.state.loading) {
            this.setState({
                loading: newProps.loading
            })
         }

         if (newProps.pageSize != this.state.pageSize) {
            this.setState({
                pageSize: newProps.pageSize
            })
         }

         if (newProps.pageNumber != this.state.pageNumber) {
            this.setState({
                pageNumber: newProps.pageNumber
            })
         }
     }
     private resetDataSource(datasource?: any) {
        this.props.onResetDataSource && this.props.onResetDataSource(datasource);
     }

     private onSelectChange = (selectedRowKeys: any) => {
         this.setState({
             selectedRowKeys,
             selected: selectedRowKeys.length
         })
     }
 
     private getDataSource(): any {
        if (this.props.getDataSource) {
            return this.props.getDataSource() as any[];
        }
     }
    
    
     private isTablerColumn(it: any) {
         return it.column || it.tablerColumn
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
     
    private renderColumnAction(column: any, rowIndex: number) {
 
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
            return this.props.renderRowOperater && this.props.renderRowOperater(column, rowIndex)
        }
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
             render: (text: any, column: any, rowIndex: number) => this.renderColumnAction(column, rowIndex)
         })
         return this.columns = columns;
     }
 
     private isShowTitle(): boolean {
         return true
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
 
         
 
     }
 
     private renderTitle(): any {
         if (this.isShowTitle()) {
             return (
                 <div className="tabler-title">
                     <div className="tabler-operate">
                         {this.props.renderOperater && this.props.renderOperater()}
                     </div>
                     <div className="tabler-searcher">
                         {this.props.renderSearcher && this.props.renderSearcher()}
                     </div>
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
         return (
             <div className={classnames('tabler-wrapper', {
                 'tabler-wrapper-multilineEdit': this.isMultilineEdit()
             })}>
                 
                 <Spin spinning={this.state.loading}>
                    {this.renderTable()}
                 </Spin>
             </div>
         )
     }
     private renderTable() {
         return (
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
                         
                        this.props.onChangePage && this.props.onChangePage({pageSize, pageNumber})
                     },
                 }}
             ></Table>
         )
     }
 }