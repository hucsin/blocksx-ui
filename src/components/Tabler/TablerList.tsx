import React from 'react';

import InfiniteScroll from 'react-infinite-scroll-component';
import { List, Skeleton, Empty, Divider, Button } from 'antd';

import { utils } from '@blocksx/core';
import { consume } from '../utils/dom';
import * as FormerTypes from '../Former/types';
import Block from '../Block';

import { TablerProps} from './typings';
import * as Icons from '../Icons';
import TableUtils from '../utils/tool';
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

}

interface TablerListProps extends TablerProps {
    autoColor?: boolean;
    avator?: string;
    pageMeta?: any;
    grid?: any;
    layout?: 'horizontal' | 'card' | 'avatar' | 'connections' | 'info';
    maxIcon?: number;
    minIcon?: number;
    classify?: 'mini' | 'default';
    onGetRequestParams?: Function;
    avatarSize?: number;
    onAddNew?: Function;
    renderRow?: Function;
    renderRowClassName?: Function;
    renderRowExtra?: Function;
    renderRowItemExtra?: Function;
    renderRowAvatar?: Function;
    renderRowTitle?: Function;
    renderRowDescription?: Function;
    renderRowContent?: Function;
}

export default class TablerList extends React.Component<TablerListProps, TablerState> {

    static defaultProps = {
        pageSize: 10,
        type: 'table',
        layout: 'avatar',
        formerAction: '',
        classify: 'default',
        quickValue: '',
        rowSelection: false,
        autoColor: true,
        grid: {
            column: 2,
            gutter: 24,

            xs: 1,
            sm: 1,
            md: 1,

            lg: 2,
            xl: 2,
            xxl: 3
        }
    }

    private id: any;

    public constructor(props: TablerProps) {
        super(props);
        this.state = {
            pageNumber: 1,
            total: 0,
            selected: 0,
            selectedRowKeys: [],
            pageSize: props.pageSize || 10,
            searcher: {},
            localData: true,
            cacheSize: {},
            cacheFilter: {},
            loading: false,
            reflush: props.reflush,
            
        };
        
        this.id = utils.uniq('id')
    }
    
    public componentDidMount() {
        //this.initDataSource(this.props);
        this.setState({
            dataSource: this.getDataSource()
        })
    }
    private resetDataSource(datasource?: any) {
        this.props.onResetDataSource && this.props.onResetDataSource(datasource);
     }
    public getNextDatasource = () => {
        
        if (this.state.pageNumber * this.state.pageSize < this.state.total) {
            this.props.onChangePage && this.props.onChangePage({
                pageNumber: this.state.pageNumber + 1,
                pageSize: this.state.pageSize
            }, true)
        }
    }
    private getDataSource(): any {
        if (this.props.getDataSource) {
            return this.props.getDataSource() as any[];
        }
     }

    public UNSAFE_componentWillUpdate(newProps: any) {
        if (newProps.reflush !== this.state.reflush) {
            this.setState({
                dataSource: this.getDataSource(),
                reflush: newProps.reflush
            }, ()=> this.resetDataSource())
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
               dataSource: this.getDataSource(),
               pageNumber: newProps.pageNumber
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
                {this.props.renderRowOperater && this.props.renderRowOperater(rowItem, index)}
            </div>
        )
    }



    private getFieldByPlace(place: string = 'avatar') {
        let fields: any = this.props.fields;
        return fields.find(it => it.place && it.place == place)
    }
    private getFieldsByPlace(key: string) {
        let fields: any = this.props.fields;
        
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
        if ('info' == this.props.layout) {
            return 'square'
        }
        return 'circle';
    }
    private getAvatarSize() {
        return this.props.avatarSize || (this.props.layout == 'info' ? 24 : 40)
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

        if (this.props.layout == 'connections') {
            return [avatars[0]]
        }

        if (avatars.length > maxIcon) {
            let newAvatars: any[] = avatars.slice(0, maxIcon - 1);
            if (newAvatars.length) {
                newAvatars.push({
                    type: 'default',
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
            let avatarData: any = rowData[avatarField.key];

            if (avatarData) {
                let avatars: any = Array.isArray(avatarData) ? avatarData : [avatarData];
                
                return this.paddingAvatar(avatars.map(it => {
                    let temp: any = typeof it == 'string' ? { icon: it } : it;
        
                    let icon: string = temp.icon || temp.url || temp.avatar || temp.image ||'';
                    //let iconMaps: any = this.props.iconMaps || {}
        
                    return icon ? {
                        icon: icon,
                        //type: icon.match(/[\/\.]/) ? 'img' : 'icon',
                        color: temp.color
                    } : false;
                }).filter(Boolean));
            }
        }

        return null
    }
    private renderAvatorAuto(avatorPlace: any, rowData: any) {
        let fieldKey: string = avatorPlace.fieldKey;
        let dict: any = avatorPlace.dict || [];
        let data: any = rowData[fieldKey];
        let findIcon = dict.find(it => it.value == data)
        
        if (findIcon && findIcon.icon) {
            return (<span className='ui-mircotable-avatar'>
                <FormerTypes.avatar type={this.getAvatarShape()} autoColor={!!this.props.autoColor} color={findIcon.color} icon={findIcon.icon}  size={this.getAvatarSize()}  />
            </span>)
        }
    }
    private renderAvatar(rowData: any, rowIndex: any, avatars?: any) {

        let avatarPlace: any;

        if (this.props.renderRowAvatar) {
            return this.props.renderRowAvatar(rowData, rowIndex);
        }

        if (avatars = this.getAvatarsByRowData(rowData, rowIndex, avatarPlace = this.getFieldByPlace('avatar'))) {
            if (this.props.avator == 'auto') {


                return this.renderAvatorAuto(avatarPlace, rowData);

            } else {
                if (this.props.layout == 'connections') {
                    return (
                        <span className='ui-mircotable-avatar-con'>
                            <FormerTypes.avatar key={1} type="string" viewer={true} color='#4338CA' icon='Bytehubs' size={40} />
                            <Icons.ConnectionsDirectivityOutlined key={2} />
                            <FormerTypes.avatar key={3} type="string" {...avatars[0]} size={40} />
                        </span>
                    )
                }

                return (
                    <span className='ui-mircotable-avatar'>
                        {avatars.map((avatar, index) => {
                            return <FormerTypes.avatar shape={this.getAvatarShape()} autoColor={!!this.props.autoColor} key={index} {...avatar} size={this.getAvatarSize()} style={{ zIndex: avatars.length - index }} />
                        })}
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
                return TableUtils.renderComponentByField(field, {
                    value: rowData[field.key],
                    key: field.key,
                    displayValue: rowData['DisplayValue_' + field.key],
                    recordValue: rowData,
                    onChangeValue: (value) => {
                        if (smartRequestMap[field.action]) {
                            let requestData: any = {
                                ...rowData,
                                [`${field.key}`]: value
                            };
                            smartRequestMap[field.action](requestData).then(() => {
                                this.updateRowData(requestData)
                            })
                        }
                    }
                }, ' ')
            }).filter(Boolean)
        }   
    }
    
    private renderListItem = (rowData: any, index: number) => {

        let ItemClassName: string = this.props.renderRowClassName ? this.props.renderRowClassName(rowData, index) : '';

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
                    onClick={() => { /*this.onClickItem(item, { value: 'view' }) */ }}
                    id={rowData.id}
                    key={'item' + rowData.id + index}
                    extra={this.renderDataExtra(rowData, index, 'itemExtra', 'renderRowItemExtra')}
                    className={ItemClassName}
                >
                    <List.Item.Meta
                        key={rowData.id + index + 'meta'}
                        avatar={this.renderAvatar(rowData, index)}
                        title={<React.Fragment key={'title'+rowData.id}>{this.renderDataExtra(rowData, index, 'title', 'renderRowTitle')}</React.Fragment>}
                        description={this.renderDataExtra(rowData, index, 'description', 'renderRowDescription')}
                    />
                    {this.renderDataExtra(rowData, index, 'content', 'renderRowContent')}
                </List.Item>
            )
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
         
            if (block.length) {
                return (
                   <div style={{marginTop: 32}}>
                        <Block dataSource={block} size="default" events={{
                            create: (params: any) => {
                                this.props.onAddNew && this.props.onAddNew(params) 
                            }
                        }} />
                    </div>
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
            <React.Fragment>
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
                >{this.renderList()}</div>
            </React.Fragment>
        )
    }
    
    private renderLoadingSkeletion(rowNumber?: number) {
        return <Skeleton avatar={{ shape: this.getAvatarShape(), size: this.getAvatarSize() }} paragraph={{ rows: rowNumber || 5 }} active />
    }  
}