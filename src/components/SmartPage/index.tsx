/**
 * 自动布局页面
 */
import React from 'react';
import classnames from 'classnames';
import { utils } from '@blocksx/core';
import { Spin, Empty, Drawer, Popover } from 'antd';
import './types';

import * as DomUtils  from '../utils/dom';

import PageManger from './core/SmartPageManger';
import SmartRequest from '../utils/SmartRequest';
import ClassifyPanel from '../ClassifyPanel';
import FilterFolder from '../FilterFolder';
import Notice from '../Former/types/notice';

import withRouter, { routerParams } from '../utils/withRouter';
import { PageMeta } from './interface';
import SmartUtil from './core/utils';

import './style.scss';
import SmartPageUtils from './core/utils';






export interface SmartPageProps {
    router?: routerParams;
    children?: any;
    value?: any;
    typeProps: any;
    open: boolean;
    onShow?: Function;
    onClose?: Function;
    width?: number;
    type: 'default' | 'drawer' | 'popover';
    uiType: 'tree' | 'tabler' | 'former' | 'group' | '';
    title: string;
    name: string; // 页面的一个唯一ID
    pageMeta?: PageMeta;
    okText?: string;
    okIcon?: string;
    notice?: string;
    icon?: string;

    simplicity?: boolean; /** 简约模式 */
    noClassify?: boolean;
    noFolder?: boolean;
    noSearcher?: boolean;
    noHeader?: boolean;
    noToolbar?: boolean;
    noTitle?: boolean;

    defaultFolder?: string;
    defaultClassify?: string;

    pageURI: string;
    mode?: string;

    // 是否是选择模式
    optional?: any;
    rowSelection?: boolean;
    onChangeValue?: Function;
    onInitPage?: Function;
    operateContainerRef?: any;
    size?: any;
    triggerMap?: {
        [key:string] : Function;
    }
}

export interface SmartPageState {
    pageMeta: PageMeta;
    metaKey: string;
    uiType: string;
    schema: any;
    okText?: string;
    okIcon?: string;
    loading: boolean;
    icon?: string;

    open: boolean;

    reflush: number;
    path: string;
    name: string;
    title: string;
    classifyQuery?: string;
    
    folderQuery?: string;
    folderMeta?: any;

    classifyField?: any;
    folderField?: any;
    folderMode?: any;
    folderReflush?: any;

    noTitle?: boolean;
    noFolder?: boolean;
    noHeader?: boolean;
    noToolbar?: boolean;
    noClassify?: boolean;

    rowSelection?: boolean;
    mode?: string;

    optional?: boolean;
    optionalOpen?: boolean;
    value?: any;
    notice?: any;

    defaultClassify: string;
    defaultFolder?: string;
    layout?: string;
}

export default class SmartPage extends React.Component<SmartPageProps, SmartPageState> {

    public static defaultProps = {
        pageURI: '/eos/smartpage/find',
        type: 'default',
        uiType: '',
        open: false,
        noClassify: false,
        typeProps: {},
        title: 'View the recrod',
        okText: 'Save',
        
    }
    private defaultWidthMap: any = {
        tree: 600,
        popover: 400
    }
    private canShow:boolean;
    public static manger: any = PageManger;

    private requestHelper: any;
    private searchRef: any;
    private toolbarRef: any;
    private isLoading: boolean;

    private operateContainerRef: any;
    private titleContainerRef: any;
    private optionalContainerRef: any;

    public constructor(props: SmartPageProps) {
        super(props)
        this.state = {
            loading: false,
            open: props.open,
            value: props.value,
            schema: null,
            pageMeta: {},
            okText: props.okText,
            
            title: props.title,
            metaKey: '',
            uiType: props.uiType,
            path: '',
            name: props.name,
            reflush: 0,
            optional: props.optional,
            noTitle: props.noTitle,
            optionalOpen: false,
            notice: props.notice,
            noFolder: props.noFolder || props.simplicity,
            noHeader: props.noHeader=== false ? false : props.noHeader ||  props.simplicity,
            noToolbar: props.noToolbar || props.simplicity,
            noClassify: props.noClassify || props.simplicity,
            rowSelection: props.rowSelection,
            mode: props.mode,
            defaultClassify: this.getDefaultClassify(),
            defaultFolder: this.getDefaultFolder(),
            folderReflush: +new Date,
            layout: ''
        }
        
        this.requestHelper = SmartRequest.createPOST(props.pageURI);

        this.canShow = false;
        this.searchRef = React.createRef();
        this.toolbarRef = props.operateContainerRef || React.createRef();

        this.operateContainerRef = props.operateContainerRef || React.createRef();
        this.titleContainerRef = React.createRef();
        this.optionalContainerRef = React.createRef();

    }
    private getDefaultFolder() {
        if (this.props.router) {
            
            let query: any = this.props.router.query;
            
            return query.folder || 'all'
        }

        return 'all'
    }
    private getDefaultClassify() {
        
        if (this.props.router) {
            
            let query: any = this.props.router.query;
            
            return query.classify || 'all'
        }

        return 'all'
    }
    private getMetaKey(meta: PageMeta) {
        return [meta.title, meta.description, meta.icon].join('-')
    }
    private getClassifyField(fields: any[]) {
        return fields.find(field => {
            return field.classify;
        })
    }
    private getFolderField(fields: any[]) {
        return fields.find(field => {
            return field.folder; 
        })
    }
    public componentDidMount() {
        if (!this.inFloatMode() || this.props.open === true) {
            this.fetch();
        }
    }
    private hasLoading() {
        return this.isLoading;
    }
    private setLoading(loding?: boolean) {
        this.isLoading = loding || false;
        this.setState({loading: this.isLoading})
    }
    public fetch = ()=> {

        if (!this.hasLoading()) {
            this.setLoading(true)

            SmartUtil.fetchPageSchema(this.props.pageURI, this.state.name, this.props).then(async (data:any) => {
                
                if (!this.state.noClassify) {

                    if (data.schema.fields) {

                        let classifyField = this.getClassifyField(data.schema.fields);
                        
                        if (classifyField && classifyField.factor) {
                            try {
                                let folder: any = await this.getOnFetchFolder(classifyField)({})
                                classifyField.dict = folder;
                            } catch(e){console.log(e)}
                        }

                        data.classifyField = classifyField;

                        if (classifyField) {
                            if (classifyField.meta.classify == 'noall' && classifyField.dict[0]) {
                                
                                if (!this.state.defaultClassify || this.state.defaultClassify=='all') {
                                    
                                    data.defaultClassify = classifyField.dict[0].value;
                                }
                            
                            }
                            
                        }
                    

                        if (!this.state.noFolder) {
                            data.folderField =  
                                data.noFolder ? null : this.getFolderField(data.schema.fields);
                            
                            if (data.folderField) {
                                data.folderMode = utils.isString(data.folderField.meta.folder) ? 'filter' : 'folder'
                            }
                        }
                    } else {

                        data.layout = 'page'
                    }
                    
                }
                let { meta = {} } = data.schema;
                Object.assign(data, {
                    title: meta.title || this.state.title,
                    metaKey: this.getMetaKey(data.pageMeta),
                    reflush: +new Date,
                    noFolder: this.state.noFolder,
                    noHeader: this.state.noHeader,
                    noToolbar: this.state.noToolbar,
                    noClassify: this.state.noClassify
                })

                if (this.props.onInitPage) {
                    this.props.onInitPage(data)
                }

                this.setState(data)
                this.setLoading();

            }, (e) => {
                this.setLoading()
            })
        }
    }
    

    public UNSAFE_componentWillReceiveProps(newProps: any) {

        if (newProps.pageMeta) {
            let newMetaKey: string = this.getMetaKey(newProps.pageMeta || {});

            if (this.state.metaKey != newMetaKey) {
                this.setState({
                    metaKey: newMetaKey,
                    pageMeta: newProps.pageMeta
                })
            }
        }
        
        if (newProps.name != this.state.name) {
            this.setState({
                name: newProps.name,
                title: newProps.title,
                value: newProps.value,
                mode: newProps.mode,
                okText: newProps.okText,
                open: newProps.open,
                schema: undefined,
                folderMeta: undefined,
                classifyQuery: undefined
            }, this.fetch)
        }

        if (newProps.value != this.state.value) {
            this.setState({
                value: newProps.value
            })
        }

        if (!utils.isUndefined(newProps.open) && newProps.open != this.state.open) {
            this.setState({
                open: newProps.open
            })
            
            this.needInitSchema();
        }


    }
    private needInitSchema() {

        if (this.inFloatMode() && !this.state.schema ) {
            this.fetch();
        }
    }
    private onClassifyChange = (query: any) => {
        let { folderMode } = this.state;
        let isFolderFilter = folderMode == 'filter';

        if (this.props.router) {
            this.props.router.utils.goQuery({
                classify: query,
                folder: null
            })
        }
        
        this.setState({
            classifyQuery: query,
            folderMeta: isFolderFilter ? null: this.state.folderMeta,
            folderQuery: isFolderFilter ? '' : this.state.folderQuery,
            optionalOpen: false,
            reflush: +new Date
        }, () => {
            if (this.state.folderMode == 'filter') {
                this.setState({
                  // folderReflush: +new Date
                })
            }
        })
    }
    private onFolderChange =(query: any, folderMeta: any, isint?: boolean) => {
        
        if (this.props.router) {
            this.props.router.utils.goQuery({
                folder: query
            })
        }

        this.setState({
            folderQuery: query,
            folderMeta,
            reflush: isint ? this.state.reflush : +new Date
        })
    }
    private getQueryParams = ()=> {
        let { folderQuery, classifyQuery, defaultClassify } = this.state;
        let classifyName: string = classifyQuery || defaultClassify;
        let params: any = {};

        
        if (this.state.classifyField && classifyName) {
            if (classifyName !== 'all') {
                params[this.state.classifyField.key] = classifyName
            }
        }
        if (this.state.folderField && folderQuery) {
            if (folderQuery !== 'all') {
                params[this.state.folderField.key] = folderQuery;
            }
        }
        return params;
    }
    private onChangeValue =(value: any)=> {
        this.setState({
            value
        })

        if (this.props.onChangeValue) {
            return this.props.onChangeValue(value)
        }
    }
    public renderContentView() {
        let { pageMeta} = this.state;
        
        return SmartPageUtils.renderPageType(this.state.uiType, {
            key: this.state.classifyQuery,
            schema: this.state.schema,
            pageMeta: this.state.pageMeta,
            autoInit: !this.state.folderField,
            router: this.props.router,
            title: this.state.title,
            path: this.state.path,
            reflush: this.state.reflush,
            value: this.props.value,
            okText: this.state.okText,
            onIcon: this.state.okIcon,
            rowSelection: this.state.rowSelection,
            noSearcher: this.props.noSearcher,
            noTitle: this.state.noTitle,
            noOperater: this.state.noToolbar,
            notice:  this.state.notice && {notice: this.state.notice,icon: pageMeta.icon},
            toolbarRef: this.toolbarRef,
            operateContainerRef:this.operateContainerRef,
            titleContainerRef:this.titleContainerRef,
            optionalContainerRef:this.optionalContainerRef,
            optional:this.state.optional,
            size:this.props.size,
            onChangeValue:this.onChangeValue,
            mode: this.state.mode,
            searchRef: this.searchRef,
            
            onGetRequestParams: this.getQueryParams,
            onOptionalOpen:(close)=>{
                this.setState({
                    optionalOpen: !close ? true : false
                })
            },
            onClose:()=>this.setState({open: false})
        })
    }

    public renderRightContent() {
        let { classifyField = { meta: {}}, pageMeta, folderMeta, folderMode, folderField, noClassify } = this.state;
        
        // 不支持classify的情况
        if (!noClassify) {

            let classifyMeta: any = {
                label: folderMeta ? folderMeta.label :  folderField ? pageMeta.title : pageMeta.title,
                description: folderMeta ? folderMeta.description || pageMeta.description :  folderField ? pageMeta.description : pageMeta.description,
                icon: folderField ?pageMeta.icon : pageMeta.icon
            }
            
            
            let dictmap: any = classifyField.meta.classify == 'noall' ? [] : [{value: 'all', label: 'All'}];

            classifyField.dict && (dictmap = dictmap.concat(classifyField.dict))
            
            return (
                <>
                <div className={classnames({
                    'ui-classify-wrapper': true,
                    'ui-classify-noheader': this.state.noHeader,
                    'ui-classify-notabtitle': dictmap.length <=1,
                    'ui-classify-optional-mode': this.state.optionalOpen
                })}>
                    <ClassifyPanel
                        key={37}
                        title = {classifyMeta.label as any}
                        description = {classifyMeta.description}
                        icon = {folderMode =='folder' ? '' : this.props.icon || classifyMeta.icon}
                        extra ={<span ref={this.toolbarRef}></span>}
                        tabsExtra = {<span ref={this.searchRef}></span>}
                        onChange={this.onClassifyChange}
                        defaultActiveKey={this.state.defaultClassify}
                        renderContent={() => null }
                    >{dictmap.map(dict=> {
                        return <ClassifyPanel.Panel key={dict.value} label={dict.label} value={dict.value}></ClassifyPanel.Panel>
                    })}
                    </ClassifyPanel>
                    <div className={classnames({
                        'ui-classify-content-wrapper': true,
                        //[`ui-classify-content-type-${}`]
                    })}>
                        <div className='ui-classify-content-left'>
                            {this.renderContentView()}
                        </div>
                        <div className='ui-classify-content-right'>
                            <div ref={this.optionalContainerRef}></div>
                        </div>
                    </div>
                </div>
                
                </>
            )
            
        }

        return this.renderContentView()
        
    }
    private getOnFetchFolder(folderField: any, type?: string): any {
        let { folderMode, classifyQuery, defaultClassify } = this.state;
        let fetchREQ: any;
        
        if (folderMode == 'filter') {
            // 过滤模式
            if (type == 'list') {
                fetchREQ = SmartRequest.createPOST(this.state.path + '/' + folderField.folder) ;

                return (value) => {
                    return fetchREQ({
                        ...value,
                        classify: classifyQuery || defaultClassify
                    })
                }

            }
        } else if (folderField && folderField.factor) {
            let fetchREQ: any = SmartRequest.createPOST(folderField.factor.path + '/' + (type || folderField.factor.type || 'list'));

            return (value) => {
                if (folderField.factor.parent) {
                    value.parent = folderField.factor.parent
                }
                return fetchREQ(value)
            }
        }
    }
    private hasLeftNavContent() {
        let { folderField, folderMode } = this.state;
        
        if (folderField) {

            if (folderMode == 'filter') {
                return true;
            }
            return  folderField.factor
        }
        
    }
    // 是否在弹窗里面
    private inFloatMode() {
        return this.props.type !=='default'
    }
    private getFolderTitle() {
        let { folderMode,folderField, pageMeta } = this.state;

        return folderMode == 'filter' ?  folderField.fieldName : pageMeta.title;
    }
    private getFolderLeftSize () {
        let { folderMode } = this.state;
        return folderMode == 'filter' ? 160 :this.inFloatMode() ? 200 : 240
    }
    private getFolderIcon() {
        let { folderMode, pageMeta } = this.state;

        return folderMode == 'filter' ? '' : pageMeta.icon as any

    }
    public renderMainContent() {
        let { folderField, folderMode, classifyQuery, pageMeta = {} } = this.state;
        
        if (this.hasLeftNavContent()) {
            //let folder: any = folderField.meta.folder || {};
            //let tagC = tag.meta.tag;
            
            return (
                <FilterFolder 
                    key={1}
                    mode={folderMode}
                    params={{
                        title: pageMeta.title?.toLowerCase()
                    }}
                    title={this.getFolderTitle()}
                    leftSize={this.getFolderLeftSize()}
                    reflush={folderMode == 'filter' ? classifyQuery : '0'}
                    icon={this.getFolderIcon()}
                    onFetchCustomFolders= {this.getOnFetchFolder(folderField, 'list')}
                    onAddCustomFolder={this.getOnFetchFolder(folderField, 'create')}
                    onChange={this.onFolderChange}
                    currentKey={this.state.defaultFolder}
                >
                    {this.renderRightContent()}
                </FilterFolder>
            )
        }
        
        return this.renderRightContent();
    }
    public renderContent() {
        let { pageMeta } = this.state;

            
        return (
            <div className={classnames({
                'ui-smartpage-wrapper': true,
                [`ui-smartpage-layout-${this.state.layout}`]: this.state.layout
            })}>
                <Spin spinning={this.state.loading}>
                   
                    {this.state.uiType ? this.renderMainContent() : <Empty/>}
                </Spin>
            </div>
        )
    }
    private getDefaultWidth() {
        let defaultWidth: any = this.props.width || this.defaultWidthMap[this.props.type];
        
        if (!defaultWidth && this.hasLeftNavContent()) {
            return DomUtils.getBoundingClientWidth() - 200;
        }

        return defaultWidth || 600;
    }
    private onClose() {
        if (this.props.onClose) {
            this.props.onClose()
        }
        this.setState({open:false})
    }
    private toggleOpenStatus =(open: boolean)=> {

        if (open) {
            this.setState({
                open: this.canShow || false
            })
            this.canShow && this.onShow();
            
        } else {
            this.onClose();
        }
    }
    private onShow() {
        this.setState({
            open: true
        })
        this.needInitSchema();
        this.props.onShow && this.props.onShow()
    }
    private onPopoverMouseUp=(event:any)=> {
        let downAt: any = DomUtils.downAt();
        let offsetX:number = Math.abs(event.pageX - downAt.pageX);
        let offsetY:number = Math.abs(event.pageY - downAt.pageY);
        

        this.canShow = offsetX < 10 && offsetY < 10;
    }
    public renderTitle() {
        return (
            <span ref={this.titleContainerRef}></span>
        )
    }
    public render() {
        
        switch (this.props.type) {
            case 'drawer':
                return (<Drawer
                    open={this.state.open}
                    {...this.props.typeProps}
                    title={this.renderTitle()}
                    width={this.getDefaultWidth()}
                    onClose={()=>this.onClose()}
                    className='ui-former ui-smartpage-drawer'
                    footer={<span ref={this.operateContainerRef}></span>}
                >
                    {this.renderContent()}
                </Drawer>)
            case 'popover':
                return (
                    <Popover
                        trigger={'click'}
                        placement="right"
                        {...this.props.typeProps}
                        open={this.state.open}
                        overlayStyle={{
                            width: this.getDefaultWidth()
                        }}

                        rootClassName="ui-smartpage-popover"
                        autoAdjustOverflow={true}
                        onOpenChange={this.toggleOpenStatus}
                        title={this.renderTitle()}
                        content={this.renderContent()}
                    >
                        <div
                            onMouseUp={this.onPopoverMouseUp}
                            className='ui-smartpage-popover-wrapper'
                        >
                            {this.props.children}
                        </div>
                    </Popover>
                )
                break;
            default:
                return this.renderContent();
        }
        
    }
}

export const WithRouterSmartPage  = withRouter(SmartPage)