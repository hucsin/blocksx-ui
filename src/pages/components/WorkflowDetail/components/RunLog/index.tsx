import React from 'react';

import { Space, Descriptions, Divider} from 'antd';
import { Icons, ErrorMessage, Tabler } from '@blocksx/ui';
import { UserOutlined, CloseCircleFilled, TranslationOutlined } from '@ant-design/icons';


import { FetchMap } from '../../typing';

import './style.scss'

interface RunLogProps {
    router: any;
    fetchMap: FetchMap;
    logId: string;
    logType: string;
}

interface RunLogState {
    logId: string;
    runId: string;
    logType: string;
    title: string;
    author: string;
    dataTransfer:string;
    version: string;
    duration: string;
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
            duration: ''
        }
        this.router = props.router;
    }
    public componentWillUpdate(newProps: any) {

        if (newProps.logId !== this.state.logId) {
            this.setState({
                logId: newProps.logId,
                runId: this.getRunId(newProps.logId)
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
        return (
            <span>
                <Icons.HistoryUtilityOutlined/>
                {this.state.title}
            </span>
        )
    }
    public render() {
        return (
            <div className='ui-mircoflow-log'>

                <Descriptions column={1} title={this.renderTitle()}>
                     <Descriptions.Item label="RunId">{this.state.runId}</Descriptions.Item>
                     <Descriptions.Item label="Duration">{this.state.duration}</Descriptions.Item>
                     <Descriptions.Item >
                        <Space>
                            <span><UserOutlined/>{this.state.author}</span>
                            <span><Icons.HistoryUtilityOutlined/>{this.state.version}</span>
                            <span><TranslationOutlined/>{this.state.dataTransfer}</span>
                        </Space>
                     </Descriptions.Item>
                </Descriptions>
                <div onClick={this.onCloseLogPanel} className='ui-mircoflow-log-close'><CloseCircleFilled/></div>
                <Divider plain>Run logs</Divider>
                <Tabler.TablerList
                    maxIcon={1}
                    minIcon={1}
                    size='small'
                    classify="mini"
                    actionSize='small'
                    iconKey='status'
                    iconMaps={{
                        Success: 'CheckCircleOutlined',
                        Error: 'WarningOutlined',
                        Runing: 'LoadingOutlined'
                    }}
                    renderItemContent ={(rowItem: any, index: number)=> {
                        if (rowItem.status == 'Error') {
                            return (
                                <ErrorMessage key={index} errorMessage={rowItem.errorMessage} />
                            )
                        }
                        return null;
                    }}
                    renderListItemExtra={(rowItem: any, index: number)=> {
                        return (
                            <span className='ui-step-number'>#{rowItem.stepNumber}</span>
                        )
                    }}
                    renderItemClassName ={it => `ui-runlog-${it.type}`}
                    onFetchList = {(pageNumber: number, pageSize:number, params: any) => {
                        return (this.props.fetchMap['logs'] as any)(pageNumber, pageSize, {
                            ...params,
                        }).then(data => {

                            this.setState({
                                title: data.title,
                                duration: data.duration,
                                version: data.version,
                                author: data.author,
                                runId: data.runId,
                                dataTransfer: data.dataTransfer
                            })
                            return data;
                        })
                    }}
                    renderExtra={()=>{}}
                ></Tabler.TablerList>
            </div>
        )
    }
}