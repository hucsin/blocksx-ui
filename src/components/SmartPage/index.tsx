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
import CleanseSchema from './core/CleanseSchema'
import SmartRequest from '../utils/SmartRequest';
import ClassifyPanel from '../ClassifyPanel';
import FilterFolder from '../FilterFolder';

import withRouter, { routerParams } from '../utils/withRouter';
import './style.scss';


export interface PageMeta {
    title?: string;
    description?: string;
    icon?: string;
    type?: string;
}


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
    uiType: 'tree' | 'tabler' | 'former' | '';
    title: string;
    name: string; // 页面的一个唯一ID
    pageMeta?: PageMeta;
    okText?: string;

    simplicity?: boolean; /** 简约模式 */
    noClassify?: boolean;
    noFolder?: boolean;
    noHeader?: boolean;
    noToolbar?: boolean;

    defaultFolder?: string;
    defaultClassify?: string;

    pageURI: string;
    mode?: string;
    rowSelection?: boolean;
    onChangeValue?: Function;
    onInitPage?: Function;

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
    loading: boolean;

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

    noFolder?: boolean;
    noHeader?: boolean;
    noToolbar?: boolean;
    noClassify?: boolean;


    rowSelection?: boolean;
    mode?: string;
    value?: any;

    defaultClassify: string;
    defaultFolder?: string;
}

export default class SmartPage extends React.Component<SmartPageProps, SmartPageState> {

    public static defaultProps = {
        pageURI: '/api/smartpage/find',
        type: 'default',
        uiType: '',
        open: false,
        noClassify: false,
        typeProps: {},
        title: 'View the recrod',
        okText: 'Save'
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
            noFolder: props.noFolder || props.simplicity,
            noHeader: props.noHeader=== false ? false : props.noHeader ||  props.simplicity,
            noToolbar: props.noToolbar || props.simplicity,
            noClassify: props.noClassify || props.simplicity,
            rowSelection: props.rowSelection,
            mode: props.mode,
            defaultClassify: this.getDefaultClassify(),
            defaultFolder: this.getDefaultFolder()
        }

        this.requestHelper = SmartRequest.createPOST(props.pageURI);

        this.canShow = false;
        this.searchRef = React.createRef();
        this.toolbarRef = React.createRef();

        this.operateContainerRef = React.createRef();
        this.titleContainerRef = React.createRef();
        
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
        if (!this.inFloatMode()) {
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
            
            this.requestHelper({
                page: this.state.name
            }).then(async (data) => {
                let { schema = {}, uiType, path } = data;
                let trueUiType: string = this.props.uiType || uiType;
                let classifyField: any
                
                if (PageManger.has(trueUiType)) {
                    let pageMeta: PageMeta = schema.meta || this.props.pageMeta || {};

                    // 清洗fields
                    schema.fields = CleanseSchema.getFieldProps(path, schema.fields);
                    
                    if (!this.state.noClassify) {
                        classifyField = this.getClassifyField(schema.fields);
                        
                        if (classifyField && classifyField.factor) {
                            try {
                                let folder: any = await this.getOnFetchFolder(classifyField)({})
                                classifyField.dict = folder;
                            } catch(e){console.log(e)}
                        }
                    }
                    
                    let initStateConfig: any = {
                        schema: schema,
                        uiType: trueUiType,
                        pageMeta: pageMeta,
                        classifyField: classifyField,
                        path,
                        metaKey: this.getMetaKey(pageMeta),
                        reflush: +new Date,
                        noFolder: this.state.noFolder,
                        noHeader: this.state.noHeader,
                        noToolbar: this.state.noToolbar,
                        noClassify: this.state.noClassify,
                        loading: false
                    };


                    if (!this.state.noFolder) {
                        initStateConfig.folderField =  
                            initStateConfig.noFolder ? null : this.getFolderField(schema.fields);
                    }

                    this.setState(initStateConfig)
                    this.setLoading();
                } else {
                    throw new Error(`Component type [${trueUiType}] does not exist!`);
                }
            }).catch((e) => {
                console.log(e)
                this.setState({loading: false})
            })
        }
    }
    

    public UNSAFE_componentWillUpdate(newProps: any) {

        if (newProps.pageMeta) {
            let newMetaKey: string = this.getMetaKey(newProps.pageMeta || {});

            if (this.state.metaKey != newMetaKey) {
                this.setState({
                    metaKey: newMetaKey,
                    pageMeta: newProps.pageMeta
                })
            }
        }
        
        if (newProps.title != this.state.title) {
            
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
        
        if (this.props.router) {
            this.props.router.utils.goQuery({
                classify: query
            })
        }

        this.setState({
            classifyQuery: query,
            reflush: +new Date
        })
    }
    private onFolderChange =(query: any, folderMeta: any) => {
        
        if (this.props.router) {
            this.props.router.utils.goQuery({
                folder: query
            })
        }

        this.setState({
            folderQuery: query,
            folderMeta,
            reflush: +new Date
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
        let ViewComponent: any = PageManger.findComponentByType(this.state.uiType);
        
        return (
             this.state.schema && <ViewComponent 
                key={this.state.reflush}
                schema = {this.state.schema}
                value = {this.state.value}
                pageMeta = {this.state.pageMeta}
            
                router={this.props.router}
                title={this.state.title}
                triggerMap = {this.props.triggerMap}
                path={this.state.path}
                reflush = {this.state.reflush}
                onGetRequestParams = {this.getQueryParams}
                okText={this.state.okText}
                rowSelection={this.state.rowSelection}
                mode={this.state.mode}
                searchRef= {this.searchRef}
                noOperater= {this.state.noToolbar}
                toolbarRef= {this.toolbarRef}
                operateContainerRef={this.operateContainerRef}
                titleContainerRef={this.titleContainerRef}
                onChangeValue={this.onChangeValue}
                onClose={()=>this.setState({open: false})}
            />
        )
    }

    public renderRightContent() {
        let { classifyField = {}, pageMeta, folderMeta, folderField, noClassify } = this.state;

        // 不支持classify的情况
        if (!noClassify) {

            let classifyMeta: any = {
                label: folderMeta ? folderMeta.label :  folderField ? '-' : pageMeta.title,
                description: folderMeta ? folderMeta.description :  folderField ? '-' : pageMeta.description,
                icon: folderField ? '' : pageMeta.icon
            }
                
            let dictmap: any = [{value: 'all', label: 'All'}];

            classifyField.dict && (dictmap = dictmap.concat(classifyField.dict))

            return (
                <div className={classnames({
                    'ui-classify-wrapper': true,
                    'ui-classify-noheader': this.state.noHeader
                })}>
                    <ClassifyPanel
                        key={37}
                        title = {classifyMeta.label as any}
                        description = {classifyMeta.description}
                        icon = {classifyMeta.icon}
                        extra ={<span ref={this.toolbarRef}></span>}
                        tabsExtra = {<span ref={this.searchRef}></span>}
                        onChange={this.onClassifyChange}
                        defaultActiveKey={this.state.defaultClassify}
                    >{dictmap.map(dict=> {
                        return <ClassifyPanel.Panel key={dict.value} label={dict.label} value={dict.value}></ClassifyPanel.Panel>
                    })}
                    </ClassifyPanel>
                    <div className='ui-classify-content-wrapper'>{this.renderContentView()}</div>
                </div>
            )
        }

        return this.renderContentView()
        
    }
    private getOnFetchFolder(folderField: any, type?: string): any {
       
        if (folderField && folderField.factor) {
            let fetch: any = SmartRequest.createPOST(folderField.factor.path + '/' + (type || folderField.factor.type || 'list'));

            return (value) => {
                if (folderField.factor.parent) {
                    value.parent = folderField.factor.parent
                }
                return fetch(value)
            }
        }
    }
    private hasLeftNavContent() {
        let { folderField } = this.state;
        return folderField && folderField.factor;
    }
    // 是否在弹窗里面
    private inFloatMode() {
        return this.props.type !=='default'
    }
    public renderMainContent() {
        let { folderField, pageMeta } = this.state;

        if (this.hasLeftNavContent()) {
            //let folder: any = folderField.meta.folder || {};
            //let tagC = tag.meta.tag;
            
            return (
                <FilterFolder 
                    key={pageMeta.title || pageMeta.icon}
                    title={pageMeta.title as any}
                    leftSize={this.inFloatMode() ? 200 : 240}
                    icon={pageMeta.icon as any}
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
        return (
            <div className='ui-smartpage-wrapper'>
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