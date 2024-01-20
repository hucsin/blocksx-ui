/**
 * 自动布局页面
 */
import React from 'react';
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
    router: any;
    name: string; // 页面的一个唯一ID
    meta?: PageMeta;

    defaultFolder?: string;
    defaultClassify?: string;

    pageURI: string;

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
    routerParams: any;
    routerKey: string;
    classifyQuery?: string;
    
    folderQuery?: string;
    folderMeta?: any;

    classifyField?: any;
    folderField?: any;
}

export default class SmartPage extends React.Component<SmartPageProps, SmartPageState> {

    public static defaultProps = {
        pageURI: '/api/smartpage/find'
    }
    public static manger: any = PageManger;

    private requestHelper: any;
    private searchRef: any;
    private toolbarRef: any;
    private onFetchTags: any;

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
            routerParams: {},
            reflush: 0,
            routerKey: props.router.routerKey
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
            }).then((data) => {
                let { schema = {}, uiType, path } = data;
                
                if (PageManger.has(uiType)) {
                    let meta: PageMeta = schema.meta || this.props.meta || {};
                    let cache: any; 
                    this.setState({
                        schema: schema,
                        uiType: uiType,
                        meta: meta,
                        folderField: this.getFolderField(schema.fields),
                        classifyField: this.getClassifyField(schema.fields),
                        path,
                        metaKey: this.getMetaKey(meta),
                        loading: false
                    })
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
        console.log(query, folderMeta, 222)
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
    public renderContentView() {
        let ViewComponent: any = PageManger.findComponentByType(this.state.uiType);
        
        return (
            <ViewComponent 
                schema = {this.state.schema}
                meta = {this.state.meta}
                
                triggerMap = {this.props.triggerMap}
                path={this.state.path}
                reflush = {this.state.reflush}
                onGetRequestParams = {this.getQueryParams}

                searchRef= {this.searchRef}
                toolbarRef= {this.toolbarRef}
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
            <div className='ui-classify-wrapper'>
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
    private getOnFetchFolder(folderField: any): any {
        
        if ( this.onFetchTags) {
            return this.onFetchTags;
        }
        return this.onFetchTags = SmartRequest.createPOST(folderField.factor.path + '/' + folderField.factor.type)
    }
    public renderContent() {
        let { folderField, meta } = this.state;
        if (folderField) {
            let folder: any = folderField.meta.folder || {};
            //let tagC = tag.meta.tag;
            
            return (
                <FilterFolder 
                    title={meta.title as any}
                    icon={meta.icon as any}
                    onFetchCustomFolders= {this.getOnFetchFolder(folderField)}
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
