import React from 'react';
import classnames from 'classnames';
import { utils, keypath } from '@blocksx/core';
import './style.scss';
import { FetchMap } from '../../typing';
import NodeConfigure from '../NodeConfigure';
import { DomUtils, FormerTypes, ContextMenu, Icons, SmartPage, MiniFlow } from '@blocksx/ui';

import i18n from '@blocksx/i18n';
import { PlusOutlined } from '@ant-design/icons';

import DefaultNodeList from '../../config/DefaultNodeList';
import { get, set } from 'lodash';



interface IMircoFlowNode {
    name: string;
    serial: number;
    id?: number;
    workflowId: any;
    classify: any;
    mircoFlow: any;
    floating?: boolean;
    locked?: boolean;
    bytethinkingId?: number;
    componentName?: string;
    type: string;
    left: number;
    top: number;
    color: string;
    icon?: string;
    props: any;
    isNew?: boolean;
    fetchMap: FetchMap;
    isViewer?: boolean;

    onUpdateNode?: Function;
    onAddNodeChildren?: Function;
    onAddTriggerNode?: Function;
    
    getFormerSchema(type: string):any;
    onChangeProps(value: any):any;

}

interface SMircoFlowNode {
    left: number;
    top: number;
    color: string;
    type: string;
    isNew?: boolean;
    props: any;
    cacheProps: any;
    openSetting: boolean;
    hasChanged: boolean;
    settingMode?: string
    reflush: number;
    value?: any;
}

export default class MircoFlowNode extends React.Component<IMircoFlowNode, SMircoFlowNode> {
    
    private defaultColor: string = '#cccccc';
    private mircoFlow: any;
    private componentNameTriggerMap:any = {
        'Thinking.Pages': 'Pages',
        'Thinking.OpenAPI': 'OpenAPI'
    }
    private control: any ;
    private getTriggerName() {
        let { componentName } = this.props;
        return this.componentNameTriggerMap[componentName as any] 
            || (this.props.classify =='thinking' ? 'Thinking' : 'Trigger')
    }
    private getContextMenuMap: any = (type: string, state: any) => {
        let triggerName: string = this.getTriggerName();
        let disabledRemove: any = !this.props.locked;

        return [
            
            {
                type: 'group',
                name: 'ADD'
            },
            this.canShowChildrenAdd() && {
                name: i18n.t('  Action'),
                type: 'add',
                icon: ['NodeExpandOutlined','PlusOutlined']
            },
            
            this.canShowTrigerAdd() ? {
                name: i18n.t(' '+ (this.props.classify =='thinking' ? 'Thinking' : 'Trigger')),
                type: 'addTrigger',
                control: {
                    nodeType: [
                        'gos',
                        'go'
                    ],
                    nodeLength: 'more'
                },
                icon: ['NodeCollapseOutlined','PlusOutlined']
            }: false,
            {
                type: 'group',
                name: 'BINDING',
                control: (c) => {
                    
                    if (['gos','go'].indexOf(c.nodeType)>-1) {
                        let hasTimer: boolean = (this.props.classify == 'trigger' && this.canShowTrigerAdd()) && !c.hasTimer;
                        let notThinking: boolean = this.props.classify !=='thinking';
                        let hasPages: boolean = notThinking && !c.hasPages;
                        let hasOpenAPI:boolean = notThinking && !c.hasOpenAPI;
                        return true;
                    }
                    
                },
            },
            this.props.classify !=='thinking' && {
                name: i18n.t('Pages'),
                type: 'addPages',
                control: {
                    nodeType: [
                        'gos',
                        'go'
                    ],
                    nodeLength: 'more',
                    hasPages: false
                },
                icon: ['PageCommonOutlined','PlusOutlined']
            },
            this.props.classify !=='thinking' && {
                name: i18n.t('OpenAPI'),
                type: 'addAPI',
                control: {
                    nodeType: [
                        'gos',
                        'go'
                    ],
                    nodeLength: 'more',
                    hasOpenAPI: false
                },
                icon: ['ApiOutlined','PlusOutlined']
            },

            this.props.classify == 'trigger' && this.canShowTrigerAdd() && {
                name: i18n.t('Timer'),
                type: 'addTimer',
                
                control: {
                    hasTimer: false,
                },
                icon: ['FieldTimeOutlined','PlusOutlined']
            },
            {
                type: 'group',
                name: 'SETTING'
            },
            {
                name: i18n.t('Configuration'),
                type: 'configuration',
                icon: 'ConfigurationUtilityOutlined'
            },
            {
                name: i18n.t('Notes'),
                type: 'setting',
                control: {
                    nodeType: [
                        'gos',
                        'go',
                        'router',
                        'module'
                    ]
                },
                icon: 'FormOutlined'
            },

            disabledRemove && {
                type: 'divider',
                control: {
                    nodeType: [
                        'gos',
                        'module',
                        'empty'
                    ]
                }
            },
            disabledRemove && {
                name: i18n.t('Delete {name}', { name: type == 'go' ? triggerName : 'Module'}),
                type: 'delete',
                icon: 'DeleteOutlined',
                control: {
                    nodeType: [
                        'gos',
                        'module',
                        'empty'
                    ]
                },
                danger: {
                    errTips: i18n.t('Quietly delete the last start node, keep at least one start node'),
                    condition:(_, nodeName: string) => {
                        let starts:any = state.miniFlow.getStartNodes();
                        let nodeInfo: any = state.miniFlow.getNodeByName(nodeName);
                        let targets: any = state.miniFlow.getConnectorBySourceName(nodeName);

                        return targets.length == 0 ? true : nodeInfo.type != 'go' || (!starts || starts.length > 1);
                    }
                }
                
            }
        ].filter(Boolean);
    }
    public constructor(props: IMircoFlowNode) {
        super(props);

        let cprops: any = props.props || {};

        this.state = {
            left: props.left,
            reflush: 1,
            top: props.top,
            color: props.color,
            type: props.type,
            isNew: props.isNew,
            props: cprops,
            cacheProps: JSON.stringify(cprops),
            openSetting: false,
            hasChanged: false
        };

        this.mircoFlow = props.mircoFlow;
    }

    public componentWillUpdate(newProps: IMircoFlowNode) {
        
        if (newProps.left != this.state.left) {
            this.setState({
                left: newProps.left
            })
        }  

        if (newProps.top != this.state.top) {
            this.setState({
                top: newProps.top
            })
        }

        if (newProps.color != this.state.color) {
            this.setState({
                color: newProps.color
            })
        }
        if (newProps.type != this.state.type) {
            this.setState({
                type: newProps.type
            })
        }
        if (newProps.isNew != this.state.isNew) {
            this.setState({
                isNew: newProps.isNew
            })
        }
        if (newProps.props) {
            let props: any = JSON.stringify(newProps.props);
            if (props != this.state.cacheProps) {
                this.setState({
                    props: newProps.props,
                    cacheProps: props
                })
            }
        }
    } 
    
    private getColor() {
        let color: string = this.state.color;
        
        return color || this.defaultColor;

    }
    private getIcon() {
        let { props ={}} = this.state;
        let { icon } = this.props;

        let subicon: string ;

        if (this.state.type == 'empty') {
            return ['PlusOutlined']
        } 

        if (this.state.type =='router') {  

            return icon && (icon !== 'RouterUtilityOutlined' || props.icon) ? [icon, props.icon || 'RouterUtilityOutlined'] : ['RouterUtilityOutlined'];
        }

        if (props.icon) {
            if (typeof props.icon =='string') {
                subicon = props.icon;
            } else {
                subicon =  props.icon.icon;
            }
            return [this.props.icon, subicon]
        }
        
        return [this.props.icon];
    }
    private addRouterChildren =(event?: any)=> {
        this.props.onAddNodeChildren 
            && this.props.onAddNodeChildren(this.props.name);

        this.consume(event)
    }
    private addTiggerNode = (type?: any)=> {

        let defaultProps: any = DefaultNodeList.getDefaultTriggerClassifyConfig(
                utils.isString(type) ? type :  this.props.classify, this.mircoFlow.state.id);
        
        this.props.onAddTriggerNode 
            && this.props.onAddTriggerNode(this.props.name, defaultProps);
            
        !utils.isString(type) && this.consume(type)
    }
    private consume(event?: any) {
        event && DomUtils.consume(event);
    }
    public renderDefaultNodeContent(icon: any, color: string) {
        let { props = {}} = this.state;
        
        //let startNodes: any = this.mircoFlow.miniFlow.getNodes();
        return (
            <>
                <FormerTypes.avatar size={100}  icon={icon} color={color}/>
                {this.canShowChildrenAdd()&&<div className='ui-adder'  onClick={this.addRouterChildren}><PlusOutlined/></div>}
                {this.canShowTrigerAdd()  && <div className='ui-adder-router' onClick={this.addTiggerNode}><PlusOutlined/></div>}
                {props.program &&<div className='ui-title'>
                    <h4>{props.program} <span>{this.props.serial}</span></h4>
                    <span>{props.method }</span>
                </div>}
            </>
        )
    }
    private canShowChildrenAdd() {
        return !this.props.isViewer && !this.props.floating
    }
    private canShowTrigerAdd() {
        return !this.props.isViewer && this.state.type == 'go' && (this.props.classify!='function')
    }
    public renderNodeContent(icon: string, color: string) {
        let { props ={}} = this.props;
        let type: string  = this.state.type;        
        let componentName: any = this.props.componentName || props && props.componentName;
        let nodeType: string = type == 'go' ? componentName ? type :'empty' : type;
        

        switch (nodeType) {
            case 'empty':
                return (
                    
                    <NodeConfigure 
                        open={this.state.openSetting}
                        onOpenChange={(v)=> this.setState({openSetting: v})}

                        onFetchRecoFilter={(parmas)=>{
                        
                            return this.props.fetchMap['programs']({...parmas}, 'notrigger')
                        }}
                        onClassifyClick={(row) => {
                            this.props.onUpdateNode && this.props.onUpdateNode(this.props.name, {
                                ...row,
                                type: type == 'go' ? type : row.type
                            });
                            
                        }}
                    >
                       {this.renderDefaultNodeContent(icon, color)}
                    </NodeConfigure>
                )
            case 'router':
            case 'go':
            default:
                let propsvalue = this.state.props || {}
                let isInputValue: boolean = this.state.settingMode !== 'setting';
                let value: any  = this.state.value || (isInputValue ? { ...propsvalue.input, $connection: propsvalue.connection } : propsvalue) || {};
                let name: string = 'setting' === this.state.settingMode ? 'ConnectorSetting' : componentName || 'router';
                
                
                return (
                    <SmartPage
                        onGetDependentParameters ={()=> {
                            
                            return {
                                workflowId: this.props.workflowId,
                                nodeName: this.props.name
                            }
                        }}
                        pageURI='/eos/programs/findPage'
                        key={name}
                        name={name}
                        reflush={this.state.reflush}
                        type="popover"
                        isViewer={this.props.isViewer}
                        simplicity
                        props={
                            {
                                defaultFirstTitle: 'Connection',
                                action: 'setting',
                                hideButtons: true
                            }
                        }
                        params={()=> {
                            return {
                              //  id: this.props.bytethinkingId,
                              //  nodeId: this.props.id,
                               // mode: this.state.settingMode,
                                type: componentName ? 'module' : 'router'
                            }
                        }}
                        icon="SettingOutlined"
                        value={value}
                        onSchemaResponse={(schema)=> {
                            if (schema.meta && schema.meta.control) {
                                this.initControl(schema.meta.control)
                            }
                        }}
                        onChangeValue={(val) => {
                            this.setState({value: val});
                        }}
                        onClose={(props: any = {}, changed?: boolean)=> {
                            if (changed) {
                                
                                if (isInputValue) {
                                    
                                    propsvalue.input = {
                                        ...propsvalue.input,
                                        ...utils.getSafeObject(props)
                                    };
                                    propsvalue.connection = props['$connection'];
                                } else {
                                    propsvalue = props;
                                }
                                
                                let cacheValue: any = this.clearPatchValue(propsvalue);
                                this.setState({
                                    props: cacheValue,
                                    value: isInputValue ? cacheValue.input : cacheValue,
                                    hasChanged: true
                                }, ()=> this.onCloseLayer())
                            } else {
                                this.onCloseLayer()
                            }
                        }} 
                        noToolbar
                        open={this.state.openSetting}
                        onShow={this.onShowLayer}
                    >
                        {this.renderDefaultNodeContent(icon, color)}
                    </SmartPage>
                )
        }
        
    }
    private initControl(control: any) {        
        this.control = control;
        //
        this.patchValue();
    }
    private clearPatchValue(props:any) {
        if (this.control) {
            let { patch, type } = this.control;
            if (type =='sync') {
                for(let prop in patch) {

                    set(props, prop.replace(/^props\./,''), undefined)
                }
            }
        }

        return props;
    }
    private patchValue() {
        if (this.control && this.state.settingMode !== 'setting') {
            let { patch, type, listen } = this.control;
            // 如果是值同步，
            if (type == 'sync') {
                // 依据listen条件获取值
                
                let nodeinfo: any = this.mircoFlow.miniFlow.findNode(listen);
                let state = this.state || {};

                for (let prop in patch) {
                    keypath.setData(state, prop, keypath.getData(nodeinfo, patch[prop]))
                }
                
                this.setState({
                    props: state.props,
                    reflush: state.reflush + 1,
                    value: state.props.input
                })

            }
        }
    }
    private onShowLayer =()=> {
    
        this.patchValue();
        this.setState({openSetting: true});
    }
    private onCloseLayer() {
        if (this.state.hasChanged) {
           
            this.props.onUpdateNode && this.props.onUpdateNode(this.props.name, {
                props: {...this.state.props}
            }, true)
        }

        this.setState({openSetting: false,hasChanged: false, settingMode: ''})
    }
    public getContextMenu(): any {

        return this.getContextMenuMap(this.state.type, this.mircoFlow);
    }

    public onContextMenu = (event)=> {
        let { type } = this.props;
        let startNodes: any = this.mircoFlow.miniFlow.getStartNodes();
        let allNodes: any = this.mircoFlow.miniFlow.getNodes();
        
        ContextMenu.showContextMenu(this.props.name, event, {
            nodeType: type =='go' 
                        ? startNodes.length>1 || allNodes.length == 1 ? 'gos' : 'go'  
                        : ['router','empty'].indexOf(type)>-1 ? type : 'module',
            nodeLength: allNodes.length > 1 ? 'more' : 'one',
            hasPages: !!startNodes.find(it=> it.componentName =='Thinking.pages'),
            hasOpenAPI: !!startNodes.find(it=> it.componentName =='Thinking.openapi'),
            hasTimer: !!startNodes.find(it=> it.componentName =='Thinking.timer')
        })
    }
    public onMenuClick =(item: any)=> {
        switch(item.type) {
            case 'addTimer':
                return this.addTiggerNode('timer')
            case 'addPages':
                return this.addTiggerNode('pages');
            case 'addAPI':
                return this.addTiggerNode('apis');
            case 'addTrigger':
                return this.addTiggerNode();
            case 'setting':
                return this.setState({openSetting: true, settingMode: 'setting'})
            case 'configuration':
                return this.setState({openSetting: true, settingMode: 'configuration'})
            case 'add':
                return this.addRouterChildren()
            case 'delete':
                return this.mircoFlow.miniFlow.deleteNodeByName(this.props.name, (nodeName: any) => {
                    console.log(nodeName)
                })
        }
    }
    public render () {
        
        let color: string = this.getColor();
        let icon: any = this.getIcon();

        // 
        return (
            <div 
                className={classnames({
                    //'node-new': this.state.isNew,
                    'ui-mircoflow-node': true,
                    'ui-mircoflow-node-floating': this.props.floating,
                    [`ui-mircoflow-type-${this.state.type}`] : this.state.type
                })} 
                id={this.props.name}
                style={{
                    '--color': color ,
                    '--hover-color': color + '66',
                    left: this.state.left,
                    top: this.state.top
                } as any}

                onContextMenu={(event) => {
                    this.onContextMenu(event)
                }}
            >
                {!this.props.isViewer &&<ContextMenu 
                    namespace={this.props.name} 
                    key={3}
                    onMenuClick={this.onMenuClick} 
                   // type ={this.state.type} 
                    menu={this.getContextMenu()}
                />}
                {this.renderNodeContent(icon[0], color)} 
                {icon[1] && this.renderNodeSubIcon(icon[1])}
            </div>
        )
    }
    private renderNodeSubIcon(icon?: string) {
        let { props ={} } = this.state;

        let Iconview: any = Icons[icon || props.subicon];
        
        if (Iconview) {
            
            return <Iconview style={{backgroundColor: props.color || this.props.color}}/>
        }
        return null;
    }
}