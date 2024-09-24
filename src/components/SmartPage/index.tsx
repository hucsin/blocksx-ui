/**
 * 自动布局页面
 */
import React from 'react';
import classnames from 'classnames';
import { utils } from '@blocksx/core';
import { Spin, Empty, Drawer, Popover } from 'antd';
import './types';

import * as DomUtils from '../utils/dom';

import PageManger from './core/SmartPageManger';
import SmartRequest from '../utils/SmartRequest';
import ClassifyPanel from '../ClassifyPanel';
import FilterFolder from '../FilterFolder';


import withRouter, { routerParams } from '../utils/withRouter';
import { PageMeta } from './interface';
import SmartUtil from './core/utils';

import './style.scss';
import SmartPageUtils from './core/utils';

import { cloudTexture, mainTexture } from './core/texture';







const svgbgstring = cloudTexture;


export interface SmartPageProps {
    params?: any;
    id?: string;
    isViewer?: boolean;
    readonly?: boolean;
    history?: any;
    router?: routerParams;
    children?: any;
    value?: any;
    reflush?: any;
    typeProps: any;
    props: any;
    open: boolean;
    onShow?: Function;
    onClose?: Function;



    width?: number;
    type: 'default' | 'drawer' | 'popover';
    popoverWrapper?: boolean;
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
    pageMode?: string;
    rootClassName?: string;

    // 是否是选择模式
    optional?: any;
    rowSelection?: boolean;
    onChangeValue?: Function;
    onSelectedValue?: Function;
    onInitPage?: Function;
    onSchemaResponse?: Function;
    onGetDependentParameters?: Function;

    operateContainerRef?: any;
    titleContainerRef?: any;
    size?: any;
    triggerMap?: {
        [key: string]: Function;
    };
    onMouseLeave?: Function;

    onValidationSuccess?: Function;
    onValidationFailed?: Function;
}

export interface SmartPageState {
    meta?: any;
    pageMeta: PageMeta;
    metaKey: string;
    uiType: string;
    schema: any;
    okText?: string;
    okIcon?: string;
    loading: boolean;
    icon?: string;

    open: boolean;

    reflush?: number;
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
    id?: string;

    changed: boolean;
    pageMete?: any;

    props: any;

    readonly?: boolean;
}


export default class SmartPage extends React.Component<SmartPageProps, SmartPageState> {

    public static defaultProps = {
        pageURI: '/eos/smartpage/find',
        type: 'default',
        popoverWrapper: true,
        uiType: '',
        open: false,
        noClassify: false,
        typeProps: {},
        props: {},
        title: 'View the recrod',
        okText: 'Save',

    }
    private defaultWidthMap: any = {
        tree: 600,
        popover: 600
    }
    private canShow: boolean;
    public static manger: any = PageManger;

    private requestHelper: any;
    private searchRef: any;
    private toolbarRef: any;
    private isLoading: boolean;
    private instance: any;

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
            changed: false,
            okText: props.okText,

            title: props.title,
            metaKey: '',
            uiType: props.uiType,
            path: '',
            name: props.name,
            reflush: props.reflush || 0,
            optional: props.optional,
            noTitle: props.noTitle,
            optionalOpen: false,
            notice: props.notice,
            noFolder: props.noFolder || props.simplicity,
            noHeader: props.noHeader === false ? false : props.noHeader || props.simplicity,
            noToolbar: props.noToolbar || props.simplicity,
            noClassify: props.noClassify || props.simplicity,
            rowSelection: props.rowSelection,
            mode: props.mode,
            defaultClassify: this.getDefaultClassify(),
            defaultFolder: this.getDefaultFolder(),
            folderReflush: +new Date,
            layout: '',
            id: props.id,
            props: props.props,
            readonly: props.readonly
        }

        this.requestHelper = SmartRequest.makeGetRequest(props.pageURI);

        this.canShow = false;
        this.searchRef = React.createRef();
        this.toolbarRef = props.operateContainerRef || React.createRef();

        this.operateContainerRef = props.operateContainerRef || React.createRef();
        this.titleContainerRef = props.titleContainerRef || React.createRef();
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
        this.setState({ loading: this.isLoading })
    }
    public fetch = () => {

        if (!this.hasLoading()) {
            this.setLoading(true);

            let { params } = this.props;
            let paramsObject: any = utils.isFunction(params) ? params() : params;



            SmartUtil.fetchPageSchema(this.props.pageURI, this.state.name, this.props, paramsObject, (schema) => {

                if (this.props.onSchemaResponse) {

                    this.props.onSchemaResponse(schema)
                }
                return schema;
            }).then(async (data: any) => {

                // onSchemaResponse

                if (!this.state.noClassify) {

                    if (data.schema.fields) {

                        let classifyField = this.getClassifyField(data.schema.fields);

                        if (classifyField && classifyField.factor) {
                            try {
                                let folder: any = await this.getOnFetchFolder(classifyField)({})
                                classifyField.dict = folder;
                            } catch (e) { console.log(e) }
                        }

                        data.classifyField = classifyField;

                        if (classifyField) {
                            if (classifyField.meta.classify == 'noall' && classifyField.dict[0]) {

                                if (!this.state.defaultClassify || this.state.defaultClassify == 'all') {

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
                // 合并至value
                if (data.value) {

                    data.value = utils.merge(this.state.value || {}, data.value);
                    this.onChangeValue(data.value)
                }
                data.pageMeta.title = meta.title || this.state.title;
                //data.title = meta.title;

                Object.assign(data, {
                    meta: meta,
                    title: meta.title || this.state.title,
                    metaKey: this.getMetaKey(data.pageMeta),
                    //reflush: this.props.reflush + 1,
                    noFolder: this.state.noFolder,
                    noHeader: this.state.noHeader,
                    noToolbar: this.state.noToolbar,
                    noClassify: this.state.noClassify,
                    value: data.value || this.state.value
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

        if (newProps.props != newProps.props) {
            this.setState({
                props: newProps.props
            })
        }

        if (newProps.name != this.state.name || newProps.id != this.state.id) {

            this.setState({
                id: newProps.id,
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

        // TODO 检查什么时候需要设置这个值
        if (this.props.onChangeValue) {
            if (newProps.value != this.state.value) {
                // console.log('resetvalue', newProps.value)
                //  this.setState({
                //      value: newProps.value
                //  })
            }
        }

        if (!utils.isUndefined(newProps.reflush) && newProps.reflush !== this.state.reflush) {

            this.setState({
                reflush: newProps.reflush,
                value: newProps.value
            })
        }

        if (!utils.isUndefined(newProps.open) && newProps.open != this.state.open) {
            this.setState({
                open: newProps.open
            })

            this.needInitSchema();
        }

        if (!utils.isUndefined(newProps.readonly) && newProps.readonly != this.state.readonly) {
            this.setState({
                readonly: newProps.readonly
            })
        }

    }
    private needInitSchema() {

        if (this.inFloatMode() && !this.state.schema) {
            this.fetch();
        }
    }
    private onClassifyChange = (query: any) => {
        let { folderMode } = this.state;
        let isFolderFilter = folderMode == 'filter';

        if (this.props.router) {
            this.props.router.utils.goQuery({
                classify: query,
                folder: isFolderFilter ? '' : this.state.folderQuery
            })
        }

        this.setState({
            classifyQuery: query,
            folderMeta: isFolderFilter ? null : this.state.folderMeta,
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
    private onFolderChange = (query: any, folderMeta: any, isint?: boolean) => {

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
    private getQueryParams = (v?: any, type?: any) => {
        let { folderQuery, classifyQuery, defaultClassify, defaultFolder } = this.state;
        let classifyName: string = classifyQuery || defaultClassify;
        let folderName: any = folderQuery || defaultFolder;
        let params: any = {};


        if (this.state.classifyField && classifyName) {
            if (classifyName !== 'all') {
                params[this.state.classifyField.key] = classifyName
            }
        }
        if (this.state.folderField && folderName) {
            if (folderName !== 'all') {
                params[this.state.folderField.key] = folderName;
            }
        }
        if (this.props.onGetDependentParameters) {
            Object.assign(params, this.props.onGetDependentParameters(v, type))
        }

        return params;
    }
    private onChangeValue = (value: any) => {
        //console.log('onchangevalue-smart', value)
        this.setState({
            value,
            changed: true
        })
        if (this.props.onChangeValue) {
            return this.props.onChangeValue(value)
        }
    }
    private onSelectedValue = (value: any) => {
        if (this.props.onSelectedValue) {
            return this.props.onSelectedValue(value)
        }
    }
    public renderContentView() {
        let { pageMeta, meta = {} } = this.state;
        let pageInfo: any = meta.page || {};
        return SmartPageUtils.renderPageType(this.state.uiType, {
            id: this.state.id,
            key: this.state.id,
            schema: this.state.schema,
            pageMeta: { ...this.state.pageMeta, ...pageInfo, title: meta.title },
            autoInit: !this.state.folderField,
            router: this.props.router,
            viewer: this.props.isViewer,
            readonly: this.state.readonly,
            title: this.state.title,
            path: this.state.path,
            reflush: this.state.reflush,
            iconType: 'avatar',
            value: this.state.value,
            okText: this.state.okText,
            onIcon: this.state.okIcon,
            rowSelection: this.state.rowSelection,
            noSearcher: this.props.noSearcher,
            noTitle: this.state.noTitle,
            noOperater: this.state.noToolbar,
            notice: this.state.notice && { notice: this.state.notice, icon: pageMeta.icon },
            toolbarRef: this.toolbarRef,
            operateContainerRef: this.operateContainerRef,
            titleContainerRef: this.titleContainerRef,
            optionalContainerRef: this.optionalContainerRef,
            optional: this.state.optional,

            size: this.props.size,
            ...this.state.props,
            onChangeValue: this.onChangeValue,
            onSelectedValue: this.onSelectedValue,
            mode: this.state.mode,
            searchRef: this.searchRef,
            onInit: (instance: any) => {

                this.instance = instance;
            },

            onGetRequestParams: this.getQueryParams,
            onOptionalOpen: this.state.optional ? (close) => {
                this.setState({
                    optionalOpen: !close ? true : false
                })
            } : null,
            onClose: this.onClose
        })
    }

    public renderRightContent() {
        let { classifyField = { meta: {} }, pageMeta, folderMeta, folderMode, folderField, noClassify } = this.state;

        // 不支持classify的情况
        if (!noClassify) {

            let classifyMeta: any = {
                label: folderMeta ? folderMeta.label : folderField ? pageMeta.title : pageMeta.title,
                description: folderMeta ? folderMeta.description || pageMeta.description : folderField ? pageMeta.description : pageMeta.description,
                icon: folderField ? pageMeta.icon : pageMeta.icon
            }


            let dictmap: any = classifyField.meta.classify == 'noall' ? [] : [{ value: 'all', label: 'All' }];

            classifyField.dict && (dictmap = dictmap.concat(classifyField.dict))

            return (
                <>
                    <div className={classnames({
                        'ui-classify-wrapper': true,
                        'ui-classify-noheader': this.state.noHeader,
                        'ui-classify-notabtitle': dictmap.length <= 1,
                        'ui-classify-optional-mode': this.state.optionalOpen
                    })}>
                        <ClassifyPanel
                            key={37}
                            title={classifyMeta.label as any}
                            description={classifyMeta.description}
                            icon={folderMode == 'folder' ? '' : this.props.icon || classifyMeta.icon}
                            extra={<span ref={this.toolbarRef}></span>}
                            tabsExtra={<span ref={this.searchRef}></span>}
                            onChange={this.onClassifyChange}
                            defaultActiveKey={this.state.defaultClassify}
                            renderContent={() => null}
                        >{dictmap.map(dict => {
                            return <ClassifyPanel.Panel key={dict.value} label={dict.label} value={dict.value}></ClassifyPanel.Panel>
                        })}
                        </ClassifyPanel>
                        <div className={classnames({
                            'ui-classify-content-wrapper': true,
                            //[`ui-classify-content-type-${}`]
                        })}>
                            <div className='ui-classify-content-left'>
                                {this.renderContentView()}
                                <div className='ui-background-dw' dangerouslySetInnerHTML={{ __html: svgbgstring }}>
                                </div>
                            </div>
                            <div className='ui-classify-content-right'>
                                <div ref={this.optionalContainerRef}></div>
                            </div>
                        </div>
                        <div className='ui-background-dwbg' dangerouslySetInnerHTML={{ __html: mainTexture }}></div>
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
                fetchREQ = SmartRequest.makePostRequest(this.state.path + '/' + folderField.folder);

                return (value) => {
                    return fetchREQ({
                        ...value,
                        classify: classifyQuery || defaultClassify
                    })
                }

            }
        } else if (folderField && folderField.factor) {
            let fetchREQ: any = SmartRequest.makePostRequest(folderField.factor.path + '/' + (type || folderField.factor.type || 'list'));

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
            return folderField.factor
        }

    }
    // 是否在弹窗里面
    private inFloatMode() {
        return this.props.type !== 'default'
    }
    private getFolderTitle() {
        let { folderMode, folderField, pageMeta } = this.state;

        return folderMode == 'filter' ? folderField.fieldName : pageMeta.title;
    }
    private getFolderLeftSize() {
        let { folderMode } = this.state;
        return folderMode == 'filter' ? 160 : this.inFloatMode() ? 200 : 240
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
                    onFetchCustomFolders={this.getOnFetchFolder(folderField, 'list')}
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
                [this.props.rootClassName as string]: this.props.rootClassName,
                [`ui-smartpage-layout-${this.state.layout}`]: this.state.layout
            })}

                onMouseLeave={() => {
                    this.props.onMouseLeave && this.props.onMouseLeave()
                }}
            >
                <Spin spinning={this.state.loading}>

                    {this.state.uiType ? this.renderMainContent() : <Empty />}
                </Spin>
            </div>
        )
    }
    private getDefaultWidth() {
        let defaultWidth: any = this.props.width || this.defaultWidthMap[this.props.type];
        let { pageMeta = {} } = this.state;


        if (pageMeta.width) {
            return pageMeta.width
        }

        if (!defaultWidth && this.hasLeftNavContent()) {
            return DomUtils.getBoundingClientWidth() - 200;
        }

        return defaultWidth || 600;
    }
    private onClose = (value?: any) => {
        if (this.props.onClose) {
            this.props.onClose(value, this.state.changed)
        }

        this.setState({ open: false })
    }
    private toggleOpenStatus = (open: boolean) => {
        
        if (this.props.onClose) {
            if (this.instance && this.instance.validationValue && !open) {

                return this.instance.validationValue((value: any) => {
                    this.setShowStatus(open)
                    let messg: any = this.instance.stepFormer.validationValue();
                    
                    if (messg && messg.length) {
                        this.props.onValidationFailed && this.props.onValidationFailed(messg);
                    } else {
                        this.props.onValidationSuccess && this.props.onValidationSuccess(value);
                    }
                }, null, (errorMessage: any) => {
                    this.setShowStatus(open);
                    
                    this.props.onValidationFailed && this.props.onValidationFailed(errorMessage);
                })

            }
        }

        this.setShowStatus(open)
    }
    private setShowStatus(open: boolean) {
        if (open) {
            this.setState({
                open: this.canShow || false
            })
            this.canShow && this.onShow();

        } else {

            this.onClose(this.state.value);
        }
    }
    private onShow() {
        this.setState({
            open: true
        })
        this.needInitSchema();
        this.props.onShow && this.props.onShow()
    }
    private onPopoverMouseUp = (event: any) => {
        let downAt: any = DomUtils.downAt();
        let offsetX: number = Math.abs(event.pageX - downAt.pageX);
        let offsetY: number = Math.abs(event.pageY - downAt.pageY);


        this.canShow = offsetX < 1 && offsetY < 1;
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
                    onClose={() => this.onClose()}
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
                        {this.props.popoverWrapper ? <div
                            onMouseUp={this.onPopoverMouseUp}
                            className='ui-smartpage-popover-wrapper'
                        >
                            {this.props.children}
                        </div> : this.props.children}
                    </Popover>
                )
            default:
                return (
                    this.renderContent()
                )
        }

    }
}

export const WithRouterSmartPage = withRouter(SmartPage)