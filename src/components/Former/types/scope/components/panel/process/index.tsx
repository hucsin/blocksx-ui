import React from 'react';
import { utils } from '@blocksx/core';
import { Tooltip, Tree } from 'antd'
import { upperFirst } from 'lodash'
import { FormerTypes, GlobalScope, MiniFlow } from '@blocksx/ui';
import ProcessNode from './node';

import Notice from '../../../../notice';
import './style.scss'


export default class PanelProcess extends React.Component<{onClick: Function}, {treeData: any, expandedKeys: any, schema: any,selected: any;current:string, starts:any, currentType: string;nodes: any[],connectors:any}> {
    private cavnasId: string;
    private miniFlow: any;
    private defaultExpandedKeys;
    public constructor(props: any) {
        super(props);
        let flow: MiniFlow = GlobalScope.getContext(GlobalScope.TYPES.CURRENTFLOW_CONTEXT);
        let currentNode: any = GlobalScope.getScope(GlobalScope.TYPES.CURRENTFLOW_NODE);
        let flowMap: any = flow.findAncestralFlowMap(currentNode.value);

        this.cavnasId = 'flow'+ new Date().getTime() +'flow';

        let nodes: any = this.fixedName(utils.copy(flowMap.nodes || []), currentNode)

        this.state = {
            nodes: nodes,
            connectors: this.fixedName(utils.copy(flowMap.connectors || [])),
            starts: nodes.filter(it=> it.type =='go'),
            currentType: currentNode.type,
            current: 'rest'+currentNode.value,
            selected: (nodes.find(it=> !it.disabeld) || {}),
            expandedKeys: [],

            schema: {
                type: 'object',
                name: 'Result',
                properties: {
                    "code": {
                        type: "string",
                        description: "result code"
                    },
                    "message": {
                        type: 'string',
                        description: 'error message'
                    },
                    "result": {
                        type: 'array',
                        description: "result list",
                        items: {
                            type: 'object',
                            properties: {
                                id: {
                                    type: 'number'
                                },
                                name: {
                                    type: 'string',
                                    description: "the user name"
                                },
                                age: {
                                    type: 'string',
                                    description: 'the user age'
                                },
                                classroom: {
                                    type: 'object',
                                    properties: {
                                        roomnumber: {
                                            type: 'number',
                                            description: 'room number'
                                        },
                                        name: {
                                            type: 'string',
                                            description: "the user name"
                                        },
                                        user: {
                                            type: 'number',
                                            description: 'describe number'
                                        },
                                        describe: {
                                            type: 'string',
                                            description: "the user describe"
                                        },
                                    }
                                },
                                namee: {
                                    type: 'string',
                                    description: "the user name"
                                },
                                agea: {
                                    type: 'string',
                                    description: 'the user age'
                                },
                                ret: {
                                    type: 'array',
                                    description: "result list",
                                    items: {
                                        type: 'object',
                                        properties: {
                                            id: {
                                                type: 'number'
                                            },
                                            name: {
                                                type: 'string',
                                                description: "the user name"
                                            },
                                            age: {
                                                type: 'string',
                                                description: 'the user age'
                                            },
                                            classroom: {
                                                type: 'object',
                                                properties: {
                                                    roomnumber: {
                                                        type: 'number',
                                                        description: 'room number'
                                                    },
                                                    name: {
                                                        type: 'string',
                                                        description: "the user name"
                                                    },
                                                    user: {
                                                        type: 'number',
                                                        description: 'describe number'
                                                    },
                                                    describe: {
                                                        type: 'string',
                                                        description: "the user describe"
                                                    },
                                                }
                                            },
                                            namee: {
                                                type: 'string',
                                                description: "the user name"
                                            },
                                            agea: {
                                                type: 'string',
                                                description: 'the user age'
                                            },
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            treeData: []
        }

        
    }
    private resetTreeData() {
        this.setState({
            treeData: this.getTreeData(),
            expandedKeys: this.defaultExpandedKeys
        })
    }
    private fixedName(info: any, currentNode?: any) {
        return info.map(it=> {
            
            if (!currentNode) {
                it.source = 'rest' + it.source;
                it.target = 'rest' + it.target;
            } else {
                if (currentNode.value == it.name && currentNode.type =='node') {
                    it.color = '#ccc';
                    it.disabeld = true;
                    if (it.props) {
                        it.props.color = it.color;
                    }
                }
            }
            it.name = 'rest' + it.name;

            return it;
        })
    }
    public  componentDidMount(): void {
        this.resetTreeData();
       setTimeout(()=> {
            this.initMiniFlow();
       },0)
       
    }
    public  componentWillUnmount() {
        this.miniFlow.destory();
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
        this.miniFlow.doFormatNodeCanvas();
    }
    private getChildren(schema: any, rootPath: any[] = []) {
        let treedata: any = {
            key: [...rootPath,schema.name].join('.'),
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
                schema.items.name = '[]'
                schema.items.disabled = true;
                treedata.subtype = schema.items.type;
                
                treedata.children = [this.getChildren(schema.items, [...rootPath, schema.name])]
                break;
            default:
                break;
        }

        if (rootPath.length < 3) {
            this.defaultExpandedKeys.push(treedata.key)
        }
        
        return treedata;
    }
    public getTreeData() {
        let { schema = {} } = this.state;
        this.defaultExpandedKeys = [];

        return [this.getChildren({...schema, name: 'Returns'})]
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
                                        this.setState({
                                            selected: it
                                        })
                                    }}
                                />
                            )
                        })}
                    </div>
                </div>
                </div>
                <div className='ui-scope-tree'>
                    <h4><Tooltip title={description}> <span>{method}</span> <span className='number'>{selected.serial}</span> </Tooltip> <span>Returns data</span></h4>
                    
                    <Tree
                        blockNode
                        onSelect={(item:any)=> {
                            console.log(item,22)
                            item[0] && this.props.onClick(item[0].toLowerCase(), ['$flow',selected.name.replace(/^rest/,'')].join('.'))
                        }}
                        expandedKeys ={this.state.expandedKeys}
                        autoExpandParent={true}
                        onExpand={(expandedKeys) => this.setState({expandedKeys})}
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

                </div>
            </div>
        )
    }
}