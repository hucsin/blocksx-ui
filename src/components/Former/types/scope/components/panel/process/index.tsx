import React from 'react';
import classnames from 'classnames';
import { StructuralMiniFlow } from '@blocksx/structural';
import { utils } from '@blocksx/core';
import { Tooltip, Tree, Spin, Tabs, Space } from 'antd'
import { upperFirst } from 'lodash'
import { GlobalScope, MiniFlow, SmartRequest, ThinkingNodeManager } from '@blocksx/ui';
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
    connectors:any;
    total: number;
    dataType: any;
    disabled?:boolean;
    value?: any;
    selectedKeypath?: string;
}

interface PanelProcessProps {
    onClick: Function, total: number;
    dataType: any;
    disabled?:boolean;
    value?: any;
    iterator?: boolean;

    strict?: boolean;
}

export default class PanelProcess extends React.Component<PanelProcessProps, PanelProcessState> {
    private cavnasId: string;
    private miniFlow: any;
    private treeData: any;
    //private defaultExpandedKeys;
    private cacheTree: any ;
    //private fetchHelper: any = SmartRequest.makeGetRequest('/api/thinking/findOutput');
    public constructor(props: any) {
        super(props);
        
        let flow: MiniFlow = GlobalScope.getContext(GlobalScope.TYPES.CURRENTFLOW_CONTEXT);
        let currentNode: any = GlobalScope.getScope(GlobalScope.TYPES.CURRENTFLOW_NODE)
        
        let flowMap: any = flow.findAncestralFlowMap(currentNode.value);

        this.cavnasId = '#flow'+ new Date().getTime() +'#';
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
            expandedKeys: {},
            page: StructuralMiniFlow.getComponentName(selected),
            schema: {},
            treeData: [],
            loading: false,
            total: props.total,
            dataType: props.dataType,
            disabled: props.disabled,
            selectedKeypath: this.getSelectedKeyPath(props.value)
        }
    }
    private getCurrentPage(node: any):any {
        
        return StructuralMiniFlow.getComponentName(node)
    }
    private resetTreeData = (schema?: any, cache?: boolean) => {
        
        this.setState({
            treeData: this.treeData = this.getTreeData(schema || this.state.schema),
          //  expandedKeys: this.defaultExpandedKeys
        }, () => {

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
            it.originalName = it.name;
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
    public UNSAFE_componentWillReceiveProps(nextProps: Readonly<PanelProcessProps>, nextContext: any): void {
        
        if (nextProps.total != this.state.total ) {
            
            this.setState({
                total: nextProps.total
            }, () => this.fetchOutputSchema(this.state.page))
        }
        if (nextProps.disabled != this.state.disabled ) {
            this.setState({
                disabled: nextProps.disabled
            })
        }

        if (nextProps.dataType != this.state.dataType) {
            this.setState({
                dataType: nextProps.dataType
            })
        }
        if (nextProps.value != this.state.value) {
            this.setState({
                value: nextProps.value,
                selectedKeypath: this.getSelectedKeyPath(nextProps.value)
            })
        }
    }

    public componentWillUnmount() {
        
        this.miniFlow && this.miniFlow.destory();
    }
    private getSelectedKeyPath(value:any) {
        if (Array.isArray(value) && value[0]) {
            return value[0].value;
        }
        return '';
    }
    private fetchOutputSchema(name: string) {
        
        if (this.cacheTree[name]) {
            return this.setState({
                ...this.cacheTree[name]
            }, this.resetTreeData)
        }
        this.setState({loading: true})

        let outputschema: any = ThinkingNodeManager.getOutputSchema(
            name, 
            this.getTrueNodeId(this.state.selected.name)
        );

        if (utils.isPromise(outputschema)) {
            return outputschema.then((result)=> {
                this.resetSchema(name, result, false)
            })
        } else {
            if (utils.isPlainObject(outputschema)) {
                return this.resetSchema(name, outputschema, false)
            }
        }
    }
    private getExpandedKeys(treeData: any) {

        let expandedKeys: any = [];
        treeData.forEach(it => {
            expandedKeys.push(it.key);
            it.children && it.children.forEach(it => {
                expandedKeys.push(it.key)
            })
        })
        
        return expandedKeys;
    }
    private resetSchema(name, result: any, cache: boolean = true) {
        
        this.setState({
            loading: false,
            schema:result
        }, () => {
            this.miniFlow && this.initMiniFlow();
        })

        this.resetTreeData(result, cache)

        cache && (this.cacheTree[name] = {
            ...this.cacheTree[name],
            schema: result,
            treeData: this.treeData
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
    private matchDataType (type: string, subtype?: string) {
        let { dataType } = this.state;
        let trueType: string = subtype ? [upperFirst(type), upperFirst(subtype)].join('') : upperFirst(type)
        
        
        if (dataType) {
            if (!Array.isArray(dataType)) {
                dataType = [dataType]
            }
            // 如果是ANY
            
            if (dataType.includes('Any')) {
                return false;
            }

            return !dataType.includes(upperFirst(trueType))
        }

        return false;
    }
    private getChildren(schema: any, rootPath: any[] = []) {
        let pathname: any = schema.name ? [...rootPath, schema.name].join('.') : rootPath;
        
        let treedata: any = {
            key: pathname,
            
            ...schema,
            title: schema.name,
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
        
        return {
            ...treedata,
            disabled: this.state.selectedKeypath == pathname ? false : this.state.disabled || this.matchDataType(schema.type, treedata.subtype)
        };
    }
    public getTreeData(schema: any) {
        //this.defaultExpandedKeys = [];
        if (Array.isArray(schema)) {
            return schema.map((it, index) => {
                if (!this.props.iterator && it.iterator && schema.length > 1) {
                    return false;
                }
                return [this.getChildren({
                    ...it, 
                    name: it.name || (it.iterator && this.props.iterator ? '$iterator.outputs' :'outputs')
                })]
            }).filter(Boolean)
        }
        return [this.getChildren({...schema, name: 'outputs'})]
    }
    public getTrueNodeId(id: string) {
        return id.replace(this.cavnasId, '');
    }

    public renderTree(index: number = 0) {
        let { selected ={}, starts = [], treeData,schema, expandedKeys ={} } = this.state;
        let mapheight: number = starts.length ==1 ? 56 : 40 + starts.length * 40;
        
        let treeDisplay: any = Array.isArray(schema) ? treeData[index] : treeData;
        let treeExpandedKeys: any = expandedKeys[index] || this.getExpandedKeys(treeDisplay);
        
        let currentSource: string = treeDisplay[0] ? treeDisplay[0].source : selected.originalName;
        
        return (<Tree
            multiple
            blockNode
            disabled={this.state.disabled}
            onSelect={(item:any, info: any)=> {
                let pop: any = item.pop();
//                let 
                console.log(pop, selected,333, info)
                pop && this.props.onClick(
                    pop.replace(/\.\./,'.'), 
                    ['$flow', selected.originalName].join('.'),
                    { ...info, source: selected.originalName !== currentSource ?  currentSource : '' }
                )
            }}
            selectedKeys={!this.props.strict ? undefined : this.state.selectedKeypath ? [this.state.selectedKeypath as string] : undefined}
            key={[this.state.page, index].join('_')}
            expandedKeys ={treeExpandedKeys}
            autoExpandParent={false}
            onExpand={(ekeys, a) => {
                expandedKeys[index] = ekeys;

                this.setState({
                    expandedKeys: expandedKeys
                })
            }}
            treeData={treeDisplay}
            style={{
                height: `calc( 100vh - ${mapheight + 300}px)`
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
        />)
    }
    public renderTreeBody() {
        let { treeData, schema, selected={} } = this.state;

        if (Array.isArray(schema)) {
            return (
                <Tabs
                    size='small'
                    items = {treeData.map((it, index) => {
                        let item: any = it[0];
                        let showSource: boolean = item.source ? item.source !== selected.originalName : false;
                        
                        return {
                            key:item.description || item.name,
                            label: (
                                <Space>
                                    <Tooltip title={item.iterator ? `Automatically call the ‘${item.description|| item.name}’ API to retrieve details when iterating over the results.` : "Retrieve data returned by the API."}>
                                        {item.description || item.name} {item.iterator && this.props.iterator ? '(iterator)' : ''}
                                    </Tooltip>

                                    {showSource && <Tooltip title="The raw data is passed in from this node.">
                                        <span className='number'>{item.source}</span>
                                    </Tooltip>}
                                </Space>
                            ),
                            children: this.renderTree(index)
                        }
                    }).filter(Boolean)}
                >
                </Tabs>
            )
        }

        return this.renderTree()
    }
    public render () {
        let { selected ={}, starts = [], schema } = this.state;
        
        let { program, method, description } = (selected.props || {});
        let mapheight: number = starts.length ==1 ? 56 : 40 + starts.length * 40;
        
        return (
            <div className='ui-scope-process'>
                <h4><span>Process segment</span><span>Select process node outputs data</span></h4>
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
                                            }, ()=> this.fetchOutputSchema(this.getCurrentPage(it)))
                                        }
                                    }}
                                />
                            )
                        })}
                    </div>
                </div>
                </div>
                <div className='ui-scope-tree'>
                    <h4><Tooltip title={description}>  <span className='number'>{selected.originalName}</span> <span>{method}</span> </Tooltip> <span>Outputs data</span></h4>
                    <Spin spinning={this.state.loading}>
                        <div className={classnames({
                            'ant-tree-wrapper': true,
                            'ant-tree-tabs': Array.isArray(schema)
                        })}>
                            {this.renderTreeBody()}
                        </div>
                    </Spin>

                </div>
            </div>
        )
    }
}