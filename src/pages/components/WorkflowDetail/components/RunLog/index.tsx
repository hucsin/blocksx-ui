import React from 'react';
import classnames from 'classnames';
import { utils } from '@blocksx/core';
import { Space, Descriptions, Divider, Alert } from 'antd';
import { Icons, ErrorMessage, TablerUtils } from '@blocksx/ui';
import { UserOutlined, CloseCircleFilled, TranslationOutlined } from '@ant-design/icons';
import { MiniFlow as StructuralMiniFlow } from '@blocksx/structural';

import Output from '../Output';

import { FetchMap } from '../../typing';

import './style.scss'

interface RunLogProps {
    router: any;
    fetchMap: FetchMap;
    logId: string;
    value: any;
    logType: string;
    nodeStatus: any;
    onCloseLog?: Function
    onToggleActivate: Function;
}

interface RunLogState {
    logId: string;
    runId: string;
    logType: string;
    title: string;
    author: string;
    dataTransfer:string;
    value: any;
    version: string;
    duration: string;
    nodeStatus: any;
}

export default class RunLog extends React.Component<RunLogProps, RunLogState> {
    private router: any;
    public constructor(props: RunLogProps) {
        super(props);
        this.state = {
            logId: props.logId,
            logType: props.logType,
            runId: this.getRunId(props.logId),
            title: '',
            author: '',
            dataTransfer: '',
            version: '',
            value: props.value,
            duration: '',
            nodeStatus: props.nodeStatus
        }
        this.router = props.router;
    }
    public componentWillUpdate(newProps: any) {

        if (newProps.logId !== this.state.logId) {
            this.setState({
                logId: newProps.logId,
                //value: newProps.value,
                runId: this.getRunId(newProps.logId)
            })
        }
        if (newProps.value !== this.state.value ) {
            this.setState({
                value: newProps.value
            })
        }

        if (newProps.nodeStatus != this.state.nodeStatus) {
            this.setState({
                nodeStatus: newProps.nodeStatus
            })
        }

        if (newProps.logType !== this.state.logType) {
            this.setState({
                logType: newProps.logType
            })
        }
        this.router = newProps.router;
    }
    private onCloseLogPanel = ()=> {
        let { utils } = this.router;
        utils.goQuery({
            logs: ''
        });

        this.props.onCloseLog && this.props.onCloseLog()
        
    }
    private getRunId(logId: string) {
        if (logId) {
            let split: any = logId.split('-');
            if (split.length == 2) {
                return split[1]
            }
        }
    }
    
    public renderTitle() {
        let { value = {} } = this.state;
        return (
            <span>
                <Icons.TimerIntervalUtilityOutlined/>
                {utils.toLocaleDate(value.startAt|| new Date())}
            </span>
        )
    }
    private getTaskDuration() {
        let { value = {} } = this.state;
        let startAt: number = value.startAt;
        let endAt: number = value.endAt || new Date().getTime();

        return utils.formatTimeInterval(endAt -  startAt)
    }
    private getNodeList(schema: any) {
        if (schema) {

            return {
                queue: StructuralMiniFlow.getNodeQueue(
                    schema.connectors || schema.pipes,
                    StructuralMiniFlow.findStartNode(schema.nodes).map(it=> it.name),
                    true
                ),
                nodeMap: StructuralMiniFlow.getNodeMaps(schema.nodes)
            }
        }
    }
    private getDisabled(status: any) {
        switch(status.status) {
            case 'NODE_BREAK':
                if (!status.statusMessage) {
                    return true;
                }
            case 'NODE_FINISH':
                return false;
            case 'NODE_NOT_RUNING':
            default:
                return true;
        }
    }
    private statusMap: any = {
        pending: {
            label: 'Pending',
            color: 'yello'
        },
        progress: {
            label: 'Progress',
            color: 'blue'
        },
        completed: {
            label: 'Completed', color: 'green'
        },
        failed: {
            label: 'Failed', color: 'red' 
        }
    }
    public renderStatus() {
        let { value = {} } = this.state;
        let item: any;

        if (item = this.statusMap[value.status]) {
            return (
                <span style={{color:item.color}}>{item.label}</span>
            )
        }
    }
    private renderEmblem() {
        let { value = {}} = this.state;
        let text: string = value.type == 'test' ? 'TEST' : 'PROD'
        return (
            <div className='ui-emblem' data-text={text}></div>
        )
    }
    public renderItem(node: any, status: any, index: number) {
        
        switch(status.status) {
            case 'NODE_BREAK':
                if (status.statusMessage) {
                    return <Alert 
                    
                        type="error" 
                        showIcon  
                        description= {JSON.stringify(status.statusMessage.message || 'Unknown Error')}
                    />
                }
                break;
            case 'NODE_FINISH':
                
                return (
                    <Alert
                        type="success"
                        showIcon
                        description={<Output 
                            key={node.name}
                            expand={index>=2}
                            nodesStatus={this.state.nodeStatus}
                            nodeStatus={this.state.nodeStatus[node.name]}/>}
                    />
                )
            default:
                return (
                    null
                )

        }
    }
    public render() {
        let { value = {} } = this.state;
        let nodelist: any = this.getNodeList(value.schema)
      
        return (
            <div className='ui-mircoflow-log'>
                {this.renderEmblem()}
                <Descriptions column={1} title={this.renderTitle()}>
                     <Descriptions.Item label="RunId">{value.logId}</Descriptions.Item>
                     <Descriptions.Item label="Duration"> {this.getTaskDuration()}</Descriptions.Item>
                     <Descriptions.Item >
                        <Space>
                            <span><UserOutlined/> {value.createdBy}</span>
                            <span><Icons.HistoryUtilityOutlined/> {value.version}</span>
                            {this.renderStatus()}
                        </Space>
                     </Descriptions.Item>
                </Descriptions>
                <div onClick={this.onCloseLogPanel} className='ui-mircoflow-log-close'><CloseCircleFilled/></div>
                <Divider plain>Run logs</Divider>
                <div className='ui-runlog-body'>
                    {
                        nodelist && nodelist.queue.map((it, index)=> {
                            let node: any = nodelist.nodeMap.get(it) || {};
                            let { props = {}} = node;
                            let status: any = this.state.nodeStatus[node.name] || {};
                            
                            return (
                                <dl 
                                    key={index} 
                                    className={classnames({
                                        'ui-disabled': this.getDisabled(status)
                                    })}
                                    onMouseEnter={()=> {
                                        this.props.onToggleActivate([node.name])
                                    }}
                                    onMouseLeave={()=> {
                                        this.props.onToggleActivate([])
                                    }}
                                >
                                    <dt> {TablerUtils.renderIconComponent(node)} <span className='ui-method'>{props.method}</span> <span className='ui-program'>{props.program}</span>  <span className='ui-serial'>{node.name}</span></dt>
                                    <dd>
                                        {this.renderItem(node, status, index)}
                                    </dd>
                                </dl>
                            )
                        })
                    }
                </div>
            </div>
        )
    }
}