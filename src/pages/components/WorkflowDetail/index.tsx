import React from 'react';
import { Button, Space, Dropdown, Tooltip, Popover, Menu, Spin, Input, notification } from 'antd';
import { omit } from 'lodash';
import classnames from 'classnames';
import { utils } from '@blocksx/core';
import { MiniFlow as StructuralMiniFlow } from '@blocksx/structural';
import Encode from '@blocksx/encrypt/lib/encode';
import i18n from '@blocksx/i18n';

//import  { FlowNodeType,FlowNode } from '../ScenFlow/MiniFlow/typing'
import { FlowNodeType, FlowNode, FlowConnector, MiniFlow, Icons, SmartPage, FormerTypes, mainTexture, UtilsTool} from '@blocksx/ui';

import './nodes'
import { FormOutlined, CopyOutlined,HistoryOutlined } from '@ant-design/icons';
import { FetchResult, withRouter, GlobalScope } from '@blocksx/ui'
import MircoFlowNode from './components/FlowNode';
import MircoNewFlowNode from './components/FlowNode/NewNode';
import MircoRunTest from './components/RunTest';
import MircoRunLog from './components/RunLog';
import MirceVersionHistory from './components/VersionHistory';
import DefaultNodeList from './config/DefaultNodeList';
import { FetchMap } from './typing';


import './style.scss'

//import MagicFavorites from '../MagicFavorites';
const MagicFavorites = FormerTypes.rate;
//import MagicSwitch from '../MagicSwitch'
const MagicSwitch = FormerTypes.switch;

interface NodeProps {
    [prop:string] : any;
}

export interface FlowDetailData extends FetchResult {
    type?: string,
    value?: any;
    title: string;
    description: string;
    nodes: MircoFLowNode[];
    favorites: any;
    status: any;
    connectors: MircoFLowConnector[];
}

export interface MircoFLowNode extends FlowNode{
    name: string;
    type: FlowNodeType;
    left: number;
    top: number;
    color: string;
    props: NodeProps
}
export interface MircoFLowConnector extends FlowConnector{
    source: string;
    target: string;
    props: NodeProps;
}

export interface MircoFlowProps {
    router: any;
    history: any
    workflowId: any;

    pageType: string;

    isTemplate?: boolean;
    isViewer?: boolean;

    getFormerSchema(formerType: string): any;
   // onToggleFavorites(state: any) :Promise<FetchResult>;
    //onToggleSwitch(state: any): Promise<FetchResult>;
    
    onFetchValue(): Promise<FlowDetailData>;
    onPublishValue(/*id: string, version: string, nodes:MircoFLowNode[], connectors:MircoFLowConnector[]*/ value: any): Promise<FetchResult>,
    onEditorValue(value: any, type?: string): Promise<FetchResult>;
    onCloneValue(value: any): Promise<FetchResult>;
    onSaveFlowList(value: any): Promise<FetchResult>;
    onEditorNode(type: string, value:any);

    fetchMap: FetchMap;
}
interface MircoFlowState {
    nodes: MircoFLowNode[];
    connectors: MircoFLowConnector[];
    
    workflowType: string;

    value?: any;
    loading: boolean;
    routerKey?: string;
    openType: string;
    openLog: string;
    logType: string;
    historyType: string;
    historyStartDate: string;
    historyEndDate: string;

    favorites?: any;
    status?: any;
    version?: string;

    formerType: string;
    formerVisible: boolean;

    isPublish?: boolean;

    openVersion: boolean;
    openPublish: boolean;
    publishing: boolean;
    editLoading: boolean;
    reflush: any;

    runStatus: string;
    runNodeStatus: any;

    titleIsInput: boolean;
    titleOffsetWidth: number;
    // todo
    openhelper: boolean;
    connectProps: any;
    connectPropsHasChanged?: boolean;
    connectId?: string;
    id?: any;
    classify?: string;
    classifyLabel?: any;
    activateList: any;
}

class PageWorkflowDetail extends React.Component<MircoFlowProps, MircoFlowState> {
    private cavnasId: string;
    private responsePanel: any;
    private destoryPanel: any;
    private unlinkPanel: any;
    private canvasPanel: any;
    private canvasRef: any;
    private connectHelperRef: any;
    private router: any;
    private miniFlow:MiniFlow;
    private nodes: any;
    private connectors: any;

    public constructor(props: MircoFlowProps) {
        super(props)
        this.router = props.router;
        this.state = {
            titleIsInput: false,
            titleOffsetWidth: 0,
            
            runStatus: '',
            runNodeStatus: '',

            nodes: [],
            workflowType: '',
            value: {},
            editLoading: false,
            connectors: [],
            loading: false,
            routerKey: props.router.routerKey,
            openType: this.getQueryValue('type'),
            historyType: this.getQueryValue('status'),
            historyEndDate: this.getQueryValue('endDate'),
            historyStartDate: this.getQueryValue('startDate'),
            openLog: this.getQueryValue('logs'),
            logType: this.getQueryValue('logType'),
            formerVisible: false,
            formerType: '',
            isPublish: true,
            openVersion: false,
            publishing: false,
            openPublish: false,
            reflush: 0,
            openhelper: false,
            connectProps: {},
            activateList: []
        }

        this.cavnasId = utils.uniq('MircoFlow');
        this.connectHelperRef = React.createRef();
        this.canvasRef = React.createRef();

    }
    
    public componentDidMount() {
       this.reloadData()
    }

    public reloadData() {
        this.setState({loading: true})
        this.props.onFetchValue().then((data: FlowDetailData) => {
            // 设置默认数据，一句classify            
            if (!data.nodes || data.nodes.length == 0) {
                
                // 人工执行下
                this.initDefaultvalue(data)
            }
            
            this.setState({
                loading: false,
                value: data,
                nodes: data.nodes || [],
                isPublish: data.isPublish,
                id: data.id,
                classify: data.classify,
                classifyLabel: data.classifyLabel,
                connectors: this.coverConnectors(data.connectors || []),
                favorites: data.favorites || false,
                status: data.status,
                version: data.version || '0.0.1',
                reflush: +new Date,
                workflowType: data.classify
            }, ()=> {

                if (this.miniFlow) {
                    this.miniFlow.destory();
                }

                this.initMiniFlow(data.id);
                this.bindEvent();
            })
        }, ()=> {
            this.setState({loading: false})
        })
    }
    private initDefaultvalue(data: any) {
        Object.assign(data, 
            DefaultNodeList.getDefaultValue(data.classify, data.id));
        // 保存
        if (data.nodes.length) {
            this.saveFlowList(this.state.value, this.nodes, this.connectors, 'default', {
                value: {}, 
                diff:  {
                    nodes: StructuralMiniFlow.diffNodes([], data.nodes),
                    connectors: this.coverDiffConnectors(StructuralMiniFlow.diffConnectors([], data.connectors))
                },
                nodes: data.nodes,
                connector: data.connectors
            })
        }
    }
    private coverConnectors(connectors: any) {
        return connectors.map(conn => {
            if (conn.name) {
                
                let sourcetarget: any = conn.name.split('#')
                
                return {
                    id: conn.id,
                    source: sourcetarget[0],
                    target: sourcetarget[1],
                    props: conn.props
                }
            } else {
                return conn
            }
        })
    }
    private coverDiffConnectors(diffConnectors: any) {
        return diffConnectors.map(it => {
            let { value ={} } = it;
            return {
                type: it.type,
                value: {
                    id: value.id,
                    props: value.props,
                    name: [value.source, value.target].join('#')
                }
            }
        })
    }
    public componentWillUpdate(newProps: MircoFlowProps) {
        let { router = {} } = newProps;
        if (router.routerKey !== this.state.routerKey) {
            this.router = router;
            this.setState({
                routerKey: router.routerKey,
                openType: this.getQueryValue('type'),
                historyType: this.getQueryValue('status'),
                historyEndDate: this.getQueryValue('endDate'),
                historyStartDate: this.getQueryValue('startDate'),
                openLog: this.getQueryValue('logs'),
                logType: this.getQueryValue('logType')
            }, () => {
                this.miniFlow.doZoomNodeCanvas();
            })
        }
    }
    public saveFlowList(value: any, nodes: any, connector: any, type: any, cv: any) {
        let { onSaveFlowList, onEditorNode} = this.props;
        switch (type) {
            //case 'addNode':
            case 'updateNode1':
            case 'removeNode1':
                return onEditorNode(type, {
                    nodes,
                    connector,
                    ...cv
                })
            default:
                onSaveFlowList && onSaveFlowList({
                    nodes,
                    type,
                    connector,
                    ...cv
                })
        }
    }
    private cleanNode(node): any {
        return node.map(it => {
            return it.id ? {name: it.name, left: it.left, top: it.top} : it;
        })
    }
    public initMiniFlow(id: any) {
        
        this.miniFlow = new MiniFlow({
            uniq: Encode.encode('Mini#' + id),
            canvas: this.cavnasId,
            isViewer: this.props.isViewer,
            unlinkChinampaPanel: this.unlinkPanel,
            destoryChinampaPanel: this.destoryPanel,
            chinampaPanel: this.responsePanel,

            onChangeValue: ({ type, value, nodes, connector }:FlowDetailData, isdraging: boolean, diffMap: any = {}) => {
                if (!this.props.isViewer) {
                    if (!isdraging) {
                        
                        if (type !== 'updateNode') {
                            diffMap.connectors = this.coverDiffConnectors(StructuralMiniFlow.diffConnectors(this.connectors, connector));
                        }

                        if (!(['updateNode', 'removeNode'].indexOf(type as any ) > -1)) {
                            // 删除或则移动位置
                            diffMap.nodes = StructuralMiniFlow.diffNodes(this.cleanNode(this.nodes), this.cleanNode(nodes))
                        }
                        
                        this.nodes = nodes;
                        this.connectors = connector;
                        
                    }
                    this.setState({
                        nodes: nodes,
                        isPublish: false,
                        connectors: connector
                    }, ()=> {
                        if (!isdraging) {
                            this.saveFlowList(this.state.value, this.nodes, this.connectors, type, {
                                value: value, 
                                diff: diffMap
                            })
                        }
                    })
                }
            },

            templateMap: {
                router: {
                    type: 'router',
                    componentName: 'FlowControl.router',
                    color: '#4d53e8',
                    icon: 'RouterUtilityOutlined',
                    props: {
                        program: 'Router',
                        method: 'Branch Routing'
                    }
                },
                new: {
                    type: 'empty',
                    icon: 'PlusOutlined',
                    color:'#ccc',
                    props: {
                        program: 'Empty'
                    }
                }
            },
            nodes: this.state.nodes as FlowNode[],
            connector: this.state.connectors
        });

        GlobalScope.setContext(GlobalScope.TYPES.CURRENTFLOW_CONTEXT, this.miniFlow);
        
        this.nodes = utils.copy(this.state.nodes);
        this.connectors = utils.copy(this.state.connectors);

        this.miniFlow.doZoomNodeCanvas();
        
        if  (this.state.nodes.length == 0) {
            this.miniFlow.freeze();
        }
    }
    public bindEvent() {
       

        this.miniFlow.on('highlightConnect', ({target,source,event})=> {
            let { current } = this.connectHelperRef;
            if (current) {
                let parentNode: any = this.canvasRef.current;
                
                let parentRect: any = parentNode.getBoundingClientRect();

                current.style.left =(event.pageX-parentRect.left -4) +'px';
                current.style.top = (event.pageY-parentRect.top-4) +'px';
                current.style.display ='block';

                setTimeout(()=> {
                    this.setState({
                        openhelper: true,
                        connectId: [target,source].join('_'),
                        connectProps: this.miniFlow.getHighlightConnectProps()
                    })
                }, 0) 
            }
            
        })
        this.miniFlow.on('unHighlightConnect', () => {
            let { current } = this.connectHelperRef;
            if (current) {
                current.style.display ='none';
                this.setState({
                    openhelper: false
                })
            }
        })
    }
   
    private getQueryValue(queryKey: string) {
        let { query = {} } = this.router;
        return query[queryKey] || ''
    }

    public goBack() {
        this.router.naviagte(-1);
        //this.router.getHistory();
    }
    public doAction = (e: any)=> {
        this.setState({
            formerVisible: true,
            formerType: typeof e == 'string' ? e : e.key
        })
    }
    
    public onTitleClick =(event) => {
        let { value = {}} = this.state;
        
        this.setState({
            titleIsInput: true,
            titleOffsetWidth: Math.max(120, event.target.offsetWidth + 0)
        })
    } 
    public onBlurTitle =(event) => {
        
        let { value = {}} = this.state;
        this.setState({
            titleIsInput: false
        })

        this.props.onEditorValue && this.props.onEditorValue(value)

    }
    public onChangeTitle =(e )=>  {
        
        let { value= {}} = this.state;
        this.setState({
            value: {...value, title: e.target.value},
            //titleOffsetWidth: this.getWidthByValue(e.target.value)
        })
        
    }
    public renderHeader() {
        let { value = {} } = this.state;
        return (
            <div className='ui-mircoflow-header'>
                <Icons.LeftCircleDirectivityOutlined onClick={()=>{this.goBack()}} /> 
                <span className='ui-title'>
                    {!this.props.isTemplate && <span className='ui-node'><MagicFavorites loading={true} onChangeValue={(state) => {
                        this.setState({
                            favorites: state
                        })
                        return this.props.onEditorValue({id: this.state.value.id,  favorites: state})
                    }} value={this.state.favorites} /></span>}
                    <Space>
                    
                        <span className='ui-text'>
                            <FormerTypes.text 
                                value={value.title} 
                                onBlur={this.onBlurTitle}
                                onChangeValue={(val) => {
                                    this.onChangeTitle({ target: {value:val}})
                                }} 
                            />
                            {0 && !this.state.titleIsInput 
                                ? <span onClick={this.onTitleClick}>{value.title}</span> 
                                : <Input 
                                    autoFocus
                                    value={value.title} 
                                    onBlur={this.onBlurTitle}
                                    style={{width: this.state.titleOffsetWidth}}
                                    onChange={this.onChangeTitle} 
                                />
                            }
                        </span>
                        
                    </Space>
                </span>
                
            </div>
        )
    }
    private isTestRunSuccess() {
        let { runStatus, runNodeStatus = {} } = this.state;
        if (runStatus == 'runed') {
            return !runNodeStatus.NODE_BREAK  ? true : Object.keys(runNodeStatus.NODE_BREAK).length ==0 
        }

        return false;
    }
    private renderPublishContent() {
        let { value = {} } = this.state;
        let version: any = this.state.version || '';
        let versionSplit: any = version.split('.').map(it => parseInt(it, 10));
        let versionOne: string = [versionSplit[0], versionSplit[1], versionSplit[2] + 1].join('.');
        let versionTwo: string = [versionSplit[0], versionSplit[1] + 1, 0].join('.');
        let versionThree: string = [versionSplit[0] + 1, 0, 0].join('.')

        return (
            <Menu 
                rootClassName='mircoflow-publish'
                selectable={false}
                onClick={(item)=> {
                    if (item.key == 'history') {
                        this.setState({
                            openVersion: true,
                            openPublish: false
                            
                        })
                    } else {
                        // 先检查运行状态

                        if (this.isTestRunSuccess()) {

                            // 发布
                            this.setState({publishing: true,openPublish:false})

                            this.props.onPublishValue({
                                id:value.id,
                                version: item.key,
                            // fromVersion: this.state.version,
                                title: value.title,
                                type: value.classify,
                                description: value.description,

                                nodes: this.state.nodes,
                                connectors: this.state.connectors
                            }).then(()=> {
                                this.setState({
                                    version: item.key,
                                    isPublish: true,
                                    publishing: false
                                })
                            }).catch(()=>{
                                this.setState({
                                    publishing: false
                                })
                            })
                        } else {
                            notification.warning({
                                //title: 'dd',
                                duration: 4,
                                message: 'Please click the “Run test” button in the lower-left corner before proceeding with the release, and only perform the release after the tests have successfully passed.'
                            })
                        }

                    }
                }}
                items={[
                    {
                        key: versionOne,
                        icon: <Icons.PublishUtilityFilled/>,
                        label: 'Upgrade to ' + versionOne
                    },
                    {
                        key: versionTwo,
                        icon: <Icons.PublishUtilityFilled/>,
                        label: 'Upgrade to ' + versionTwo
                    },
                    {
                        key: versionThree,
                        icon: <Icons.PublishUtilityFilled/>,
                        label: 'Upgrade to ' + versionThree
                    },
                    {
                        key: 'split',
                        type: 'divider'
                    },
                    {
                        key: 'history',
                        icon: <HistoryOutlined/>,
                        label: 'Publish History'
                    }
                ]}
            ></Menu>
        )
    }
    public renderActionToolbar() {
        return (
            <div className='ui-mircoflow-action-toolbar'>
                <Space>
                {this.state.classifyLabel && <span className='ui-tag'><Tooltip title={this.state.classifyLabel.label}>{UtilsTool.renderIconComponent(this.state.classifyLabel)}</Tooltip></span>}
                    {!this.props.isTemplate && false && <MagicSwitch  size="default" loading={true}  value={this.state.status} onChangeValue={(state: boolean)=> {
                        this.setState({
                            status: state
                        })
                        return this.props.onEditorValue({id: this.state.value.id,  status: state}, 'status');
                    }}/>}
                     {!this.props.isViewer && <Tooltip placement="top" title={i18n.t('Publish')}>
                        <Popover rootClassName='ui-publish-wrapper' open={this.state.openPublish} content={this.renderPublishContent()} onOpenChange={(v)=>this.setState({openPublish: v})} trigger={'click'}  >
                            <Button loading={this.state.publishing} icon={<Icons.PublishUtilityFilled/>}><span className='ui-empty'>{!this.state.isPublish && '(Unpublished)'}</span>{this.state.version}</Button> 
                        </Popover>
                    </Tooltip>}
                    <Tooltip placement="top" title={i18n.t('Auto align the {pageType}', {pageType: this.props.pageType})}>
                        <Button onClick={()=> {
                            this.miniFlow.doFormatNodeCanvas()
                        }} icon={<Icons.AutoAlignUtilityOutlined/>}/>
                    </Tooltip>
                    <Tooltip placement="top" title={i18n.t('Auto zoom the {pageType}', {pageType: this.props.pageType})}>
                        <Button onClick={()=> {
                            this.miniFlow.doZoomNodeCanvas();
                        }} icon={<Icons.AutoZoomUtilityOutlined/>}/>
                    </Tooltip>
                    {false&&<Dropdown.Button loading={this.state.editLoading} onClick={() => {this.doAction('edit')}} menu={{items: [{label: i18n.t('Clone'), key: 'clone', icon: <CopyOutlined/>}], onClick: this.doAction}}>
                        <FormOutlined />
                    </Dropdown.Button>}
                </Space>
            </div>
        )
    }
    public renderNewNodeToolbar() {
        return null;
    }
    public addNewNodeByPostion =(nodeInfo: any, postion: any) => {
        let width: number = postion.width;
        let height: number = postion.height;
        this.miniFlow.stopAutoSave();
        
        this.miniFlow.addNewNodeByPosition(
            this.getFlowNodeByNodeInfo(nodeInfo)
            , postion.left  + width / 2, postion.top + height / 2,
            ()=> {

                this.miniFlow.startAutoSave();
                this.miniFlow.canvasFormat.format();

            }
        );
        
        this.miniFlow.unfreeze();
    }
    public getFlowNodeByNodeInfo(nodeInfo: any) {
        let type: string = nodeInfo.actionType =='trigger' ? 'go' : 'module';
        let icon: any = nodeInfo.icon; 
        let subicon: string = '';
        
        
        if (Array.isArray(icon)) {
            icon = icon[0].replace(/#[a-zA-Z0-9]+/, '')
            subicon = nodeInfo.icon[1] || icon;
        }

        return {
            color: nodeInfo.color,
            icon: icon,
            type: nodeInfo.type || type,
            props: {
                type: type,
                ...omit(nodeInfo, ['props']),
                icon: subicon
            }
        }
    }
    public patchNodeByName = (id: string, {props}) => {
        let nodeInfo: any = this.miniFlow.getNodeByName(id);
        
        if (nodeInfo.props) {
            Object.assign(nodeInfo.props, props)
        } else {
            nodeInfo.props = props;
        }
        
        this.miniFlow.updateNodeByName(id, nodeInfo, true)
    }
    public updateNodeByName =(id: string, nodeInfo: any, isPatch: boolean = false)=> {
        
        if (isPatch) {
            return this.patchNodeByName(id, nodeInfo);
        }
        this.miniFlow.updateNodeByName(id, this.getFlowNodeByNodeInfo(nodeInfo), true)
    }
    public addNodeChildrenByName =(id:string) => {
        this.miniFlow.addChildrenTemplateNodeByName(id)
    }
    public addTriggerNodeById = (id: string, props?: any) => {
        this.miniFlow.addStartNodesByNodeName(id, props)
    }
    private getNodeStatus(node: any) {
        let { runStatus, runNodeStatus  } = this.state;
        
        switch(runStatus) {
            case 'runed':
                if (runNodeStatus && runNodeStatus[node.name]) {
                    let nodeInfo: any = runNodeStatus[node.name];
                    switch(nodeInfo.status) {
                        case 'NODE_BREAK':
                            return {
                                code: 'faild',
                                message: !nodeInfo.childrenProcess && nodeInfo.statusMessage && nodeInfo.statusMessage.message
                            }
                        case 'NODE_FINISH':
                            return 'success'
                    }
                }

            case 'running':
                return runStatus;
            case 'miss':
                return {
                    code: 'miss',
                    message: runNodeStatus[node.name] ? runNodeStatus[node.name].message : ''
                }
                //  处理配置没有设置好的情况
        }
        
    }
    public renderFlowList() {
        if (this.state.loading) {
            return <Spin spinning/>
        }

        return (
            <div 
                id={this.cavnasId}
                className={classnames({
                    'ui-mircoflow-flowlist': true,
                    'ui-mircoflow-onlyone-item': this.state.nodes.length == 1
                })}
                ref={ref => this.canvasPanel = ref}
            >
                {this.state.nodes.length ? this.state.nodes.map(node => {
                    
                    let nodeStatus: any = this.getNodeStatus(node);
                    let status: string = nodeStatus ? nodeStatus.code || nodeStatus : '';
                    let statusMessage: string = nodeStatus ? nodeStatus.message : '';


                    return <MircoFlowNode fetchMap={this.props.fetchMap} key={[this.state.reflush,node.name].join('')} {...node} 
                        onUpdateNode={(id,nodeInfo,isPatch)=> {

                            if (this.state.runStatus !=='miss') {   
                                this.setState({
                                    runStatus: '',
                                    runNodeStatus: {}
                                })
                            } else {
                                let runNodeStatus = this.state.runNodeStatus;
                                delete runNodeStatus[node.name];
                                this.setState({
                                    runNodeStatus
                                })
                            }
                            this.updateNodeByName(id,nodeInfo,isPatch)
                        }}
                        classify={this.state.classify}
                        onAddNodeChildren={this.addNodeChildrenByName}
                        onAddTriggerNode={this.addTriggerNodeById}
                        mircoFlow={this}
                        status={status}
                        statusMessage={statusMessage}
                        activateList={this.state.activateList}
                        workflowId={this.props.workflowId}
                        getFormerSchema={this.props.getFormerSchema}
                        isViewer={this.props.isViewer}
                        onMouseEnter={(name)=> {
                            this.miniFlow.resetIterationRelevantMap();
                    
                            this.setState({
                                activateList: this.miniFlow.getCurrentIterationRelevantMap(name)
                            })
                        }}
                        onMouseLeave={()=> {
                            this.setState({
                                activateList: []
                            })
                        }}
                        onChangeProps={(v)=>{
                            this.updateNodeByName(node.name,{
                                props: Object.assign({}, node.props, v),
                                // 特殊处理
                                connection: node.props.connection,
                            })
                        }}
                    />
                }) : <MircoNewFlowNode workflowType={this.state.workflowType} key={1} onAddNewNode={this.addNewNodeByPostion} fetchMap={this.props.fetchMap} />}
            </div>
        )
    }
    public renderResponse() {
        return (
            <div  className={classnames({
                'ui-mircoflow-response-wrapper': true
            })}
                ref={(ref) => this.responsePanel = ref}
            >
                <div
                    ref={(ref) => { this.unlinkPanel = ref }}
                    className={classnames({
                        'ui-mircoflow-response-item': true,
                        'chinampa-item': true
                    })
                    }>
                    <Icons.UnlinkUtilityOutlined />
                </div>
            </div>
        )
    }
    private getFormerSchema() {
        if (this.props.getFormerSchema) {
            return this.props.getFormerSchema(this.state.formerType)
        }
        return null
    }
    public onFormerSave = (v:any)=> {
        let value: any = omit(v, ['node','status','version', 'connectors', 'isPublish']);
        let result: any;
        let isEditor: boolean = this.state.formerType == 'edit';
        
        this.setState({ formerVisible: false, editLoading: true});

        if (this.state.formerType == 'edit') {
            this.setState({
                value: {
                    ...this.state.value,
                    ...value
                }
            })
            result = this.props.onEditorValue(value)
        } else {
            result = this.props.onCloneValue(value);
        }

        if (utils.isPromise(result)) {
            result.then(()=> {
                if (!isEditor) {
                    // 刷新
                    this.reloadData();
                }
            }).finally(()=> {
                this.setState({editLoading: false})
            })
        }
    }
    private getValue() {
        let value: any = this.state.value;

        if (this.state.formerType == 'clone') {
            return {
                ...value,
                title: value.title +'_clone'
            }
        }
        return value;
    }
    private onCloseLayer = ()=> {

        if (this.state.connectPropsHasChanged ) {

            // save
            this.miniFlow.updateHighlightConnectProps(this.state.connectProps || {})
            
        }

        this.setState({
            openhelper: true,
            connectPropsHasChanged: false
        })
    }
    private renderConnectSetting() {
        
        return (
            <SmartPage
                id={'1'}
                reflush={this.state.connectId}
                pageURI='/api/thinking/findNodeConfigure'
                name={'FlowControl.connector'}
                type="popover"
                popoverWrapper={false}
                simplicity
                isViewer={this.props.isViewer}
                icon="SettingOutlined"
                props={
                    {
                        defaultFirstTitle: 'Connection',
                        action: 'setting',
                        hideButtons: true
                    }
                }
                params={()=> {
                    let connector:any = this.miniFlow.getHighlightInfo();
                    return {
                        type: 'connector',
                        id: this.state.value.id,
                        target: connector.target,
                        source: connector.source
                    }
                }}
                value={this.state.connectProps}
                onChangeValue={(props)=> {
                    
                // let pickvalue: any = pick(this.state.props, ['icon', 'color'])
                    //console.log(pickvalue, props, 222, this.state.props)
                    
                    this.setState({
                        //  props: props,
                        connectProps: props,
                        connectPropsHasChanged: true
                    })
                }} 
                noToolbar
                open={this.state.openhelper}
                onShow={()=>this.setState({openhelper: true})}
                onClose={()=>this.onCloseLayer()}
            >
                    <div className='ui-connector-helper' ref={this.connectHelperRef}></div>
        </SmartPage>
)
    }
    public render () {
        let formerSchema: any  = this.getFormerSchema();
        return (
            <div ref={this.canvasRef} className={classnames({
                'ui-mircoflow': true,
                'ui-runtest-show': !!this.state.openType,
                'ui-runlog-show': !!this.state.openLog
            })} >
                {formerSchema && <SmartPage  
                    name={this.props.pageType}
                    type='drawer' 
                    uiType='former'
                    simplicity
                    value={this.getValue()}
                    title={(this.state.formerType == 'clone' ? 'Clone' : 'Edit') + ' the '+ this.props.pageType}
                    open={this.state.formerVisible}
                    onChangeValue={this.onFormerSave}
                    onClose={()=>{this.setState({formerVisible:false})}}
                    okText={i18n.t(this.state.formerType == 'clone' ? 'Clone' : 'Save')}
                />}
                {this.renderHeader()}
                {this.renderResponse()}
                {this.renderActionToolbar()}
                <div draggable className='ui-mircoflow-body'>
                    {this.renderFlowList()}
                </div>
                {!this.props.isViewer && <MircoRunTest 
                    fetchMap={this.props.fetchMap} 
                    router={this.router} 
                    getSchema={()=> {
                        return {
                            nodes: this.state.nodes,
                            connectors: this.state.connectors
                        }
                    }}
                    switchRunStatus={(state: 'running' | 'runed', payload?: any)=> {
                        this.setState({
                            runStatus: state,
                            runNodeStatus: payload || {}
                        })
                    }}
                    openType={this.state.openType}
                    historyType={this.state.historyType}
                    historyStartDate={this.state.historyStartDate}
                    historyEndDate={this.state.historyEndDate}
                    runId={this.state.openLog}
                />}
                
                {this.state.openLog && <MircoRunLog  router={this.router} fetchMap={this.props.fetchMap} logId={this.state.openLog} logType={this.state.logType} />}
                {this.renderNewNodeToolbar()}
                {this.state.value.id && <MirceVersionHistory version={this.state.version} onReflush={()=>{ this.reloadData() }} onClose={()=>{this.setState({openVersion:false})}} fetchMap={this.props.fetchMap}  open={this.state.openVersion} id={this.state.value.id}/>}
                <div className='ui-background-dwbg' dangerouslySetInnerHTML={{ __html: mainTexture }}></div>

                {this.renderConnectSetting()}
                
            </div>
        )
    }
}

export default withRouter(PageWorkflowDetail);