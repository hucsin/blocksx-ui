import React from 'react';
import { Spin } from 'antd';
import classnames from 'classnames';
import Notice from '../Former/types/notice';

import withRouter, { routerParams } from '../utils/withRouter';
import ClassifyPanel from '../ClassifyPanel';
import SmartPageUtil from './core/utils';
import CleanseSchema from './core/CleanseSchema';

/**
 * 
 */

interface SmartPageGroupProps {
    pageURI: string;
    name: string;
    group?: any[],
    title?: string;
    description?: string;
}
interface SmartPageGroupState {
    group?: any[];
    title?: string;
    description?: string;
    current?: any;
    optionalOpen: any;
    icon?: string;
}

export default class SmartPageGroup extends React.Component<SmartPageGroupProps, SmartPageGroupState > {
    public static defaultProps = {
        pageURI: '/eos/smartpage/group'
    }

    private toolbarRef: any;
    private searchRef: any;
    private optionalContainerRef: any;

    public constructor(props: SmartPageGroupProps) {
        super(props);


        this.state = {
            title: props.title,
            optionalOpen: {}
        }

        this.toolbarRef = React.createRef();
        this.searchRef = React.createRef();
        this.optionalContainerRef = React.createRef();
    }


    public  componentDidMount(): void {
        SmartPageUtil.getRequestHelper(this.props.pageURI)({
            page: this.props.name
        }).then(data=> {
            let groupList: any = this.filterGroup(data.group || []);
            
            this.setState({
                group: groupList,
                title: data.title,
                icon: data.icon,
                description: data.description,
                current: groupList[0]
            })
        })
    }

    public filterGroup(group: any) {

        return group.map(it => {
            let { schema = {}} = it;
            let { meta = {} } = schema;
            let pageMeta: any = meta || schema.pageMeta || schema.PageMeta;

            if (Array.isArray( schema.fields)) {
                schema.fields =  CleanseSchema.getFieldProps(it.path, schema.fields);
            } else {
                schema.fields = [];
            }
            return {
                ...it,
                ...pageMeta,
                schema,
                //icon: meta.icon,
                name: meta.title,
                //title: meta.title,
                pageMeta: pageMeta,
                toolbarContainerRef: React.createRef(),
                searcherContainerRef: React.createRef(),
                optionalContainerRef: React.createRef()
                //path: it.path,
                //uiType: it.
            }
        })
    }
    private onSwitchItem(currentKey: string) {
        let { group = []} = this.state;
        
        this.setState({
            current: group.find(it => it.name == currentKey)
        })
    }
    public render() {
        let { group, current } = this.state;
        return (
            <Spin spinning={!this.state.group}>
                <div className={classnames({
                    'ui-smartpage-group': true, 
                    'ui-classify-wrapper': true
                })}>
                    {group && group.length && <ClassifyPanel
                            key={111}
                            title = {this.state.title as string}
                            description = {current.description || this.state.description}
                            icon = {this.state.icon}
                            
                            onChange={(v)=> {
                                this.onSwitchItem(v);
                            }}
                            defaultActiveKey={current.name}
                            
                        >{group.map((dict, index)=> {
                            
                            return (
                                
                                <ClassifyPanel.Panel icon={dict.icon} key={dict.name} label={dict.title} value={dict.title}>
                                <div className={classnames({
                                    'ui-classify-group-wrapper': true,
                                    'ui-classify-optional-mode': this.state.optionalOpen[current.name]
                                })}>
                                    <span className='ui-searchbar-ref' ref={dict.searcherContainerRef}></span>
                                    <span className='ui-toolbar-ref' ref={dict.toolbarContainerRef}></span>
                                   
                                    <div className='ui-classify-content-wrapper'>
                                        <div className='ui-classify-content-left'>
                                            {SmartPageUtil.renderPageType(dict.uiType, {
                                                ...dict,
                                                notice: {
                                                    notice: dict.notice,
                                                    icon: dict.icon
                                                },
                                                toolbarRef: dict.toolbarContainerRef,
                                                optionalContainerRef: dict.optionalContainerRef,
                                                searchRef: dict.searcherContainerRef,
                                                onOptionalOpen:(isClose?:boolean)=>{
                                                    let { optionalOpen = {} } = this.state;
                                                    optionalOpen[dict.name] = !isClose ? dict.name : false
                                                    
                                                    this.setState({
                                                        optionalOpen
                                                    })
                                                }
                                            })}
                                        </div>
                                        
                                        <div className='ui-classify-content-right' key={dict.name} ref={dict.optionalContainerRef}></div>
                                    </div>
                                </div>        
                                </ClassifyPanel.Panel>
                                
                            )
                        })}
                    </ClassifyPanel>}
                </div>
            </Spin>
        )
    }
}

export const WithRouterSmartPageGroup  = withRouter(SmartPageGroup)