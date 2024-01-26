/**
 * 自动布局页面
 */
import React from 'react';
import classnames from 'classnames';
import { Spin, Empty } from 'antd';
import './types'

import PageManger from './Manger';
import SmartRequest from '../utils/SmartRequest';
import ClassifyPanel from '../ClassifyPanel';
import FilterFolder from '../FilterFolder';


import './style.scss';


export interface PageMeta {
    title?: string;
    description?: string;
    icon?: string;
    type?: string;
}


export interface SmartPageProps {
    router?: any;
    name: string; // 页面的一个唯一ID
    meta?: PageMeta;

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
    meta: PageMeta;
    metaKey: string;
    uiType: string;
    schema: any;
    loading: boolean;

    reflush: number;
    path: string;
    name: string;
    classifyQuery?: string;
    
    folderQuery?: string;
    folderMeta?: any;

    classifyField?: any;
    folderField?: any;

    noFolder?: boolean;
    noHeader?: boolean;
    noToolbar?: boolean;

    rowSelection?: boolean;
    mode?: string;
    value?: any;
}

export default class SmartPage extends React.Component<SmartPageProps, SmartPageState> {

    public static defaultProps = {
        pageURI: '/api/smartpage/find'
    }
    public static manger: any = PageManger;

    private requestHelper: any;
    private searchRef: any;
    private toolbarRef: any;

    public constructor(props: SmartPageProps) {
        super(props)

        this.state = {
            loading: false,
            schema: null,
            meta: {},
            metaKey: '',
            uiType: '',
            path: '',
            name: props.name,
            reflush: 0,
            noFolder: props.noFolder,
            noHeader: props.noHeader,
            noToolbar: props.noToolbar,
            rowSelection: props.rowSelection,
            mode: props.mode
        }

        this.requestHelper = SmartRequest.createPOST(props.pageURI);
        this.searchRef = React.createRef();
        this.toolbarRef = React.createRef();
        
    }
    private getMetaKey(meta: PageMeta) {
        return [meta.title, meta.description, meta.icon].join('-')
    }
    private getClassifyField(fields: any[]) {
        return fields.find(field => {
            return field.meta && field.meta.classify;
        })
    }
    private getFolderField(fields: any[]) {
        return fields.find(field => {
            return field.meta && field.meta.folder;
        })
    }
    public componentDidMount() {
        
        this.fetch();
    }

    public fetch = ()=> {

        if (!this.state.loading) {
            this.setState({loading: true});
            
            this.requestHelper({
                page: this.state.name
            }).then(async (data) => {
                let { schema = {}, uiType, path } = data;
                
                if (PageManger.has(uiType)) {
                    let meta: PageMeta = schema.meta || this.props.meta || {};
                    
                    let classifyField: any = this.getClassifyField(schema.fields);

                    if (classifyField && classifyField.factor) {
                        try {
                            let folder: any = await this.getOnFetchFolder(classifyField)({})
                            classifyField.fieldDict = folder;
                        } catch(e){console.log(e)}
                    }
                    
                    let initStateConfig: any = {
                        schema: schema,
                        uiType: uiType,
                        meta: meta,
                        classifyField: classifyField,
                        path,
                        metaKey: this.getMetaKey(meta),
                        loading: false,
                        reflush: +new Date,
                        noFolder: this.state.noFolder,
                        noHeader: this.state.noHeader,
                        noToolbar: this.state.noToolbar
                    };

                    if (this.props.onInitPage) {
                        this.props.onInitPage(initStateConfig, schema,  this)
                    }

                    initStateConfig.folderField =  
                        initStateConfig.noFolder ? null : this.getFolderField(schema.fields);

                    this.setState(initStateConfig)
                } else {
                    throw new Error(`Component type [${uiType}] does not exist!`);
                }
            }).catch((e) => {
                console.log(e)
                this.setState({loading: false})
            })
        }
    }
    

    public UNSAFE_componentWillUpdate(newProps: any) {

        if (newProps.meta) {
            let newMetaKey: string = this.getMetaKey(newProps.meta || {});

            if (this.state.metaKey != newMetaKey) {
                this.setState({
                    metaKey: newMetaKey,
                    meta: newProps.meta
                })
            }
        }
        
        if (newProps.name != this.state.name) {
            
            this.setState({
                name: newProps.name,
                mode: newProps.mode,
                folderMeta: undefined,
                classifyQuery: undefined
            }, this.fetch)
        }
    }
    private onClassifyChange = (query: any) => {
        
        this.setState({
            classifyQuery: query,
            reflush: +new Date
        })
    }
    private onFolderChange =(query: any, folderMeta: any) => {
        
        this.setState({
            folderQuery: query,
            folderMeta,
            reflush: +new Date
        })
    }
    private getQueryParams = ()=> {
        let { folderQuery, classifyQuery } = this.state;
        let params: any = {};
        
        if (this.state.classifyField && classifyQuery) {
            if (classifyQuery !== 'all') {
                params[this.state.classifyField.fieldKey] = classifyQuery
            }
        }
        if (this.state.folderField && folderQuery) {
            if (folderQuery !== 'all') {
                params[this.state.folderField.fieldKey] = folderQuery;
            }
        }
        return params;
    }
    private onChangeValue =(value: any)=> {
        this.setState({
            value
        })

        if (this.props.onChangeValue) {
            this.props.onChangeValue(value)
        }
    }
    public renderContentView() {
        let ViewComponent: any = PageManger.findComponentByType(this.state.uiType);
        
        return (
            <ViewComponent 
                key={this.state.reflush}
                schema = {this.state.schema}
                meta = {this.state.meta}
                
                triggerMap = {this.props.triggerMap}
                path={this.state.path}
                reflush = {this.state.reflush}
                onGetRequestParams = {this.getQueryParams}

                rowSelection={this.state.rowSelection}
                mode={this.state.mode}
                searchRef= {this.searchRef}
                noOperater= {this.state.noToolbar}
                toolbarRef= {this.toolbarRef}
                onChangeValue={this.onChangeValue}
            />
        )
    }

    public renderRightContent() {
        let { classifyField = {}, meta, folderMeta, folderField } = this.state;
        let classifyMeta: any = {
            label: folderMeta ? folderMeta.label :  folderField ? '-' : meta.title,
            description: folderMeta ? folderMeta.description :  folderField ? '-' : meta.description,
            icon: folderField ? '' : meta.icon
        }
            
        let dictmap: any = [{value: 'all', label: 'All'}];

        classifyField.fieldDict && (dictmap = dictmap.concat(classifyField.fieldDict))

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
                    defaultActiveKey={this.props.defaultClassify}
                >{dictmap.map(dict=> {
                    return <ClassifyPanel.Panel key={dict.value} label={dict.label} value={dict.value}></ClassifyPanel.Panel>
                })}
                </ClassifyPanel>
                {this.renderContentView()}
            </div>
        )
        
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
    public renderContent() {
        let { folderField, meta } = this.state;

        if (folderField && folderField.factor) {
            let folder: any = folderField.meta.folder || {};
            //let tagC = tag.meta.tag;
            
            return (
                <FilterFolder 
                    key={meta.title || meta.icon}
                    title={meta.title as any}
                    icon={meta.icon as any}
                    onFetchCustomFolders= {this.getOnFetchFolder(folderField, 'list')}
                    onAddCustomFolder={this.getOnFetchFolder(folderField, 'create')}
                    onChange={this.onFolderChange}
                    currentKey={this.props.defaultFolder}
                >
                    {this.renderRightContent()}
                </FilterFolder>
            )
        }

        return this.renderRightContent();
    }
    public render() {
        
        return (
            <div className='ui-smartpage-wrapper'>
                <Spin spinning={this.state.loading}>
                    {this.state.uiType ? this.renderContent() : <Empty/>}
                </Spin>
            </div>
        )
    }
}
