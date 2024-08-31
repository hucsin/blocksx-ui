/**
 * 支持 
 * box
 * notice
 * former，
 * 
 */

import React from 'react';
import { utils } from '@blocksx/core'


import { Typography, Button, Space, Tooltip } from "antd";
import Manger from '../../core/SmartPageManger';
import * as FormerTypes from '../../../Former/types';
import SmartRequst from '../../../utils/SmartRequest';
import TableUtils from '../../../utils/tool';
import Util from '../../../utils';
import ArticleContent from './content';
import Box from '../../../Box';
import Former from '../../../Former';
import SmartPage, {WithRouterSmartPage} from '../../index';

import { pick } from 'lodash'

import './style.scss';

interface SmartPageActicleProps {
    schema: any,
    viewer?: boolean;
    pageMeta?: any,
    title?: string;
    icon?: string;
    path?: string;
    value?: any;
    size?: any;
    onRowAction?: Function;

    dataSource?: any;
}

interface SmartPageActicleState {
    title?: string;
    summary?: string;
    icon?: string;
    value: any;
    loading?: boolean;
    dataSource: any;
    optional?: any;
    createdAt?: boolean;
}

export default class SmartPageArticle extends React.Component<SmartPageActicleProps, SmartPageActicleState> {
    public static defaultProps = {
        size: 'default'
    }
    public requestMap: any;
    public operateContainerRef: any
    public constructor(props: SmartPageActicleProps) {
        super(props);
        let {pageMeta = {}} = props;
        this.state = {
            loading: false,
            value: props.value || {},
            dataSource: props.dataSource,
            title: props.title,
            optional: pageMeta ? pageMeta.optional : null,
            createdAt: pageMeta && pageMeta.optional ? utils.isUndefined(pageMeta.optional.createdAt) ? true : pageMeta.optional.createdAt : true

        }
        this.requestMap = {};
        this.operateContainerRef = React.createRef()
    }

    public componentDidMount(): void {
        let { optional  } = this.state;

        if (optional) {
            if (optional.URI) {
                for(let pro in optional.URI) {
                    this.createRequst(pro, optional.URI[pro])
                }
            }

            if (optional.type) {
                this.initDefaultDataSource()
            }
        }
        
        if (this.findRequst('record.init')) {
            this.setState({
                loading: true
            })
            
            this.findRequst('record.init')({
                ...pick(this.state.value, ['id'])
            }).then(result=> {
                let stateValue: any = {
                    loading: false
                }

                if (result.value) {
                    stateValue.value = Object.assign({}, this.state.value, result.value)
                }

                if (result.schema || result.dataSource) {
                    stateValue.dataSource = result.schema || result.dataSource;
                }

                this.setState(stateValue, ()=> {
                    !this.state.dataSource && this.initDefaultDataSource();
                })
            }).catch(e=>{})
        }

        

    }
    // TODO 先写死，后续加上SLOT
    private initDefaultDataSource() {
        let { value = {}, optional } = this.state;
        let datasource: any = [];

        if (optional && optional.type) {
            let { schema = {}, params = {}} = optional;
            switch(optional.type) {
                case 'smartpage':
                    datasource.push({
                        type: 'smartpage',
                        params: params,
                        path: schema.path || (this.props.path + '/' + (optional.URI && optional.URI['record.schema'] || 'pageschema')),
                        name: schema.name ||value.id // TODO
                    })
                    break;
            }
        } else {
            // schema
            if (['markdown', 'text', 'richtext'].indexOf(value.contentType) == -1) {
                datasource.push({
                    type: 'notice',
                    notice: value.summary || value.content
                })
                // 添加scheam
                datasource.push({
                    type: value.contentType,
                    schema: value.schema,
                    value: value.playload,
                    okText: (value.schema || {}).okText,
                    okIcon: (value.schema ||{}).okIcon
                })
            } else {
                datasource.push({
                    type: 'content',
                    contentType: value.contentType,
                    summary: value.summary,
                    content: value.content,
                    template: value.template,
                    playload: value.playload || value
                })
            }
        }
        this.setState({
            dataSource: datasource
        })
    }
    private findRequst(mode: string) {
        return this.requestMap[mode];
    }
    private createRequst(mode: string, path:string) {
        if (!this.requestMap[mode]) {
            this.requestMap[mode] = SmartRequst.makePostRequest(this.props.path +'/' + path)
        }
    }

    private filterFields(place: string) {
        let { fields = []} = this.props.schema;
        
        return fields.filter((it) => {
            return it.meta &&(it.meta.slot === place || it.meta.place === place)
        })
    }
    private renderByPlace(place: string) {
        let { value = {}} = this.state;
        let { pageMeta ={} } = this.props;
        

        let title: any = this.filterFields(place);
        
        
        return title.map((it, index) => {

            let trueValue: any = value[it.fieldKey];

            if (place == 'avatar') {
                // 先看pageMEta
                if (pageMeta.icon || this.state.icon) {
                    return (
                        <FormerTypes.avatar autoColor={false}  key={'a'+index} icon={pageMeta.icon|| this.state.icon} />
                    )
                } else if (it.dict) {
                    let matchitem: any = it.dict.find(it=> it.value == trueValue);
                    if (matchitem) {
                        return (
                            <FormerTypes.avatar autoColor={false}  key={'a'+index} icon={matchitem.icon} />
                        )
                    }
                } 

            } else {
                return (
                    <span key={index}>
                        {it.icon && TableUtils.renderIconComponent(it)}
                        {trueValue}
                    </span>
                )
            }
        })
    }
    private onRowAction(operate: any, rowdata: any) {
        if (this.props.onRowAction) {
            this.props.onRowAction(operate, rowdata)
        }
    }
    private renderButtons = ()=> {
        let { pageMeta ={} } = this.props;
        let rowoperate: any = pageMeta.rowoperate;

        if (rowoperate) {
            rowoperate = rowoperate.filter(it => {
                return !it.disabled && (!it.place || it.place != 'list')
            })
            
            if (rowoperate.length) {
                return (
                    <>
                    <span ref={this.operateContainerRef}></span>
                    <Space.Compact size={this.props.size} block >
                        {rowoperate.map((op, index)=>{
                            return (
                                <Button onClick={()=>this.onRowAction(op, this.state.value)} key={index} icon={op.icon && TableUtils.renderIconComponent(op)}>{op.name}</Button>
                            )
                        })}
                    </Space.Compact>
                    </>
                )
            }
        }

    }
    private renderTitle() {
        let { value = {} } = this.state;
        
        return (
            <div className='ui-smartpage-article-title'>
                <Typography.Title level={3}>{this.renderByPlace('avatar')}{this.state.title || this.renderByPlace('title')}</Typography.Title>
                <div className='ui-smartpage-article-des'>
                    {this.state.summary || this.renderByPlace('summary')}
                    {this.state.createdAt && value.createdAt && 
                        <Tooltip title={'Created: ' + Util.formatDate( value.createdAt, 'YYYY/MM/DD HH:mm:ss ddd')}>
                            <span className='ui-sp-des-ct'>{Util.formatDate( value.createdAt)}</span>
                        </Tooltip>}
                </div>
                <div className='ui-smartpage-article-toolbar'>
                    
                    {this.renderButtons()}
                </div>
            </div>
        )
    }
    private renderItemContent =(item: any, index)=> {
        switch (item.type) {
            case 'smartpage':
                    return (
                        <WithRouterSmartPage 
                            key={index}
                            pageURI={item.path}
                            name={item.name}
                            noFolder={true}
                            noHeader={true}
                            noClassify={true}
                            noTitle={true}
                            noToolbar={false}
                            rowSelection={true}
                            noSearcher={true}
                            size={'small'}
                            operateContainerRef={this.operateContainerRef}
                            onGetDependentParameters={()=> {
                                let { value} = this.state;
                                return item.params ? utils.pick(value, Object.keys(item.params)) : {}
                            }}
                            onInitPage={(data)=> {
                                
                                let {pageMeta = {}} = data;
                                this.setState({
                                    title: pageMeta.title,
                                    summary: pageMeta.summary,
                                    icon: pageMeta.icon
                                })
                            }}
                        />
                    )
            case 'content':
                return (
                    <ArticleContent key={index} {...item} type={item.contentType}  />
                )
            case 'former':
                return (
                    <Former 
                        key={index}
                        schema={item.schema} 
                        value={item.value}
                        viewer={item.viewer}
                        onChangeValue={() => {}}
                        size={this.props.size}
                        onlyButton={true}
                        okText={item.okText || 'Save'}
                        okIcon={item.okIcon || ''}
                        operateContainerRef={this.operateContainerRef}
                        onSave={()=>{
                            console.log(333)
                        }}
                    />
                )
            case 'box':
                
                return <Box key={index}  dataSource={item.dataSource} />
            case 'notice':
                return <FormerTypes.notice key={index} value={item.notice} />
                
        }
    }
    private renderContent() {
        let { dataSource = []} = this.state;

        return dataSource.map(this.renderItemContent)
    }
    public render() {
        return (
            <div className='ui-smartpage-article'>
                {this.renderTitle()}
                <div className='ui-smartpage-article-content'>
                    {this.renderContent()}
                </div>
            </div>
        )
    }
}


Manger.registoryComponent('article', SmartPageArticle);
