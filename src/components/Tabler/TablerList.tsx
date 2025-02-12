import React from 'react';

import InfiniteScroll from 'react-infinite-scroll-component';
import { List, Skeleton, Empty, Divider, Button, Tooltip, Space } from 'antd';

import { utils } from '@blocksx/core';
import { consume } from '../utils/dom';
import * as FormerTypes from '../Former/types';
import Box from '../Box';

import { TablerProps } from './typings';
import * as Icons from '../Icons';
import TableUtils from '../utils/tool';
import FormerTool from '../utils/FormerTool';
import BaseUtil from '../utils'
import i18n from '@blocksx/i18n';
import classnames from 'classnames';


export interface TablerState {
     
    quickValue?: any;
    columns?: any;
    // 检索条件
    searcher: any;
    total: number; // 总条数
    pageSize: number;
    pageNumber: number;

    selected?: number;// 选中条数
    selectedRowKeys?: any[];
    
    dataSource?: any;
    originalDataSource?: any; // 原始的数据
    
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
    optional?: boolean;

    selectedKey?: any;
    scrollTop?: boolean;
    mode?: string;
}


interface TablerListProps extends TablerProps {
    mode?: string;
    autoColor?: boolean;
    avatar?: string;
    notice?: any;
    pageMeta?: any;
    grid?: any;
    layout?: 'horizontal' | 'card' | 'avatar' | 'connections' | 'info';
    maxIcon?: number;
    minIcon?: number;
    avatarShape?: any;
    avatarReverseColor?: boolean;
    noCreateAt?: any;
    groupKey?: string;
    icon?: string;
    classify?: 'mini' | 'default';
    onGetRequestParams?: Function;
    avatarSize?: number;
    avatarMerge?: boolean;
    onAddNew?: Function;
    onRowClick?: Function;
    onRowSelect?: Function;

    optional?: boolean;

    renderRow?: Function;
    renderRowClassName?: Function;
    renderRowExtra?: Function;
    renderRowItemExtra?: Function;
    renderRowAvatar?: Function;
    renderRowTitle?: Function;
    renderRowDescription?: Function;
    renderRowContent?: Function;

    onFetchList?: Function

    selectedRowKeys?: any;
    selectedKey:any; 
}

export default class TablerList extends React.Component<TablerListProps, TablerState> {

    static defaultProps = {
        pageSize: 10,
        pageNumber: 1,
        noCreateAt: false,
        type: 'table',
        layout: 'avatar',
        mode: 'default', //default, pick/small/sample
        formerAction: '',
        classify: 'default',
        quickValue: '',
        avatarMerge: false,
        rowSelection: false,
        autoColor: true,
        grid: {
            column: 3,
            gutter: 12,

            xs: 1,
            sm: 1,
            md: 1,

            lg: 2,
            xl: 3,
            xxl: 3
        }
    }

    private id: any;

    public constructor(props: TablerListProps) {
        super(props);
        this.state = {
            pageNumber: 1,
            total: 0,
            selected: 0,
            selectedRowKeys: props.selectedRowKeys,
            selectedKey: Array.isArray(props.selectedRowKeys) ? props.selectedRowKeys[0] :  props.selectedRowKeys ,
            pageSize: props.pageSize || 10,
            searcher: {},
            localData: true,
            cacheSize: {},
            cacheFilter: {},
            loading: false,
            scrollTop: true,
            reflush: props.reflush,
            mode: props.mode,
            optional: props.optional
        };
        
        this.id = utils.uniq('id');
    }
    
    public componentDidMount () {
        //this.initDataSource(this.props);
        if (this.props.onFetchList) {

            this.fetchDataSource({
                pageNumber: this.state.pageNumber || 1,
                pageSize: this.state.pageSize || 10
            });
        } else {
            this.setState({
                dataSource: this.getDataSource()
            })
        }
    }
    private getDefaultLayout() {
        return this.props.avatar
    }
    private resetDataSource(datasource?: any) {
        this.props.onResetDataSource && this.props.onResetDataSource(datasource);
     }
    public getNextDatasource = () => {
        if (this.state.pageNumber * this.state.pageSize < this.state.total) {
            if (this.props.onFetchList) {
                
                this.fetchDataSource({
                    pageNumber: this.state.pageNumber + 1,
                    pageSize: this.state.pageSize
                });

            } else {
                this.props.onChangePage && this.props.onChangePage({
                    pageNumber: this.state.pageNumber + 1,
                    pageSize: this.state.pageSize
                }, true)
            }
        }
    }
    private getDataSource(): any {
        if (this.props.getDataSource) {
            let datasource: any =  this.props.getDataSource(this.state.pageNumber, this.state.pageSize) as any[];
            
            // group
            if (this.props.groupKey) {
                let cacheGroup: any = {};
                let trueDatasource: any = [];
                let groupKey: string = this.props.groupKey;
                datasource.forEach(it => {
                    let value: any = it[groupKey];
                    if (!cacheGroup[value]) {
                        cacheGroup[value] = []
                    }
                    cacheGroup[value].push(it)
                })

                Object.keys(cacheGroup).map(it => {

                    trueDatasource.push({
                        $type: 'group',
                        title: it
                    })

                    trueDatasource.push.apply(trueDatasource, cacheGroup[it]);

                })
                return trueDatasource;
            }

            return datasource;
        }
    }

    public fetchDataSource(params: any) {
        if (this.props.onFetchList){
            let pageNumber: number = params.pageNumber || this.state.pageNumber;
            this.props.onFetchList(params).then(result => {
                // append
                let dataSource: any = pageNumber > 1 ? [
                    ...this.state.dataSource,
                    ...result.data
                ] : result.data;

                this.setState({
                    pageNumber: result.pageNumber || params.pageNumber,
                    pageSize: result.pageSize || params.pageSize,
                    total: result.total,
                    dataSource: dataSource
                })
            })
        }
    }

    public UNSAFE_componentWillReceiveProps(newProps: any) {
        
        if (newProps.reflush !== this.state.reflush) {

            if (this.props.onFetchList) {
                this.setState({reflush: newProps.reflush})
                this.fetchDataSource({
                    pageNumber: 1,
                    pageSize: this.state.pageSize
                });
            } else {
                this.setState({
                    dataSource: this.getDataSource(),
                    reflush: newProps.reflush
                }, ()=> this.resetDataSource())
            }
        }

        if (!utils.isUndefined(newProps.total) && (newProps.total !== this.state.total)) {
           this.setState({
               total: newProps.total
           })
        }

        if (newProps.loading !== this.state.loading) {
           this.setState({
               loading: newProps.loading
           })
        }

        if (!utils.isUndefined(newProps.pageSize) && newProps.pageSize != this.state.pageSize) {
           this.setState({
               pageSize: newProps.pageSize
           })
        }

        //  HAVE Q
        if (!utils.isValidValue(newProps.pageNumber) && (newProps.pageNumber != this.state.pageNumber)) {
            this.setState({
                dataSource: this.getDataSource(),
                pageNumber: newProps.pageNumber
            })
        }

        if (newProps.optional != this.state.optional) {
            this.setState({
                optional: newProps.optional
            })
        }
        
        if (newProps.selectedRowKeys != this.state.selectedRowKeys) {
            this.setState({
                selectedRowKeys: newProps.selectedRowKeys,
                selectedKey: Array.isArray(newProps.selectedRowKeys) ? newProps.selectedRowKeys[0] :  newProps.selectedRowKeys 
            })
        }

        if (newProps.mode != this.state.mode) {
            this.setState({
                mode: newProps.mode
            })
        }
    }

    private getTrueSize() {
        let { size = 'middle' } = this.props;

       // if (size == 'mini') {
           // return 'small'
        //}
        return size as any;
    }

    private renderExtra(rowItem: any, index: number) {
        // 新增默认
        return (
            <div className='ui-mircotable-extra' onClick={consume}>
                
                {this.renderDataExtra(rowItem, index, 'extra', 'renderRowExtra')}
                
                <Space className='ui-toolbar'>
                    {this.props.layout === 'card' && this.renderDataExtra(rowItem, index, 'itemExtra', 'renderRowItemExtra')}
                    {this.state.mode !=='pick' && this.props.renderRowOperater && this.props.renderRowOperater(rowItem, index, (operate: any, rowData: any, rowIndex: number) => {
                        // TODO
                        if (this.props.optional && ['view','edit', 'delete'].indexOf(operate.type) == -1 ) {
                            //this.setState({
                            //    selectedKey: rowData[this.props.rowKey]
                            //})
                        }
                        // 
                    }, this.getActionSize())}
                </Space>
            </div>
        )
    }

    private getActionSize() {
        return this.props.layout == 'card' ? 'small' : 'default'
    }



    private getFieldByPlace(place: string = 'avatar') {
        let fields: any = this.props.fields || [];
        return fields.find(it => it.place && it.place == place)
    }
    private getFieldsByPlace(key: string) {
        let fields: any = this.props.fields || [];
        
        return fields.filter(it => it.place && it.place == key)
    }
    private getLayout() {
        let layout: any = this.props.layout;

        if (['avatar' , 'connections', 'info'].indexOf(layout) > -1) {
            return 'horizontal'
        }
        return layout;
    }
    private getAvatarShape() {
        if (this.props.avatarShape ) {
            return this.props.avatarShape;
        }
        if (['info', 'card'].indexOf(this.props.layout as any) > -1 ) {
            return 'square'
        }
        return 'circle';
    }
    private layoutAvatarSizeMap: any = {
        info: 24,
        card: 88
    }
    private getAvatarSize() {
        let { layout } = this.props;
        
        if (this.state.mode == 'pick') {
            return 64;
        }
        return this.props.avatarSize || (this.layoutAvatarSizeMap[layout as string] || 40)
    }
    private getMinMaxAvatar() {
        if (this.props.minIcon) {
            return this.props;

        } else {
            if (['avatar', 'horizontal'].indexOf(this.props.layout as any) > -1) {
                return {
                    maxIcon: 3,
                    minIcon: 3
                }
            } else {
                return { maxIcon: 1, minIcon: 1 }
            }
        }
    }
    private paddingAvatar(avatars: any[]) {

        let { maxIcon = 1, minIcon = 0 } = this.getMinMaxAvatar();

        if (this.props.layout == 'connections' || this.props.avatar) {
            return [avatars[0]]
        }

        if (avatars.length > maxIcon) {
            let newAvatars: any[] = avatars.slice(0, maxIcon - 1);
            if (newAvatars.length) {
                newAvatars.push({
                    type: 'default',
                    color: '#ccc',
                    text: '+' + (avatars.length - 3)
                });
                return newAvatars;
            } else {
                return [avatars[0]]
            }
        }

        if (avatars.length < minIcon) {
            avatars = avatars.concat(
                new Array(minIcon - avatars.length).fill({
                    type: 'default'
                })
            )
        }
        return avatars;
    }
    private getAvatarsByRowData(rowData: any,rowIndex: number, avatarField:any) {
            
        if (avatarField) {
            let avatarData: any = rowData['DisplayValue_'+ avatarField.key] || rowData[avatarField.key];
            
            if (avatarData) {
                if (this.props.avatarMerge) {
                    return avatarData;
                }

                let avatars: any = Array.isArray(avatarData) ? avatarData : [avatarData];
                
                return this.paddingAvatar(avatars.map(it => {
                    let temp: any = typeof it == 'string' ? { icon: it } : it;
        
                    let icon: string = temp.icon || temp.url || temp.avatar || temp.image ||'';
                    //let iconMaps: any = this.props.iconMaps || {}
                    
                    return icon ? {
                        icon: icon,
                        //type: icon.match(/[\/\.]/) ? 'img' : 'icon',
                        type: this.props.avatar,
                        color: temp.color
                    } : false;
                }).filter(Boolean));
            }
        }

        return null
    }
    private isReverseColor(rowData) {
        
        let reverseColor: any =  this.props.avatarReverseColor || this.props.layout == 'card';
        if (reverseColor) {
            return this.isSelectedRow(rowData) ? !reverseColor : reverseColor;
        }
    }
    private renderAvatarAuto(avatarPlace: any, rowData: any) {
        let fieldKey: string = avatarPlace.fieldKey;
        let dict: any = avatarPlace.dict || [];
        let data: any = rowData['DisplayValue_'+fieldKey] ||rowData[fieldKey];
        let findIcon = dict.find(it => it.value == data)
        
        if (findIcon && findIcon.icon) {
            return (<span className='ui-mircotable-avatar'>
                <FormerTypes.avatar reverseColor={this.isReverseColor(rowData)} key={1} type={this.getAvatarShape()} autoColor={!!this.props.autoColor} color={findIcon.color} icon={findIcon.icon}  size={this.getAvatarSize()}  />
            </span>)
        } else {
            return (<span className='ui-mircotable-avatar'>
                <FormerTypes.avatar reverseColor={this.isReverseColor(rowData)} key={2} type={this.getAvatarShape()} autoColor={false} icon={data}  size={this.getAvatarSize()}  />
            </span>)
        }
    }
    private renderAvatar(rowData: any, rowIndex: any, avatars?: any) {

        let avatarPlace: any;

        if (this.props.renderRowAvatar) {
            return this.props.renderRowAvatar(rowData, rowIndex);
        }

        if (avatars = this.getAvatarsByRowData(rowData, rowIndex, avatarPlace = this.getFieldByPlace('avatar'))) {
            
            if (this.props.avatar == 'auto') {

                return this.renderAvatarAuto(avatarPlace, rowData);
            } else {
                if (this.props.layout == 'connections' || this.props.avatar ==='connections') {
                    return (
                        <span className='ui-mircotable-avatar-con'>
                            <FormerTypes.avatar  reverseColor={this.isReverseColor(rowData)} key={3} type="string" {...avatars[0]} size={40} />
                            <Icons.ConnectionsDirectivityOutlined key={2} />
                            <FormerTypes.avatar  reverseColor={this.isReverseColor(rowData)} key={1} type="string" viewer={true}  icon={this.props.icon} size={40} />
                            
                        </span>
                    )
                }
                
                return (
                    <span className='ui-mircotable-avatar'>
                        {!this.props.avatarMerge ? avatars.map((avatar, index) => {
                            return <FormerTypes.avatar  reverseColor={this.isReverseColor(rowData)} shape={this.getAvatarShape()} autoColor={!!this.props.autoColor} key={index} {...avatar} size={this.getAvatarSize()} style={{ zIndex: avatars.length - index }} />
                        }) : <FormerTypes.avatar  reverseColor={this.isReverseColor(rowData)} key={2} shape={this.getAvatarShape()} autoColor={!!this.props.autoColor} size={this.getAvatarSize()} icon={avatars}  />}
                    </span>
                )
            }
        }

        return (
            <span className='ui-list-index'>#{rowIndex +1}</span>
        );
    }
    private updateRowData(value: any) {
        // TODO 更新行数据
    }
    private renderDataExtra(rowData: any, rowIndex: number, place: string, propsMethod: string = '') {

        if (utils.isFunction(this.props[propsMethod])) {
            return this.props[propsMethod](rowData, rowIndex)

        } else {

            let extraList: any [] = this.getFieldsByPlace(place);
            let smartRequestMap: any = this.props.smartRequestMap || {};
            
            return extraList.map((field, index) => {
                
                return FormerTool.renderComponentByField(field, {
                    value: rowData[field.key],
                    key: field.key + index,
                    displayValue: rowData['DisplayValue_' + field.key],
                    size: this.getActionSize(),
                    ...(field.meta ? field.meta.props : {}),
                    recordValue: rowData,
                    onChangeValue: (value) => {
                        
                        if (smartRequestMap[field.action]) {
                            let requestData: any = {
                                ...rowData,
                                [`${field.key}`]: value
                            };
                            return smartRequestMap[field.action](requestData).then((ret) => {
                                
                                this.updateRowData(requestData)
                            })
                        }
                    }
                }, ' ')
            }).filter(Boolean)
        }   
    }

    private onClickItem = ( operate:any, rowData:any,rowIndex:number) => {
        
        let { pageMeta = {} } = this.props;
        let { props = {}} = pageMeta;
        
        if (this.state.mode !== 'pick') {
            if (props.rowClickOperate) {
                if (Array.isArray(pageMeta.rowoperate)) {
                    let find: any = pageMeta.rowoperate.find(it => it.name == props.rowClickOperate);
                    if (find) {
                        operate = find;
                    }
                }
                
            }
        }
        
        if (this.props.onRowClick) {
            this.props.onRowClick(operate, rowData, rowIndex)
        }

        if (this.state.optional) {
            this.setState({
                selectedKey: rowData[this.props.rowKey]
            })
        }
    }
    private canRowClick () {
        let { pageMeta = {} } = this.props;
        let { props = {}} = pageMeta;

        return this.state.optional || props.rowClickOperate ;
    }
    private isSelectedRow(rowData: any) {
        return rowData[this.props.rowKey] == this.state.selectedKey
    }
    private renderListItem = (rowData: any, index: number) => {

        let ItemClassName: string = this.props.renderRowClassName ? this.props.renderRowClassName(rowData, index) : '';
        
        
        if (this.canRowClick() ){
            ItemClassName += ' ui-tabler-item-canselected'

            if ( this.state.optional&& this.isSelectedRow(rowData)) {
                ItemClassName+= ' ui-tabler-item-selected';
            }
        }



        if (this.props.renderRow) {
            return (
                <List.Item key={'item' + rowData.id + index} className={ItemClassName}>
                    {this.props.renderRow(rowData, index)}
                </List.Item>
            )
        }

        if (rowData['$type'] == 'group') {

            return <List.Item key={'group' + index} className='ui-mircotable-group stop-animation'>{rowData.title}</List.Item>

        } else {
            return (
                <List.Item
                    actions={[this.renderExtra(rowData, index)]}
                    onClick={() => { this.onClickItem({ type: 'rowclick' }, rowData, index) }}
                    id={rowData.id}
                    key={'item' + rowData.id + index}
                    extra={this.props.layout!= 'card' && this.renderDataExtra(rowData, index, 'itemExtra', 'renderRowItemExtra')}
                    className={ItemClassName}
                >
                    <List.Item.Meta
                        key={rowData.id + index + 'meta'}
                        avatar={this.renderAvatar(rowData, index)}
                        title={<React.Fragment key={'title'+rowData.id}>
                            {this.renderDataExtra(rowData, index, 'title', 'renderRowTitle')}
                            <div className='ui-subtitle'>{this.renderDataExtra(rowData, index, 'subtitle', 'renderRowSubTitle')}{this.props.layout=='card' && this.renderCreateAt(rowData)}</div>
                        </React.Fragment>}
                        description={this.renderItemDescription(rowData,index)}
                    />
                     <div className='ui-mrcotable-content'>{this.renderDataExtra(rowData, index, 'content', 'renderRowContent')}</div>
                </List.Item>
            )
        }
    }
    private renderItemDescription(rowData: any, index) {


        return (
            <>
                <span className='ui-meta-description-wrapper'>{this.renderDataExtra(rowData, index, 'description', 'renderRowDescription')}</span>
                {(this.props.layout!=='card' && !this.props.noCreateAt) && this.renderCreateAt(rowData)}
            </>
        )
    }
    private renderCreateAt(rowData: any) {
        
        if (rowData.createdAt && this.state.mode =='default') {
            return (<Tooltip placement="top" title={utils.isMobileDevice() ? '' : "Created: " + BaseUtil.formatDate(rowData.createdAt, 'YYYY/MM/DD HH:mm:ss ddd')}>
                <span className='ui-createdat-wrapper'>
                    {BaseUtil.formatSampleDate(rowData.createdAt, 'YYYY/MM/DD')}
                </span>
            </Tooltip>)
        }
    }
    private renderListContent() {
        let layout: any = this.getLayout();
        return (
            <List
                key={11}
                size={this.getTrueSize()}
                grid={layout == 'horizontal' ? null : this.props.grid}
                itemLayout={layout != 'horizontal' ? 'vertical' : 'horizontal'}
                dataSource={this.state.dataSource}
                renderItem={this.renderListItem}
            >
            </List>
        )
    }
    public renderList(){

        
        let { dataSource } = this.state;
        
        if (dataSource && dataSource.length) {
            return (<InfiniteScroll
                dataLength={dataSource.length}
                next={this.getNextDatasource}
                key={122}
                hasMore={(dataSource.length < this.state.total) && (dataSource.length >= this.state.pageSize)}
                loader={this.renderLoadingSkeletion(1)}
                endMessage={dataSource.length > 10 && <Divider plain>{i18n.t('It is all, nothing more')}</Divider>}
                scrollableTarget={this.id}
                onScroll={(e:any)=> {
                    let isScrollTop: boolean = e.target.scrollTop < 5;
                    
                    if (isScrollTop != this.state.scrollTop) {
                        this.setState({
                            scrollTop: isScrollTop
                        })
                    }
                    
                }}
            >
                {this.renderListContent()}
            </InfiniteScroll>)
        }

        return this.state.loading
            ? this.renderLoadingSkeletion()
            : this.renderEmpty();
   
    }
    public renderEmpty() {
        let { pageMeta, onGetRequestParams } = this.props;
        
        if (pageMeta && pageMeta.block) {
            let params: any = Object.assign(onGetRequestParams && onGetRequestParams() || {}, {name: 'empty'})
            let block: any = pageMeta.block.filter(it => TableUtils.isMatchValue(it.filter, params))
            
            if (block.length == 0) {
                block = [pageMeta.block[0]];
            }

            if (block.length) {
                return (
                    <Box dataSource={block}  events={{
                        create: (params: any) => {
                            this.props.onAddNew && this.props.onAddNew(params) 
                        }
                    }} />
                )
            }
        }
        return (
            <Empty 
                description={<>
                    <span>NO DATA</span>{this.props.onAddNew && 
                    <Button onClick={() => { this.props.onAddNew && this.props.onAddNew() }} type="link">CREATE NEW</Button>}
                    </>
                } 
             />
        )
    }

    public render() {
        let layout: string = this.getLayout();
        
        return (
            <div
                className={
                    classnames({
                        'ui-mircotable-wrapper': true,
                        [`ui-mircotable-mode-${this.state.mode}`]: this.state.mode,
                        [`ui-mircatable-type-${this.props.layout}`]: this.props.layout,
                        'ui-mircotable-scrollTop': !this.state.scrollTop
                    })
                }
            >
                {this.props.renderSearcher && this.props.renderSearcher()}
                {this.props.renderOperater && this.props.renderOperater()}
                
                <div
                className={classnames({
                    'ui-mircotable': true,
                    
                    [`ui-mircotable-${this.props.classify}`]: this.props.classify,
                    [`ui-mircotable-${layout}`]: layout,
                    [`ui-mircotable-${this.props.size}`]: this.props.size
                })}
                id={this.id}
                >   {this.props.notice && <FormerTypes.notice notice={this.props.notice}/>}
                    {this.renderList()}
                </div>
            </div>
        )
    }
    
    private renderLoadingSkeletion(rowNumber?: number) {
        return <Skeleton avatar={{ shape: this.getAvatarShape(), size: this.getAvatarSize() }} paragraph={{ rows: rowNumber || 5 }} active />
    }  
}