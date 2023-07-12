import React from 'react';
import ReactDOM from 'react-dom';
import { utils } from '@blocksx/core';

import jsplumb  from '../utils/third-party/jsplumb';

import { createEmptyElement, replaceClassName } from '../utils/dom';
import innerUtils from '../utils/index'


import DiagramsTable from './table';
import ToolFilter from './toolFilter';
import ToolAction from './toolAction';
import Pick from '../Pick';
import { DiagramsTableObject, DiagramsTableField } from './typing';

const  jsPlumb: any = jsplumb.jsPlumb;

interface DiagramsProps  {
    tableList: DiagramsTableObject[]
    onChange?: Function;
}
interface DiagramsState {
    tableList: DiagramsTableObject[];
    filterTableList: DiagramsTableObject[];
    // pick 
    pickVisible?: boolean;
    pickTarget: string;
    pickValue?: any;

    filterValue: any;
}

export default class Diagrams extends React.Component<DiagramsProps, DiagramsState> {
    private uuid: any;
    private canvas: any;
    private instance: any;
    private tableMap: any;
    private relatedLabelMap: any = {
        one: '1 v 1',
        onem: '1 v n',
        rely_one: '1 v 1 (rely)',
        rely_onem: '1 v n (rely)'
    };

    public constructor(props: DiagramsProps) {
        super(props);

        this.uuid = utils.uniq('diagrams')
        this.tableMap = {};

        this.state = {
            tableList: props.tableList,
            filterTableList: props.tableList.slice(0, props.tableList.length),
            pickTarget: '',
            filterValue: []
        }
    }

    public componentDidMount() {

        let { tableList } = this.state;

        this.instance = jsPlumb.getInstance({
            Connector: "Straight",
            PaintStyle: { strokeWidth: 3, stroke: "#ffa500" },
            Endpoint: [ "Dot", { radius: 5 } ],
            EndpointStyle: { fill: "#ffa500" },
            
            Container: this.uuid,
            ConnectionOverlays: [
                ["Custom", {
                    create:function(component) {
                      return createEmptyElement('hoofs-diagrams-default-point');
                    },
                    location:1,
                    visible:true,
                    dir: 'target',
                    id:"targetPoint"
                }],
                ["Custom", {
                    create:function(component) {
                      return createEmptyElement('hoofs-diagrams-begin-point');
                    },
                    location:0,
                    visible:true,
                    dir: 'source',
                    id:"sourcePoint"
                }],
                [ "Label", {
                    location: 0.5,
                    id: "label",
                    cssClass: "aLabel",
                    events:{
                        tap:(e) => {
                            let map: any = this.tableMap[e.component.sourceId];
                            if (map ) {
                                console.log(map)
                                this.setState({
                                    pickTarget: e.component.sourceId,
                                    pickVisible: true,
                                    pickValue: map.relatedType
                                })
                            }
                        }
                    }
                }]
            ],
        });

        jsPlumb.ready(() => {
            jsPlumb.setContainer(this.uuid);
            
            this.instance.bind("connection",  (connInfo, originalEvent) => {
                let { connection } = connInfo;

                if (this.getObjectKey(connection.sourceId)  == this.getObjectKey(connection.targetId)) {
                    // 删除自身
                    this.instance.deleteConnection(connection)
                }  else {


                    let tableMap:any = this.tableMap[connection.sourceId];

                    // 
                    if (!this.isRelayNode(tableMap.field)) {
                        this.resetDefaultRelayConnect(tableMap, connection)
                    }

                    if(tableMap ) {
                        // 1vm 
                        setTimeout(() => {
                            // 目标节点
                            // 修改label
                            this.resetRelatedLabel(connection.getOverlay('label'), this.getRelayLabel(tableMap.field))
                            this.resetRelatedSourceTargetPoint(
                                connection.getOverlay('sourcePoint'), 
                                connection.getOverlay('targetPoint'), 
                                tableMap.field
                            )
                        }, 0)
                        
                        Object.assign(tableMap, {
                            connection
                        })
                    }
                }
            });

            this.instance.bind('connectionDetached', (connInfo) => {
                let { sourceId , targetId } = connInfo;
                let sourceObject: string = sourceId.split('.');
                let targetObject: string = targetId.split('.');

                this.removeFieldByKeys(sourceObject[0], sourceObject[1])
                this.removeFieldByKeys(targetObject[0], targetObject[1]);
                this.onChangeObjectList();
            })

            this.flushTableConnect();
        })
    }
    public removeFieldByKeys(objectKey: string, fieldKey: string) {
        let { tableList } = this.state;
        innerUtils.findArrayRemove(tableList, {
            objectKey: objectKey
        }, {
            target: 'fields',
            find: {
                fieldKey:fieldKey
            }
        })
    }

    public flushTableConnect () {
        let { filterTableList } = this.state;
        let instance: any = this.instance;

        // 先删除之前的连线
        instance.getAllConnections().forEach(conn => {
            instance.deleteConnection(conn);
        })

        setTimeout( () => {
            filterTableList.forEach((table) => {
                this.initObjectNodeByObjectKey(table.objectKey);
                
                table.fields.forEach(field => {
                    this.connectFieldRelay(field, table)
                })
            });
        }, 0)
    }

    public onChangeObjectList() {
        
        this.setState({
            tableList: this.state.tableList
        }, () => {
            this.props.onChange && this.props.onChange(this.state.tableList);
        })
    }

    public componentDidUpdate() {
        console.log(3333)
    }
    
    
    public connectFieldRelay(field: any, objectNode:any) {
        let source: any = [objectNode.objectKey, field.fieldKey].join('.');
        let { filterValue } = this.state;
        
        if (field.type == 'relation') {
            let fieldConfig: any = field.fieldConfig;
            let target: any = [fieldConfig.objectKey, fieldConfig.fieldKey].join('.');
            
            // 没有过滤或则已经哎过滤的时候
            if (filterValue.length == 0 || filterValue.indexOf(fieldConfig.objectKey) > -1) {
                //cache source 
                this.tableMap[source] = {
                    field: field,
                    source,
                    target,
                    relatedType: field.fieldType
                }

                this.instance.connect({
                    source: source,
                    target: target,
                    anchor: ["Left", "Right" ],
                    connector: [ "Flowchart", 
                        { stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } 
                    ],
                });
            }
        } else {
           //cache source 
           this.tableMap[source] = {
                field: field,
                source
           }
        }
    }
    
    private isRelayNode(field: any) {
        return field.type === 'relation';
    }
    private resetDefaultRelayConnect(tableMap: any, connection: any) {
        let target: any = connection.targetId.split('.');
        let source: any = connection.sourceId.split('.');
        
        tableMap.relatedType = 'one';
        
        tableMap.target = connection.targetId;
        tableMap.field.type = 'relation';
        tableMap.field.fieldType = 'one';
        tableMap.field.fieldConfig = {
            objectKey: target[0],
            fieldKey: target[1]
        }

        // TODO 更新
    }

    public initFieldNodeByNode(it:any) {
        let instance: any = this.instance;

        if (it.getAttribute('data-fieldkey')) {

            instance.makeSource(it, {
                allowLoopback: false,
                anchor: ["Left", "Right" ],
                endpoint: "Dot",
                paintStyle: {
                    fill: "#ffa500", radius: 5
                },
                connector: [ "Flowchart", 
                    { stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } 
                ],
                //connectorStyle: connectorPaintStyle,
                //hoverPaintStyle: endpointHoverStyle,
                // connectorHoverStyle: connectorHoverStyle,
                dragOptions: {}
            });

            instance.makeTarget(it, {
                anchor: ["Left", "Right" ],
                endpoint: "Dot",
                paintStyle: {
                    stroke: "#ffa500",
                    radius: 5,
                    strokeWidth: 2
                },
                //hoverPaintStyle: endpointHoverStyle,
                maxConnections: -1,
                dropOptions: { hoverClass: "hover", activeClass: "active" }
            });
        }
    }

    public initObjectNodeByObjectKey(objectKey: any) {
        let tableMap: any = this.tableMap[objectKey];
        
        if (tableMap) {
            let objectDOM: any = tableMap.dom;
            let fieldsWrapper: any = objectDOM.querySelector('ul');
            
            fieldsWrapper.querySelectorAll('li:not([data-sourceed])').forEach((it) => {
                it.setAttribute('data-sourceed', true);
                this.initFieldNodeByNode(it);
            })
            
            if (!tableMap.initDraggable) {
                this.instance.draggable(objectDOM, {
                    canDrag: (e) => {
                        let target: any = e.target;
                        return target.getAttribute('data-draggable')
                    },
                    stop: (e) => {
                        let { tableList } = this.state;
                        let { el, pos } = e;
                        innerUtils.findArrayPatch(tableList, {objectKey: el.id}, {
                            left: pos[0],
                            top: pos[1]
                        });
                        
                        this.onChangeObjectList()
                    }
                });
                this.instance.addList(fieldsWrapper, {
                    endpoint:["Rectangle", {width:20, height:20}]
                });
                tableMap.initDraggable = true;
            }
        }
    }

    public onTableValueChange =(table:DiagramsTableObject, tableValue: any, changeValue: any)=> {

        switch(tableValue.changeType) {
            case 'field':
                this.initObjectNodeByObjectKey(table.objectKey)
                break;
            case 'related':
                this.connectFieldRelay(tableValue.changeValue, table)
                break;
        }


        // 更新
        innerUtils.findArrayPatch(this.state.tableList, {objectKey: table.objectKey}, table)

        this.onChangeObjectList();
    }

    public resetRelatedType (relatedType: string) {
        let map: any = this.tableMap[this.state.pickTarget];
        let connection: any = map.connection;
        let source: any = map.source.split('.');
        let target: any = map.target.split('.');
       
        if (map && connection) {

            map.field.fieldType = relatedType;
            map.relatedType = relatedType;

            this.resetRelatedLabel(connection.getOverlay('label'), this.relatedLabelMap[relatedType])
            this.resetRelatedSourceTargetPoint(
                connection.getOverlay('sourcePoint'), 
                connection.getOverlay('targetPoint'), 
                map.field
            )

            // 更新
            console.log(map, connection)
            // 更新原端
            this.updateRelayNodesByKeys(source[0], source[1], {
                type: 'relation',
                fieldType: relatedType,
                fieldConfig: {
                    objectKey: target[0],
                    fieldKey: target[1]
                }
            })
            // 更新目标段
            this.updateRelayNodesByKeys(target[0], target[1], {
                type: 'relationAt',
                fieldType: relatedType,
                fieldConfig: {
                    objectKey: source[0],
                    fieldKey: source[1]
                }
            })

            this.onChangeObjectList();
        }

        
    }

    public updateRelayNodesByKeys(objectKey:string, fieldKey:string, value: any) {
        console.log(objectKey, fieldKey, value, 2222)
        innerUtils.findArrayPatch(this.state.tableList, {
            find: {
                objectKey: objectKey
            }
        }, {
            $patch: true,
            target: 'fields',
            find: {
                fieldKey: fieldKey
            },
            patch: value
        })
        console.log(this.state.tableList, 9999)
    }

    public resetRelatedLabel(labelArrow:any , label: string) {
        if (labelArrow && labelArrow.canvas) {
            labelArrow.canvas.innerHTML = label;
        }
    }

    public resetRelatedSourceTargetPoint(source: any, target: any, field: any) {

        let hasMoreRelated:boolean = this.hasMoreRelated(field);
        let hasRelyRelated:boolean = this.hasRelyRelated(field);
        if (target && source) {
            replaceClassName( target.canvas, 
                hasMoreRelated ? 'default' : 'end', 
                hasMoreRelated ? 'end' : 'default');
            
            // 修改开始节点
            replaceClassName( source.canvas,
                hasRelyRelated ? 'begin' : 'rely',
                hasRelyRelated ? 'rely' : 'begin'
            );
        }
    }
    private getFilterTagsList() {
        return this.state.tableList.map((it) => {
            return {
                value: it.objectKey,
                label: it.objectName
            }
        })
    }
    public render() {
        
        return (
            <div className='hoofs-diagrams-canvans'>

                <ToolFilter 
                    tagsList={this.getFilterTagsList()}
                    selectedTags={this.state.filterValue}
                    onChange={(ev) => {
                        this.setState({
                            filterValue: ev,
                            filterTableList: ev.length > 0 
                                ? this.state.tableList.filter(e => ev.indexOf(e.objectKey) > -1 )
                                : this.state.tableList
                        }, () => {
                            // 刷新flushTableConnect
                            this.flushTableConnect();
                        })

                    }}
                />

                <ToolAction />

                <Pick 
                    title="修改关联类型"
                    visible={this.state.pickVisible} 
                    value={this.state.pickValue} 
                    option={[
                        {value: 'one', label: '1 v 1'},
                        {value: 'onem', label: '1 v m'},
                        {value: 'rely_one', label: '1 v 1(rely)'},
                        {value: 'rely_onem', label: '1 v m(rely)'}
                    ]}
                    onChange={(e) => {
                        this.setState({
                            pickVisible:false,
                            pickValue: e
                        })
                        
                        this.resetRelatedType(e)
                    }}
                />

                <div 
                    className='hoofs-diagrams-wrapper'
                    ref={(dom)=> {this.canvas = dom;}}
                    id={this.uuid}
                >
                    {this.state.filterTableList.map((it:DiagramsTableObject ,index:number)=> {
                        return (
                            <DiagramsTable 
                                key={it.objectKey}
                                ref={(e) => { this.tableMap[it.objectKey] = {
                                    diagramsTable: e,
                                    dom: ReactDOM.findDOMNode(e)
                                }}}
                                {...it}
                                left={it.left || (10 + index * 30) }
                                top={it.top || (10+ index* 40)}
                                onChange={(data: any, value: any)=> {this.onTableValueChange(it, data,value)}}
                                onGetTableList={()=> { return this.state.filterTableList }}
                            />
                        )
                    })}
                </div>
            </div>
        )
    }

    private getObjectKey(path: string) {
        let current: any = path.split('.');
        return current[0];
    }
    private hasRelyRelated(field: DiagramsTableField) {
        return ['rely_one', 'rely_onem'].indexOf(field.fieldType) > -1;
    }
    private hasMoreRelated(field: DiagramsTableField) {
        return ['rely_onem', 'onem'].indexOf(field.fieldType) > -1;
    }
    private getRelayLabel(field: DiagramsTableField) {
        return this.relatedLabelMap[field.fieldType]
    }
}