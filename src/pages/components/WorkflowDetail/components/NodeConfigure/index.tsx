import React from 'react';
import { Popover, Tag, Space, Tooltip } from 'antd';
import './style.scss';


import i18n from '@blocksx/i18n';
import { Icons, DomUtils, FetchResult, MircoAvatar, Tabler, SearchBar } from '@blocksx/ui';


interface NodeConfigureProps {
    children: any;
    path: "category" | "classify";
    categoryMap: any;
    onFetchRecoFilter(params: any): Promise<FetchResult>;

    onClassifyClick?(rowItem: any): void;
    open?: boolean;
    onOpenChange?: Function
}
interface NodeConfigureState {
    // open: boolean;
    path: "category" | "classify";
    parent?: string;
    category: string;
    query: string;
    cache: any;
    reflush?: number;
    reflushDataSource?: number;
    dataSource: any;
    open?: boolean;
}

/**
 * 
 * category -> classify  system / 
 * 
 * app -> trigger /  action  / record / other / storge
 */
export default class NodeConfigure extends React.Component<NodeConfigureProps, NodeConfigureState> {
    private canShow: boolean;

    static defaultProps = {
        path: "category",
        categoryMap: [
            {
                value: 'system',
                label: i18n.t('System'),
                description: i18n.t('System tools collection')
            },
            {
                value: 'business',
                label: i18n.t('Business'),
                description: i18n.t('Business Management Software & Sales & Marketing & Industry-Specific Solutions')
            }, // 商业
            {
                value: 'tools',
                label: i18n.t('Tools'),
                description: i18n.t('IT、Technical & Personal Tools、Services & Data Management and Analytics')
            },
            
            {
                value: 'social',
                label: i18n.t('Social'),
                description: i18n.t('Social Platform & Collaboration Tools')
            },
            {
                value: 'datasource',
                label: i18n.t('Datasource'),
                description: i18n.t('Datasource Platform & Datasource Tools')
            }
        ]
    }

    public constructor(props: NodeConfigureProps) {
        super(props);

        this.state = {
            path: props.path,
            category: 'all',
            query: '',
            cache: {},
            dataSource: null,
            
            open:false
        }
    }
    
    public UNSAFE_componentWillReceiveProps(newProps: any) {
        if (this.state.open !== newProps.open ) {
            this.setState({
                open: newProps.open
            })
        }
    }
    private getTitleContent() {
        if (this.state.path == 'category') {
            return (<span className='ui-tit'>
                    <Icons.ConfigurationUtilityOutlined/>
                    {i18n.t('Select integration platform')}
                </span>)
        } else {
            return (
                <Space split='/'>
                    <span className='ui-back' onClick={this.onBack}>
                        <Icons.LeftCircleDirectivityOutlined /> 
                        {this.state.parent}
                    </span>
                    
                    <span className='ui-tit'>{i18n.t('Select the behavior')}</span>
                </Space>
            )
        }
    }
    private getTitle() {
        return (
            <div className='ui-recofilter-title'>
                {this.getTitleContent()}
                <SearchBar value={this.state.query} size={'small'} placeholder='search' 
                onChange={({query})=> {
                    this.setState({
                        query: query
                    }, ()=> {
                        this.reflush()
                    })
                }}
                />
            </div>
        )
    }
    private handleChange(tagKey: any, checked: boolean) {
        
        this.setState({
            category: tagKey
        }, ()=> {
            this.reflush();
        })
    }
    private onBack =() => {
        this.setState({
            path: 'category',
            dataSource: null,
            ...this.state.cache,
            cache: {}
            
        })
    }
    private reflush() {
        if (this.state.path == 'category') {
            this.setState({
                reflush: +new Date
            })
        } else {
            this.setState({
                reflushDataSource: +new Date
            })
        }
    }
    private onItemClick =(_:any, rowItem: any)=> {
        // 分类点击
        if (this.state.path == "category") {

            this.setState({
                cache: {
                    path: this.state.path,
                    query: this.state.query,
                    category: this.state.category
                },
               // reflush: +new Date,
                dataSource: rowItem.actions,
                path: 'classify',
                category: 'all',
                query: '',
                parent: rowItem.label || rowItem.name
            })
        } else {


            this.props.onClassifyClick && this.props.onClassifyClick({
                ...rowItem,
                ...rowItem.props
            });
            this.hidePopover();
        }
    }
   
    private hidePopover =()=> {
        this.setState({
            open: false
        })
    }
    private getFilterData(data) {
        let query: string = (this.state.query || '').toLowerCase();

        if (query) {

            return data.filter(it => {
                let name: string = (it.name || '').toLowerCase();
                let description: string = (it.description||'') .toLowerCase();

                return name.indexOf(query) > -1 || description.indexOf(query) > -1;
            })
        }
        return data;
    }
    public renderContent() {
        
        return (
            <div className='ui-node-configure-wrapper' 
                onContextMenu={DomUtils.consume}
                onMouseUp={DomUtils.consume}
            >
                {this.state.path == 'category' && <div className='ui-header'>
                    <span style={{ marginRight: 8 }}>Categories:</span>
                    <Space size={[4,4]} >
                        {[{
                            value: 'all',
                            label: 'All',
                            description: "all"
                        }, ... this.props.categoryMap].map((tag) => (
                            <Tag.CheckableTag
                                key={tag.value}
                                checked={tag.value == this.state.category}
                                onChange={(checked) => this.handleChange(tag.value, checked)}
                            >
                               <Tooltip mouseLeaveDelay={.3} placement='top' title={tag.description}>{tag.label}</Tooltip> 
                            </Tag.CheckableTag>
                        ))}
                    </Space>
                </div>}
                <div className='ui-bodyer'>
                    <div style={{
                        display: this.state.path == 'category' ? 'block': 'none'
                    }}>
                        <Tabler.TablerList
                            maxIcon={1}
                            minIcon={1}
                            key={1}
                            reflush = {this.state.reflush}
                            size='small'
                            fields={[
                                {
                                    key: 'icon',
                                    place: 'avatar' 
                                },
                                {
                                    key: 'name',
                                    place: 'title' 
                                },
                                {
                                    key: 'description',
                                    place: 'description'
                                }
                            ]}
                            avatarSize={40}
                            avatarShape='square'
                            actionSize='small'
                            classify='mini'
                            iconKey='status'
                            onRowClick={this.onItemClick}
                            renderItemClassName={it => `ui-runlog-${it.type}`}
                            onFetchList={(params: any) => {
                                
                                return this.props.onFetchRecoFilter({
                                    ...params,
                                    path: this.state.path,
                                    category: this.state.category,
                                    query: this.state.query
                                })
                            }}
                            renderExtra={() => { }}
                        ></Tabler.TablerList>
                    </div>
                    <div style={{
                        display: this.state.path == 'category' ? 'none': 'block'
                    }}>
                        {this.state.dataSource && <Tabler.TablerList
                            maxIcon={1}
                            minIcon={1}
                            reflush = {this.state.reflushDataSource}
                            size='small'

                            actionSize='small'
                            groupKey='displayType'
                            avatarMerge={true}
                            avatarSize={40}
                            fields={[
                                {
                                    key: 'icon',
                                    place: 'avatar' 
                                },
                                {
                                    key: 'name',
                                    place: 'title' 
                                },
                                {
                                    key: 'subname',
                                    place: 'subtitle' 
                                },
                                {
                                    key: 'description',
                                    place: 'description'
                                }
                            ]}
                            avatarShape='square'
                            getDataSource={()=> this.getFilterData(this.state.dataSource)}
                            
                            onRowClick={this.onItemClick}
                            renderExtra={() => { }}
                        ></Tabler.TablerList>}
                    </div>
                </div>
            </div>
        )
    }
    private onMouseUp =(event: any)=> {
        let downAt: any = DomUtils.downAt();
        let offsetX:number = Math.abs(event.pageX - downAt.pageX);
        let offsetY:number = Math.abs(event.pageY - downAt.pageY);
        

        this.canShow = offsetX < 10 && offsetY < 10;
    }

    public render() {
        return (
            <Popover
                title={this.getTitle()}
                trigger='click'
                placement="right"
                content={this.renderContent()}
                rootClassName="ui-reco-filter"
                autoAdjustOverflow={true}
                
                open={this.state.open}
                onOpenChange={(v)=> {
                    let openState: boolean = this.canShow ? v : false;
                    this.setState({ open: openState });

                    this.props.onOpenChange && this.props.onOpenChange(openState)
                }}
            >
                <span
                    onMouseUp={this.onMouseUp}
                    className='ui-recofilter-wrapper'
                >
                    {this.props.children}
                </span>
            </Popover>
        )
    }
}