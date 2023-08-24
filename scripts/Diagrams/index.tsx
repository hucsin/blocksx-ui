import React, { useRef } from 'react';
import ReactDOM from 'react-dom';
import { utils } from '@blocksx/core';

import jsplumb  from '../utils/third-party/jsplumb';

import { createEmptyElement, replaceClassName } from '../utils/dom';
import innerUtils from '../utils/index'
import CanvasDraggable from '../utils/CanvasDraggable';


import DiagramsTable from './DiagramsTable';
import ToolFilter from './toolFilter';
import ToolAction from './toolAction';
import Pick from '../Pick';
import Former from '../Former';
import FormerSchema from './schema';
import { DiagramsTableObject, DiagramsTableField } from './typing';


const  jsPlumb: any = jsplumb.jsPlumb;

interface DiagramsProps  {
    tableList: DiagramsTableObject[]
    onChange?: Function;

    canvasZoom: number;
    canvasPosition: any;
}
interface DiagramsState {
    tableList: DiagramsTableObject[];
    filterTableList: DiagramsTableObject[];
    // pick 
    pickVisible?: boolean;
    pickTarget: string;
    pickValue?: any;

    filterValue: any;

    instance?: any;

    canvasZoom: number;
    canvasPosition: any;


    objectNumber:number;

}

export default class Diagrams extends React.Component<DiagramsProps, DiagramsState> {
    private uuid: any;
    private canvas: any;
    private instance: any;
    private tableMap: any;
    private shouldComponentUpdated: any;
    private canvasDraggable: any;
    private zIndex: number;
    private colorList: any[] = [
        '#FA5151',
        '#4338CA',
        '#CD0074',
        '#00C322',
        '#6A0AAB',
        '#A6A300',
        '#388E3C',
        '#FF6F00',
        '#4E342E',
        '#F44336',
        '#7B1FA2',
        '#673AB7',
        '#3F51B5',
        '#827717'
    ];
    private relatedLabelMap: any = {
        one: '1 v 1',
        onem: '1 v m',
        rely_one: '1 v 1 (rely)',
        rely_onem: '1 v m (rely)'
    };

    public constructor(props: DiagramsProps) {
        super(props);

        this.uuid = utils.uniq('diagrams');
        this.zIndex = 1;
        this.canvas = React.createRef();

        this.tableMap = {};
        this.shouldComponentUpdated = true;

        this.state = {
            tableList: props.tableList,
            filterTableList: props.tableList.slice(0, props.tableList.length),
            pickTarget: '',
            filterValue: [],
            canvasZoom: 1,
            canvasPosition: props.canvasPosition || {
                left: 0,
                top: 0
            },
            objectNumber: props.tableList.length || 0
        }

        this.canvasDraggable = new CanvasDraggable(this);
    }

    public getInstance() {

        return jsPlumb.getInstance({
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
                                this.setState({
                                    pickTarget: e.component.sourceId,
                                    pickVisible: true,
                                    pickValue: map.field.fieldType
                                })
                            }
                        }
                    }
                }]
            ],
        });
    }

    public componentDidMount() {

        this.setState({
            instance: this.getInstance()
        }, () => {
            jsPlumb.setContainer(this.uuid);
        
            jsPlumb.ready(() => {
                let { tableList, instance } = this.state;
                
                instance.bind('beforeDrop', (connInfo)=> {
                    let { connection } = connInfo;
                    if (this.getObjectKey(connection.sourceId)  == this.getObjectKey(connection.targetId)) {
                        // 删除自身
                        return false;
                    } 
                    return true;
                })

                instance.bind("connection",  (connInfo, originalEvent) => {
                    let { connection } = connInfo;

                    if (connection.source && connection.target) {
                        
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

                instance.bind('connectionDetached', (connInfo: any,event?:any) => {
                    let { sourceId , targetId } = connInfo;
                    if (event) {
                        let sourceObject: string = sourceId.split('.');
                        let targetObject: string = targetId.split('.');

                        this.removeFieldByKeys(sourceObject[0], sourceObject[1])
                        this.removeFieldByKeys(targetObject[0], targetObject[1]);
                        this.onChangeObjectList(true);
                    }
                })
                
                this.flushTableConnect();
                this.canvasDraggable.init();
            })
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

    public flushTableConnect (isDeleteAll?: boolean) {
        let { filterTableList, instance } = this.state;

        if (isDeleteAll) {
            instance.getAllConnections().forEach(it => {
                instance.deleteConnection(it)
            })
        }
        
        setTimeout( () => {
            filterTableList.forEach((table) => {
                //ignoreTable != true && this.initObjectNodeByObjectKey(table.objectKey);
                
                table.fields.forEach(field => {
                    this.connectFieldRelay(field, table, isDeleteAll)
                })
            });
        }, 0)
    }

    public onChangeObjectList(force?: boolean, cb?: Function) {
        this.shouldComponentUpdated =  force !==undefined ?  force :  true;

        this.setState({
            tableList: this.state.tableList
        }, () => {
            this.shouldComponentUpdated = true;
            this.props.onChange && this.props.onChange(this.state.tableList);
            cb && cb();
        })
    }

    public shouldComponentUpdate() {
        return this.shouldComponentUpdated ;
    }
    public componentDidUpdate() {
        
    }
    
    public hasExportObject(objectKey: string) {
        let { filterTableList } = this.state;
        return !!filterTableList.filter(it => it.objectKey === objectKey);
    }
    public connectFieldRelay(field: any, objectNode:any, force?: boolean) {
        let source: any = [objectNode.objectKey, field.fieldKey].join('.');
        let { filterValue } = this.state;
        
        if (force === true || !this.tableMap[source] || !this.tableMap[source].connection) {

            if (field.type == 'relation') {
                
                let fieldConfig: any = field.fieldConfig;
                let target: any = [fieldConfig.objectKey, fieldConfig.fieldKey].join('.');
                
                // 没有过滤或则已经哎过滤的时候
                if (filterValue.length == 0 || filterValue.indexOf(fieldConfig.objectKey) > -1) {
                    //cache source 
                    this.tableMap[source] = Object.assign(this.tableMap[source] || {}, {
                        field: field,
                        source,
                        target
                    })
                    // 看下有没有目标段的对象存在
                    if ( this.hasExportObject(fieldConfig.objectKey)) {
                        this.state.instance.connect({
                            source: source,
                            target: target,
                            anchor: ["Left", "Right" ],
                            connector: [ "Flowchart", 
                                { stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } 
                            ],
                        });
                    }
                }
            } else {
                //cache source
                this.tableMap[source] = Object.assign(this.tableMap[source] || {}, {
                    field: field,
                    source
                })
            }
        }
    }
    
    private isRelayNode(field: any) {
        return field.type === 'relation';
    }
    private resetDefaultRelayConnect(tableMap: any, connection: any) {
       let target: any = connection.targetId.split('.');
       Object.assign(tableMap, {
          target: connection.targetId,
          source: connection.sourceId,
          field: Object.assign(tableMap.field, {
            type: 'relation',
            fieldType: 'one',
            fieldConfig: {
                objectKey: target[0],
                fieldKey: target[1]
            }
          })
       });

       this.updateConnectionNodesByKeys(connection.sourceId, connection.targetId, 'one')
       
       this.onChangeObjectList(true, () => {
            this.flushTableConnect();
       });
    }

    public onTableValueChange =(table:DiagramsTableObject, tableValue: any, change: any)=> {
        //更新表基本数据
        if ( change.changeType == 'editTableInfo') {
            // 更新
            innerUtils.findArrayPatch(this.state.tableList, 
                { objectKey: table.objectKey }, tableValue);

            this.onChangeObjectList();
        } else {
            switch (change.changeType) {
                case 'resizeTable':

                    innerUtils.findArrayPatch(this.state.tableList, {
                        objectKey: table.objectKey
                    }, {
                        left: change.left,
                        top: change.top
                    })
                   
                    break;
                case 'addRelated':

                    let { fieldKey, objectKey } = tableValue.fieldConfig;
                    // 添加
                    this.updateConnectionNodesByKeys([table.objectKey, tableValue.fieldKey].join('.'),
                        [objectKey, fieldKey].join('.'),
                        tableValue.fieldType
                    )
                    break;
                case 'editTableRecored':
                    // patch

                    break;
                
            }

            this.onChangeObjectList(true, ()=> {
                // 
                console.log('ontavlevalue')
                this.flushTableConnect()
            })

        }
    }

    public resetRelatedType (relatedType: string) {
        let map: any = this.tableMap[this.state.pickTarget];
        let connection: any = map.connection;

        if (map && connection) {

            map.field.fieldType = relatedType;
            
            this.resetRelatedLabel(connection.getOverlay('label'), this.relatedLabelMap[relatedType])
            this.resetRelatedSourceTargetPoint(
                connection.getOverlay('sourcePoint'), 
                connection.getOverlay('targetPoint'), 
                map.field
            )
            
            // 更新
            // 更新原端
            this.updateConnectionNodesByKeys(map.source, map.target, relatedType)

            this.onChangeObjectList(true);

        }
    }

    public updateConnectionNodesByKeys( source: string, target:string, relatedType: string) {
        let [sourceObjectKey, sourceFieldKey]  = source.split('.');
        let [targetObjectKey, targetFieldKey] = target.split('.');

        
        this.updateRelayNodeByKey(sourceObjectKey, sourceFieldKey, {
            type: 'relation',
            fieldType: relatedType,
            fieldConfig: {
                objectKey: targetObjectKey,
                fieldKey: targetFieldKey
            }
        });

        this.updateRelayNodeByKey(targetObjectKey, targetFieldKey, {
            type: 'relationAt',
            fieldType: relatedType,
            fieldConfig: {
                objectKey: sourceObjectKey,
                fieldKey: sourceFieldKey
            }
        });
    }

    public updateRelayNodeByKey(objectKey:string, fieldKey:string, value: any) {
        innerUtils.findArrayPatch(this.state.tableList, {
            objectKey: objectKey
        }, {
            $patch: true,
            target: 'fields',
            find: {
                fieldKey: fieldKey
            },
            patch: value
        })
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
    public setZoom(dir:number) {
        let { canvasZoom } = this.state;
        this.setState({
            canvasZoom: canvasZoom  +  dir * 0.1
        }, ()=> {
            this.state.instance.setZoom(this.state.canvasZoom, true)
        })
    }
    /**
     * 添加一个表格
     */
    public addTable() {
        let defaultObjectNumber:number = this.getDefaultObjectNumber();
        let defaultObjectKey: string = 'object' + defaultObjectNumber;
        let tableList: any = this.state.tableList;


        tableList.push({
            objectKey: defaultObjectKey,
            objectName: defaultObjectKey,
            fields: [],
            color: this.colorList[defaultObjectNumber % this.colorList.length],
            left: 20 + defaultObjectNumber * 20,
            top: 20 + defaultObjectNumber * 20
        })

        console.log(tableList)
    
        this.onChangeObjectList()
        
    }
    public getDefaultObjectNumber() {
        let objectNumber: number = 1;//this.state.objectNumber;
         
        while (this.hasObjectKey('object' + objectNumber)) {
            objectNumber = objectNumber + 1;
        }
        return objectNumber;
    }
    public hasObjectKey(key:string) {
        return this.state.tableList.filter(it => {
            return it.objectKey == key;
        }).length > 0;
    }
    public getZindex() {
        return this.zIndex++;
    }
    public render() {
        
        return (
            <div className='hoofs-diagrams-canvans' draggable="true">

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
                            this.flushTableConnect(true);
                        })

                    }}
                />
                

                <ToolAction diag={this} zoom={this.state.canvasZoom}/>

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
                    className = 'hoofs-diagrams-wrapper'
                    ref = {this.canvas}
                    id = {this.uuid}
                    style = {{
                        transform: `scale(${this.state.canvasZoom})`,
                        left: this.state.canvasPosition.left,
                        top: this.state.canvasPosition.top
                    }}
                >
                    {this.state.tableList.map((it:DiagramsTableObject ,index:number)=> {
                       
                       return (
                            <DiagramsTable 
                                colorList={this.colorList}
                                diagrams = {this}
                                hidden= {this.isHidden(it.objectKey)}
                                instance={this.state.instance}
                                key={it.objectKey}
                                {...it}
                                left={it.left || (10 + index * 30) }
                                top={it.top || (10+ index* 40)}
                                onChange={(data: any, value: any)=> {this.onTableValueChange(it, value.changeValue, value)}}
                                onGetTableList={()=> { return this.state.filterTableList }}
                            />
                        )
                    })}
                </div>
            </div>
        )
    }

    private isHidden(objectKey: string) {
        let { filterValue } = this.state;

        if(filterValue.length == 0 || filterValue.indexOf(objectKey) > -1) {
            return false
        }
        return true;
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