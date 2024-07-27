import React from 'react';
import { utils } from '@blocksx/core';
import { Tooltip, Tree, Spin } from 'antd'
import { upperFirst } from 'lodash'
import { GlobalScope, MiniFlow, SmartRequest } from '@blocksx/ui';
import ProcessNode from './node';

import './style.scss'

interface PanelProcessState {
    page: string;
    loading: boolean;
    treeData: any, 
    expandedKeys: any, 
    schema: any,
    selected: any;
    current:string, 
    starts:any, 
    currentType: string;
    nodes: any[],
    connectors:any
}

export default class PanelProcess extends React.Component<{onClick: Function}, PanelProcessState> {
    private cavnasId: string;
    private miniFlow: any;
    private defaultExpandedKeys;
    private cacheTree: any ;
    private fetchHelper: any = SmartRequest.createPOST('/api/thinking/findOutput');
    public constructor(props: any) {
        super(props);
        let flow: MiniFlow = GlobalScope.getContext(GlobalScope.TYPES.CURRENTFLOW_CONTEXT);
        let currentNode: any = GlobalScope.getScope(GlobalScope.TYPES.CURRENTFLOW_NODE);
        let flowMap: any = flow.findAncestralFlowMap(currentNode.value);

        this.cavnasId = 'flow'+ new Date().getTime() +'flow';

        let nodes: any = this.fixedName(utils.copy(flowMap.nodes || []), currentNode);
        let selected: any = (nodes.find(it=> !it.disabeld) || {})

        this.cacheTree = {};
        this.state = {
            nodes: nodes,
            connectors: this.fixedName(utils.copy(flowMap.connectors || [])),
            starts: nodes.filter(it=> it.type =='go'),
            currentType: currentNode.type,
            current: this.cavnasId + currentNode.value,
            selected: selected,
            expandedKeys: [],
            page: this.getCurrentPage(selected),
            schema: {},
            treeData: [],
            loading: false
        }
    }
    private getCurrentPage({componentName , props ={}}: any):any {
        return componentName || props.componentName;
    }
    private resetTreeData() {
        this.setState({
            treeData: this.getTreeData(this.state.schema),
            expandedKeys: this.defaultExpandedKeys
        })
    }
    private fixedName(info: any, currentNode?: any) {
        return info.map(it=> {
            
            if (!currentNode) {
                it.source = this.cavnasId + it.source;
                it.target = this.cavnasId + it.target;
            } else {
                if (currentNode.value == it.name && currentNode.type =='node') {
                    it.color = '#ccc';
                    it.disabeld = true;
                    if (it.props) {
                        it.props.color = it.color;
                    }
                }
            }
            it.name = this.cavnasId + it.name;

            return it;
        })
    }
    public  componentDidMount(): void {
        //this.resetTreeData();
       setTimeout(()=> {
            this.initMiniFlow();
       },0)
       // 拉取
       this.fetchOutputSchema(this.state.page);

    }
    public  componentWillUnmount() {
        this.miniFlow.destory();
    }
    private fetchOutputSchema(name: string) {

        if (this.cacheTree[name]) {
            return this.setState({
                schema: this.cacheTree[name]
            }, this.resetTreeData)
        }
        this.setState({loading: true})

        this.fetchHelper({
            page: name
        }).then(result => {
            this.setState({
                loading: false,
                schema: this.cacheTree[name] = result
            }, this.resetTreeData)
        })
    }
    private initMiniFlow() {
        this.miniFlow = new MiniFlow({
            uniq: new Date().getTime() +'',
            canvas: this.cavnasId,
            isViewer: true,
            draggableMode: false,
            size: 80,
            small: true,
            nodes: this.state.nodes,
            connector: this.state.connectors, 
            onChangeValue: ({nodes})=> {
                this.setState({
                    nodes
                })
            }
        });
        setTimeout(()=> {
            this.miniFlow.doFormatNodeCanvas();
        },0)
        
    }
    private getChildren(schema: any, rootPath: any[] = []) {
        let pathname: any = schema.name ? [...rootPath, schema.name].join('.') : rootPath;
        let treedata: any = {
            key: pathname,
            title: schema.name,
            ...schema
        }
        switch(schema.type) {
            case 'object':
                treedata.children = Object.keys(schema.properties).map(it => {
                    let item = schema.properties[it];
                    item.name = it;
                    return this.getChildren(item, [...rootPath, schema.name])
                })
                break;
            case 'array':
                ///schema.items.name = '[]'
                //schema.items.disabled = true;
                treedata.subtype = schema.items.type;
                
                if (treedata.subtype =='object') {
                    treedata.properties = schema.items.properties;
                } else {
                    treedata.properties = {
                        '[]': schema.items
                    }
                }
                
                treedata.children = this.getChildren({...treedata, type: 'object', name: treedata.subtype =='object' ? '[]' :''}, pathname.split('.')).children
                break;
            default:
                break;
        }

        if (rootPath.length < 2) {
            this.defaultExpandedKeys.push(treedata.key)
        }
        
        return treedata;
    }
    public getTreeData(schema: any) {
        this.defaultExpandedKeys = [];
        return [this.getChildren({...schema, name: 'returns'})]
    }
    public render () {
        let { selected ={}, starts = [] } = this.state;
        let { program, method, description } = selected.props;
        let mapheight: number = starts.length ==1 ? 56 : 40 + starts.length * 40;
        

        return (
            <div className='ui-scope-process'>
                <h4><span>Process segment</span><span>Select process node returns data</span></h4>
                <div className='ui-scope-process-wrapper'>
                <div 
                    className='ui-scope-process-map' data-draggable
                    
                    style={{
                        height: mapheight
                    }}
                >
                    <div className='ui-scope-process-inner' id={this.cavnasId}>
                        {this.state.nodes.map(it => {
                            return (
                                <ProcessNode 
                                    {...it} 
                                    selected={it.name == selected.name}
                                    disabled={it.name == this.state.current && this.state.currentType == 'node'}
                                    onClick={()=> {
                                        if (!this.state.loading && it.name != selected.name) {
                                            
                                            this.setState({
                                                selected: it,
                                                page: this.getCurrentPage(it)
                                            })
                                            this.fetchOutputSchema(this.getCurrentPage(it))
                                        }
                                    }}
                                />
                            )
                        })}
                    </div>
                </div>
                </div>
                <div className='ui-scope-tree'>
                    <h4><Tooltip title={description}> <span>{method}</span> <span className='number'>{selected.serial}</span> </Tooltip> <span>Returns data</span></h4>
                    <Spin spinning={this.state.loading}>
                        <Tree
                            blockNode
                            onSelect={(item:any)=> {
                                item[0] && this.props.onClick(item[0].toLowerCase().replace(/\.\./,'.'), ['$flow',selected.name.replace(this.cavnasId,'')].join('.'))
                            }}
                            key={this.state.page}
                            expandedKeys ={this.state.expandedKeys}
                            autoExpandParent={false}
                            onExpand={(expandedKeys, a) => {
                                console.log(this.state.treeData, expandedKeys,a,2232)
                                this.setState({expandedKeys})
                            }}
                            treeData={this.state.treeData}
                            style={{
                                maxHeight: `calc( 100vh - ${mapheight + 360}px)`
                            }}
                            titleRender={(item: any)=> {
                                return (
                                    <>
                                        {item.title}
                                        {item.type && <span className='u-type'>{'<'+ upperFirst(item.type) + (item.subtype ? upperFirst(item.subtype): '') +'>'}</span>}
                                        {item.description && <span className='u-description'>{item.description}</span>}
                                    </>
                                )
                            }}
                        />
                    </Spin>

                </div>
            </div>
        )
    }
}