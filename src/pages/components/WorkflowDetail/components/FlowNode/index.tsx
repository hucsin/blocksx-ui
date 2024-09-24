import React from 'react';
import classnames from 'classnames';
import { utils, keypath } from '@blocksx/core';
import './style.scss';
import { FetchMap } from '../../typing';
import NodeConfigure from './NodeConfigure';
import { DomUtils, FormerTypes, ContextMenu, Icons, SmartPage, GlobalScope } from '@blocksx/ui';

import i18n from '@blocksx/i18n';
import { PlusOutlined } from '@ant-design/icons';

import DefaultNodeList from '../../config/DefaultNodeList';
import { set } from 'lodash';
import Output from '../Output'
import Clock from './clock';
import { Popover } from 'antd';



interface IMircoFlowNode {
    name: string;
    serial: number;
    id?: number;
    workflowId: any;
    classify: any;
    mircoFlow: any;
    floating?: boolean;
    noinp?: boolean;
    status?: any;
    //statusMessage?: any;
    nodeStatus?: any;
    nodesStatus?: any;
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
    onMouseLeave: Function;
    onMouseEnter: Function;
    
    getFormerSchema(type: string):any;
    onResetErrorStatus: Function;
    onChangeProps(value: any):any;
    onRemoveNode(name: string):any;
    activateList: any;

}

interface SMircoFlowNode {
    left: number;
    top: number;
    color: string;
    type: string;
    isNew?: boolean;
    props: any;
    status: any,
    
    //statusMessage: any;
    nodeStatus?: any;
    nodesStatus?: any;
    cacheProps: any;
    openSetting: boolean;
    hasChanged: boolean;
    settingMode?: string
    reflush: number;
    value?: any;
    activateList: any;
    componentName: any;

    errorMessage?: any;
    errorStatus?: any;
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
            
            (this.canShowChildrenAdd()  || this.canShowTrigerAdd()) && {
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
            this.props.classify =='function' && {
                type: 'group',
                name: 'BINDING',
                control: (c) => {
                    
                    if (['gos','go'].indexOf(c.nodeType)>-1) {
                        let hasTimer: boolean = (this.props.classify == 'trigger' && this.canShowTrigerAdd()) && !c.hasTimer;
                        let notThinking: boolean = this.props.classify !=='thinking';
                        let hasPages: boolean = notThinking && !c.hasPages;
                        let hasOpenAPI:boolean = notThinking && !c.hasOpenAPI;
                        return hasOpenAPI || hasPages  || hasTimer;
                    }
                    
                },
            },
            this.props.classify =='function' && {
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
            this.props.classify =='function' && {
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

            {
                type: 'group',
                name: 'SETTING'
            },
            this.canShowTimter() && {
                name: i18n.t('Timer setting'),
                type: 'timer',
                icon: 'FieldTimeOutlined'
            },
            !this.isNoInput() && {
                name: i18n.t('Configuration'),
                type: 'configuration',
                icon: 'ConfigurationUtilityOutlined'
            },
            {
                name: i18n.t('Edit Notes'),
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
                    canRemove: [true]
                }
            },
            disabledRemove && {
                name: i18n.t('Delete {name}', { name:/* type == 'go' ? triggerName :*/ 'Node'}),
                type: 'delete',
                icon: 'DeleteOutlined',
                control: {
                    canRemove: [true]
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

        let componentName: any = props.componentName || cprops.componentName;

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
            hasChanged: false,
            activateList: props.activateList,
            componentName,
            status: '',
            nodeStatus: props.nodeStatus,
            nodesStatus: props.nodesStatus,
            errorMessage: cprops.errorMessage,
            errorStatus: cprops.errorMessage ? 'miss' : ''
        };
        
        this.mircoFlow = props.mircoFlow;
    }

    public UNSAFE_componentWillReceiveProps(newProps: IMircoFlowNode) {

        if (newProps.activateList != this.state.activateList) {
            this.setState({
                activateList: newProps.activateList
            })
        }

        if (newProps.status != this.state.status) {
            this.setState({
                status: newProps.status,
                nodeStatus: newProps.nodeStatus
            })
        }
        if (newProps.nodeStatus != this.state.nodeStatus) {
            this.setState({
                nodeStatus: newProps.nodeStatus
            })
        }
        if (newProps.nodesStatus != this.state.nodesStatus) {
            this.setState({
                nodesStatus: newProps.nodesStatus
            })
        }

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
                    cacheProps: props,
                    componentName: newProps.componentName || newProps.props.componentName
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

        !utils.isString(type) && this.consume(type)

        if (this.props.classify == 'function') {

            type = !this.hasPagesNode() ? 'pages' : 'apis';
        }
        let defaultProps: any = DefaultNodeList.getDefaultTriggerClassifyConfig(
                utils.isString(type) ? type :  this.props.classify, this.mircoFlow.miniFlow.getNextMaxSerial());
        
        this.props.onAddTriggerNode 
            && this.props.onAddTriggerNode(this.props.name, defaultProps || { props: { program: 'Trigger'}});
            
        
        
    }
    private consume(event?: any) {
        event && DomUtils.consume(event);
    }
    private  statusIconMap: any = {
        running: 'LoadingOutlined',
        success: 'CheckOutlined',
        faild: 'InfoOutlined',
        miss: 'SettingFilled'
    };
    private isShowError() {
        let { nodeStatus = {}, status, errorMessage } = this.state;
        
        if (errorMessage) {
            return true;
        }

        if (nodeStatus.code == 'miss') {
            return !!nodeStatus.message;
        }

        if (nodeStatus.status == 'NODE_BREAK') {
            return !!nodeStatus.message
        }
    }
    private isShowSuccess() {

        let { nodeStatus = {} } = this.state;
        if (nodeStatus.status == 'NODE_FINISH' ) {
            return nodeStatus.outcome && nodeStatus.outcome;
        }
    }
    private canShowPopover() {
        return this.isShowError() || this.isShowSuccess();
    }
    public renderStatusPopover() {
        let { errorMessage, status, errorStatus } = this.state;
        //let status: string = this.state.status; // running, success, faild, miss
        
        let IconView: any = Icons[this.statusIconMap[errorStatus || status]]
        
        if (this.canShowPopover()) {
            
            let type: string = this.isShowSuccess() ? 'success': 'error';
            return (
                <div className={classnames({
                    'ui-popover-tips': true,
                    [`ui-popover-tips-${type}`]: type
                })}>
                    <p><IconView/> {this.isShowSuccess() ? 'Success' : 'Error'}</p>
                    {this.isShowSuccess() 
                        ? <Output nodeStatus={this.state.nodeStatus} nodesStatus={this.state.nodesStatus} /> 
                        : <div>{this.renderErrorMessage(errorMessage ||this.state.nodeStatus.message)}</div>}
                </div>
            )
            
        } else {
            return null;
        }
    }
    public renderErrorMessage(message: any) {

        if (utils.isArray(message)) {
            return (
                <ul>
                    {message.map((it, index) => {
                        return (
                            <li key={index}>{utils.isString(it) ? it : JSON.stringify(it)}</li>
                        )
                    })}
                </ul>
            )
        }

        return JSON.stringify(message);
    }
    public renderStatus() {

        let status: string = this.state.errorStatus || this.state.status; // running, success, faild, miss
        let IconView: any = Icons[this.statusIconMap[status]]
        
        //let statusIcon: 
        
        if (status && IconView) {
            return (
                <div
                    onClick={(e)=> {
                        e.stopPropagation();
                        //e.preventDefault();
                    }}
                    key={23}
                    className={classnames({
                        'ui-node-status': true,
                        [`ui-node-status-${status}`]: status,
                        'ui-node-status-errorMessage': this.isShowError()
                    })}
                >
                    <Popover align={{offset: [-12,-10]}} placement='topLeft' overlayClassName="ui-tooltip" content={this.renderStatusPopover()}>
                        {<IconView/>}
                    </Popover>
                </div>
            )
        }
    }
    public renderDefaultNodeContent(icon: any, color: string) {
        let { props = {}} = this.state;
        
        //let startNodes: any = this.mircoFlow.miniFlow.getNodes();
        
        return (
            <>
                {this.renderStatus()}
                <FormerTypes.avatar size={100}  icon={icon} color={color}/>
                {this.canShowChildrenAdd()&&<div className='ui-adder'  onClick={this.addRouterChildren}><PlusOutlined/></div>}
                {this.canShowTrigerAdd()  && <div className='ui-adder-router' onClick={this.addTiggerNode}><PlusOutlined/></div>}
                {this.canShowTimter() && <div className='ui-timer' onClick={()=> {this.onMenuClick({type: 'timer'})}}><Clock/></div>}
                {props.program &&<div className='ui-title'>
                    <h4>{props.program} <span>{this.props.name}</span></h4>
                    <span>{props.method }</span>
                </div>}
            </>
        )
    }
    private canShowTimter() {
        return this.state.type =='go' &&  this.state.componentName && this.props.classify == 'trigger';
    }
    private canShowChildrenAdd() {
        return !this.props.isViewer && !this.props.floating && !!this.state.componentName
    }
    private canShowTrigerAdd() {
        
        if (this.props.classify == 'function') {

            return !(this.hasPagesNode() && this.hasOpenAPINode());

        } else {
            return !this.props.isViewer && this.state.type == 'go' && (this.props.classify!='function') && !!this.state.componentName
        }
    }
    private getPageName() {
       let map: any =  {
            'setting': 'ConnectorSetting',
            'timer': 'Thinking.timer'
        }
        return map[this.state.settingMode as string] || this.state.componentName || 'router';
    }
    public renderNodeContent(icon: string, color: string) {
        
        let type: string  = this.state.type;        
        let componentName: any = this.state.componentName;
        let nodeType: string = type == 'go' ? this.state.componentName ? type :'empty' : type;
        

        switch (nodeType) {
            case 'empty':
                return (
                    
                    <NodeConfigure 
                        open={this.state.openSetting}
                        onOpenChange={(v)=> this.setState({openSetting: v})}

                        onFetchRecoFilter={(parmas)=>{
                            return this.props.fetchMap['programs']({...parmas}, type =='go' ?  'trigger': 'notrigger')
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
                let inputKey: string =  this.state.settingMode == 'timer' ? 'timer' : 'input';
                //let noInputKey: string = this.state.settingMode == 'timer' ? 'input': 'timer';
                
                let value: any  = this.state.value || (isInputValue ? { ...propsvalue[inputKey], $connection: propsvalue.connection } : propsvalue) || {};
                let pagename:string = this.getPageName()
                
                return (
                     !this.isNoInput() ? <SmartPage
                        onValidationFailed={(message: any)=> {
                            this.setState({
                                errorMessage: message,
                                errorStatus: 'miss',
                                hasChanged: true
                            })
                            this.props.onResetErrorStatus(true)
                        }}
                        onValidationSuccess={()=> {
                            this.setState({
                                errorStatus: '',
                                errorMessage: '',
                                hasChanged: true
                            })
                            this.props.onResetErrorStatus(false)
                        }}
                        onGetDependentParameters ={(val, type)=> {
                            
                            if (type == 'next') {
                                let { props = {}} = this.props;
                                return {
                                    componentName: props.componentName
                                }
                            }
                            return {
                                workflowId: this.props.workflowId,
                                nodeName: this.props.name
                            }
                        }}
                        pageURI='/api/thinking/findNodeConfigure'
                        key={pagename}
                        name={pagename}
                        rootClassName="ui-flownode-config"
                        reflush={this.state.reflush}
                        type="popover"
                        readonly={this.props.isViewer}
                        simplicity
                        props={
                            {
                                defaultFirstTitle: 'Connection',
                                action: 'setting',
                                hideButtons: true,
                                mandatoryValidation: true,
                            }
                        }
                        params={()=> {
                            
                            let { props = {}} = this.props;
                            return {
                                id: parseInt(this.props.workflowId, 10),
                                node: this.props.name,
                                dynamic: props.dynamic,
                                connection: props.connection,
                               // mode: this.state.settingMode,
                                type: componentName ? 'module' : 'router'
                            }
                        }}
                        icon="SettingOutlined"
                        value={value}
                        onSchemaResponse={(data:any)=> {
                            let schema = data.schema;
                            if (schema.meta && schema.meta.control) {
                                this.initControl(schema.meta.control, data)
                            }
                        }}
                        onChangeValue={(val) => {
                            this.setState({value: val});
                        }}
                        onClose={(props: any = {}, changed?: boolean)=> {
                            
                            if (changed) {
                                
                                if (isInputValue) {
                                    
                                    propsvalue[inputKey] = {
                                        ...propsvalue[inputKey],

                                        ...utils.getSafeObject(props)
                                    };



                                    propsvalue.connection = props['$connection'];
                                } else {
                                    propsvalue = props;
                                }
                                
                                let cacheValue: any = this.clearPatchValue(propsvalue);
                                
                                this.setState({
                                    props: cacheValue,
                                    value: null,
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
                    </SmartPage>: <div className='ui-smartpage-popover-wrapper'>{this.renderDefaultNodeContent(icon, color)}</div>
                )
        }
        
    }
    private initControl(control: any, data?: any) {        
        this.control = control;
        //
        this.patchValue(data );
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
    private patchValue(data ?: any) {
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

                if (data) {
                    
                    data.value = utils.merge({}, state.props.input, data.value)
                } else {
                
                    this.setState({
                        props: state.props,
                        reflush: state.reflush + 1,
                        value: state.props.input
                    })
                }

            }
        }
    }
    private onShowLayer =()=> {


        if (this.isNoInput()) {
            return true;
        }

        this.patchValue();
        this.setState({openSetting: true});
       
        this.setGlobalScope();
    }
    private setGlobalScope() {
 
        GlobalScope.setScope(GlobalScope.TYPES.CURRENTFLOW_NODE, {
            type: 'node',
            value: this.props.name
        });
    }
    private onCloseLayer() {
        
        if (this.state.hasChanged) {
           
            this.props.onUpdateNode && this.props.onUpdateNode(this.props.name, {
                props: {...this.state.props, errorMessage: this.state.errorMessage}
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
        let sources: any = this.mircoFlow.miniFlow.getConnectorBySourceName(this.props.name);
        let targets: any = this.mircoFlow.miniFlow.getConnectorByTargetName(this.props.name);


        
        ContextMenu.showContextMenu(this.props.name, event, {
            nodeType: type =='go' 
                        ? startNodes.length>1 || allNodes.length == 1 ? 'gos' : 'go'  
                        : ['router','empty'].indexOf(type)>-1 ? type : 'module',
            canRemove: sources.length <=1 && targets.length <=1,
            nodeLength: allNodes.length > 1 ? 'more' : 'one',
            hasPages: this.hasPagesNode(startNodes),
            hasOpenAPI: this.hasOpenAPINode(startNodes)
        })
    }
    private hasOpenAPINode(nodes?: any) {
        if (!this.mircoFlow.miniFlow ) return true;
        let startNodes: any = nodes || this.mircoFlow.miniFlow.getNodes();
        return !!startNodes.find(it=> it.componentName =='Thinking.openapi')
    }
    private hasPagesNode(nodes?: any) {
        if (!this.mircoFlow.miniFlow ) return true;
        let startNodes: any = nodes || this.mircoFlow.miniFlow.getNodes();
        return !!startNodes.find(it=> it.componentName =='Thinking.pages')
    }
    public onMenuClick =(item: any)=> {
        switch(item.type) {
            case 'addPages':
                return this.addTiggerNode('pages');
            case 'addAPI':
                return this.addTiggerNode('apis');
            case 'addTrigger':
                return this.addTiggerNode();
            case 'setting':
                return this.setState({openSetting: true, value: null, settingMode: 'setting'})
            case 'configuration':
                return this.setState({openSetting: true, value: null, settingMode: 'configuration'});
            case 'timer':
                return this.setState({openSetting: true, value: null, settingMode: 'timer'})
            case 'add':
                return this.addRouterChildren()
            case 'delete':
                return this.mircoFlow.miniFlow.deleteNodeByName(this.props.name, ()=> {
                    this.props.onRemoveNode && this.props.onRemoveNode(this.props.name)
                })
        }
    }
    private isNoInput() {

        let typeProps: any = this.props.props || {};
        return typeProps.noinp;
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
                    'ui-mircoflow-deny': this.isNoInput(),
                    'ui-mircoflow-activate': this.state.activateList && this.state.activateList.indexOf(this.props.name) > -1,
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
                onMouseEnter={()=> {
                    this.setGlobalScope();
                    this.props.onMouseEnter(this.props.name)
                }}
                onMouseLeave={()=> {
                    this.props.onMouseLeave();
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
                {icon[1] && (icon[0].indexOf(icon[1]) == -1) && this.renderNodeSubIcon(icon[1])}
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