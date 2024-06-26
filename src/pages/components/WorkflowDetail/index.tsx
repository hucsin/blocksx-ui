import React from 'react';
import { Button, Space, Dropdown, Tooltip, Popover, Menu, Spin } from 'antd';

import { utils } from '@blocksx/core';
import i18n from '@blocksx/i18n';

//import  { FlowNodeType,FlowNode } from '../ScenFlow/MiniFlow/typing'
import { FlowNodeType, FlowNode, FlowConnector, MiniFlow, Icons, SmartPage, FormerTypes} from '@blocksx/ui';

import { FormOutlined, CopyOutlined,HistoryOutlined } from '@ant-design/icons';
import { FetchResult, withRouter } from '@blocksx/ui'
import MircoFlowNode from './FlowNode';
import MircoNewFlowNode from './FlowNode/NewNode';
import MircoRunTest from './RunTest';
import MircoRunLog from './RunLog';
import MirceVersionHistory from './VersionHistory';

import { FetchMap } from './typing';

import { omit } from 'lodash'

import classnames from 'classnames';

import './style.scss'

//import MagicFavorites from '../MagicFavorites';
const MagicFavorites = FormerTypes.rate;
//import MagicSwitch from '../MagicSwitch'
const MagicSwitch = FormerTypes.switch;

interface NodeProps {
    [prop:string] : any;
}

export interface FlowDetailData extends FetchResult {
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
    pageType: string;

    getFormerSchema(formerType: string): any;
   // onToggleFavorites(state: any) :Promise<FetchResult>;
    //onToggleSwitch(state: any): Promise<FetchResult>;
    
    onFetchValue(): Promise<FlowDetailData>;
    onPublishValue(/*id: string, version: string, nodes:MircoFLowNode[], connectors:MircoFLowConnector[]*/ value: any): Promise<FetchResult>,
    onEditorValue(value: any, type?: string): Promise<FetchResult>;
    onCloneValue(value: any): Promise<FetchResult>;
    onSaveFlowList(value: any, nodes:MircoFLowNode[], connectors:MircoFLowConnector[]): Promise<FetchResult>;

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
}

class PageWorkflowDetail extends React.Component<MircoFlowProps, MircoFlowState> {
    private cavnasId: string;
    private responsePanel: any;
    private destoryPanel: any;
    private unlinkPanel: any;
    private canvasPanel: any;
    
    private router: any;
    private miniFlow:MiniFlow;
    public constructor(props: MircoFlowProps) {
        super(props)
        this.router = props.router;
        this.state = {
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
            reflush: 0
        }

        this.cavnasId = utils.uniq('MircoFlow');
        
    }
    
    public componentDidMount() {
       this.reloadData()
    }

    public reloadData() {
        this.setState({loading: true})
        this.props.onFetchValue().then((data: FlowDetailData) => {
            
            this.setState({
                loading: false,
                value: data,
                nodes: data.nodes || [],
                isPublish: data.isPublish,
                connectors: data.connectors || [],
                favorites: data.favorites || false,
                status: data.status,
                version: data.version || '0.0.1',
                reflush: +new Date,
                workflowType: data.classify
            }, ()=> {

                if (this.miniFlow) {
                    this.miniFlow.destory();
                }

                this.initMiniFlow();
                this.bindEvent();
            })
        }, ()=> {
            this.setState({loading: false})
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

    public initMiniFlow() {

        this.miniFlow = new MiniFlow({
            canvas: this.cavnasId,
            
            unlinkChinampaPanel: this.unlinkPanel,
            destoryChinampaPanel: this.destoryPanel,
            chinampaPanel: this.responsePanel,

            templateMap: {
                router: {
                    type: 'router',
                    color: '#87d068'
                },
                new: {
                    type: 'empty',
                    color:'#cccccc'
                }
            },
            nodes: this.state.nodes as FlowNode[],
            connector: this.state.connectors
        });

        this.miniFlow.doZoomNodeCanvas();
        
        if  (this.state.nodes.length == 0) {
            this.miniFlow.freeze();
        }
    }
    public bindEvent() {
        this.miniFlow.on('onChange', (data:FlowDetailData) => {
            
            this.setState({
                nodes: data.nodes,
                isPublish: false,
                connectors: data.connector
            }, () => {
                this.props.onSaveFlowList && this.props.onSaveFlowList(this.state.value, data.nodes, data.connector)
            })
        })
    }
    private getQueryValue(queryKey: string) {
        let { query = {} } = this.router;
        return query[queryKey] || ''
    }

    public goBack() {
        this.router.naviagte(-1);
    }
    public doAction = (e: any)=> {
        this.setState({
            formerVisible: true,
            formerType: typeof e == 'string' ? e : e.key
        })
    }
    public renderHeader() {
        let { value = {} } = this.state;
        return (
            <div className='ui-mircoflow-header'>
                <Icons.LeftCircleDirectivityOutlined onClick={()=>{this.props.router.utils.goPath('/thinking')}} /> 
                <span className='ui-title'>
                    <span className='ui-node'><MagicFavorites loading={true} onChangeValue={(state) => {
                        this.setState({
                            favorites: state
                        })
                        return this.props.onEditorValue({id: this.state.value.id,  favorites: state})
                    }} value={this.state.favorites} /></span>
                    <span className='ui-text'>{value.title}</span>
                </span>
                
            </div>
        )
    }
    private renderPublishContent() {

        let version: any = this.state.version || '';
        let versionSplit: any = version.split('.').map(it => parseInt(it, 10));
        let versionOne: string = [versionSplit[0], versionSplit[1], versionSplit[2] + 1].join('.');
        let versionTwo: string = [versionSplit[0], versionSplit[1] + 1, 0].join('.');
        let versionThree: string = [versionSplit[0] + 1, 0, 0].join('.')

        return (
            <Menu 
                rootClassName='mircoflow-publish'
                onClick={(item)=> {
                    if (item.key == 'history') {
                        this.setState({
                            openVersion: true,
                            openPublish: false
                            
                        })
                    } else {
                        // 发布
                        this.setState({publishing: true,openPublish:false})

                        this.props.onPublishValue({
                            id:this.state.value.id,
                            version: item.key,
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
                    <MagicSwitch unCheckedIcon='StartCircleUtilityFilled' checkedIcon='StopCircleUtilityFilled' size="default" loading={true}  value={this.state.status} onChangeValue={(state: boolean)=> {
                        this.setState({
                            status: state
                        })
                        return this.props.onEditorValue({id: this.state.value.id,  status: state}, 'status');
                    }}/>
                    <Tooltip placement="top" title={i18n.t('Publish')}>
                        <Popover open={this.state.openPublish} content={this.renderPublishContent()} onOpenChange={(v)=>this.setState({openPublish: v})} trigger={'click'}  >
                            <Button loading={this.state.publishing} icon={<Icons.PublishUtilityFilled/>}><span className='ui-empty'>{!this.state.isPublish && '(Unpublished)'}</span>{this.state.version}</Button> 
                        </Popover>
                    </Tooltip>
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
                    <Dropdown.Button loading={this.state.editLoading} onClick={() => {this.doAction('edit')}} menu={{items: [{label: i18n.t('Clone'), key: 'clone', icon: <CopyOutlined/>}], onClick: this.doAction}}>
                        <FormOutlined />
                    </Dropdown.Button>
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

        this.miniFlow.addNewNodeByPosition(
            this.getFlowNodeByNodeInfo(nodeInfo)
            , postion.left  + width / 2, postion.top + height / 2,
            ()=> {
                this.miniFlow.canvasFormat.format()
            }
        );
        
        this.miniFlow.unfreeze();
    }
    public getFlowNodeByNodeInfo(nodeInfo: any) {
        let type: string = nodeInfo.actionType =='trigger' ? 'go' : 'module';
        return {
            color: nodeInfo.color,
            type: nodeInfo.type || type,
            props: {
                type: type,
                ...nodeInfo
            }
        }
    }
    public updateNodeByName =(id: string, nodeInfo: any)=> {
        this.miniFlow.updateNodeByName(id, this.getFlowNodeByNodeInfo(nodeInfo), true)
    }
    public addNodeChildrenByName =(id:string) => {
        this.miniFlow.addChildrenTemplateNodeByName(id)
    }
    public addTriggerNodeById = (id: string) => {
        this.miniFlow.addStartNodesByNodeName(id)
    }
    public renderFlowList() {
        if (this.state.loading) {
            return <Spin/>
        }
        return (
            <div 
                id={this.cavnasId}
                className='ui-mircoflow-flowlist'
                ref={ref => this.canvasPanel = ref}
            >
                {this.state.nodes.length ? this.state.nodes.map(node => {
                    return <MircoFlowNode fetchMap={this.props.fetchMap} key={[this.state.reflush,node.name].join('')} {...node} 
                        onUpdateNode={this.updateNodeByName}
                        onAddNodeChildren={this.addNodeChildrenByName}
                        onAddTriggerNode={this.addTriggerNodeById}
                        mircoFlow={this}
                        getFormerSchema={this.props.getFormerSchema}
                        
                        onChangeProps={(v)=>{
                            this.updateNodeByName(node.name,{
                                props: Object.assign({}, node.props, v)
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
    public render () {
        let formerSchema: any  = this.getFormerSchema();
        return (
            <div className={classnames({
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
                <MircoRunTest 
                    fetchMap={this.props.fetchMap} 
                    router={this.router} 
                    openType={this.state.openType}
                    historyType={this.state.historyType}
                    historyStartDate={this.state.historyStartDate}
                    historyEndDate={this.state.historyEndDate}
                    runId={this.state.openLog}
                />
                {this.state.openLog && <MircoRunLog  router={this.router} fetchMap={this.props.fetchMap} logId={this.state.openLog} logType={this.state.logType} />}
                {this.renderNewNodeToolbar()}
                {this.state.value.id && <MirceVersionHistory onReflush={()=>{ this.reloadData() }} onClose={()=>{this.setState({openVersion:false})}} fetchMap={this.props.fetchMap}  open={this.state.openVersion} id={this.state.value.id}/>}
            </div>
        )
    }
}

export default withRouter(PageWorkflowDetail);