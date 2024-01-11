/**
 * 自动布局页面
 */
import React from 'react';
import classnames from 'classnames';
import { Spin, Empty } from 'antd';
import './types'

import PageManger from './Manger';
import SmartRequest from '../utils/SmartRequest';


import './style.scss';


export interface PageMeta {
    title?: string;
    description?: string;
    icon?: string;
}


export interface SmartPageProps {
    router: any;
    name: string; // 页面的一个唯一ID
    meta?: PageMeta;
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
    routerParams: any;
    routerKey: string;
}

export default class SmartPage extends React.Component<SmartPageProps, SmartPageState> {

    public static defaultProps = {
        pageURI: '/api/smartpage/find'
    }
    public static manger: any = PageManger;

    private requestHelper: any;
    private router: any;

    public constructor(props: SmartPageProps) {
        super(props)

        this.state = {
            loading: false,
            schema: null,
            meta: {},
            metaKey: '',
            uiType: '',
            path: '',
            routerParams: {},
            reflush: 0,
            routerKey: props.router.routerKey
        }

        this.requestHelper = SmartRequest.createPOST(props.pageURI, true);

        this.router = props.router;
    }
    private getMetaKey(meta: PageMeta) {
        return [meta.title, meta.description, meta.icon].join('-')
    }
    public componentDidMount() {

        this.setState({loading: true});

        this.requestHelper({
            page: this.props.name
        }).then((data) => {
            let { schema = {}, uiType, path } = data;
            
            if (PageManger.has(uiType)) {
                let meta: PageMeta = schema.meta || this.props.meta || {};
                this.setState({
                    schema: schema,
                    uiType: uiType,
                    meta: meta,
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

    public UNSAFE_componentWillUpdate(newProps: any) {

        if (newProps.meta) {
            let newMetaKey: string = this.getMetaKey(newProps.meta || {});

            if (this.state.metaKey != newMetaKey) {
                this.setState({
                    metaKey: newMetaKey,
                    meta: newProps.meta,
                    reflush: +new Date()
                })
            }
        }
    }
    public renderChildren() {
        let ViewComponent: any = PageManger.findComponentByType(this.state.uiType);
        
        return (
            <ViewComponent 
                schema = {this.state.schema}
                meta = {this.state.meta}
                
                triggerMap = {this.props.triggerMap}
                path={this.state.path}
                reflush = {this.state.reflush}
                routerParams = {this.state.routerParams}
            />
        )
    }

    public render() {
        
        return (
            <div className='ui-smartpage-wrapper'>
                <Spin spinning={this.state.loading}>
                    {this.state.uiType ? this.renderChildren() : <Empty/>}
                </Spin>
            </div>
        )
    }
}
