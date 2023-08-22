import React from 'react';
import { Tabs, Table } from 'antd';
import { StateX, StateComponent } from '@blocksx-ui/StateX/index';
import EditorWorkspaceState from '@blocksx-ui/Editor/states/Workspace';


interface HistoryPanelProps {
    namespace: string;
}


export default class FeedbackHistoryPanel extends StateComponent<HistoryPanelProps> {
    private workspaceState: EditorWorkspaceState = StateX.findModel(EditorWorkspaceState);
    private historyMetadataState: any;
    public constructor(props:HistoryPanelProps) {
        super(props);
        this.historyMetadataState = this.workspaceState.getCurrentFeedback().get(props.namespace);
    }
    private getColumns(){
        return [
            {
                title: '运行时间',
                dataIndex: 'time'
            },
            {
                title: '状态',
                dataIndex: 'status',
                render: (it) => {
                    return '成功'
                }
            },
            {
                title: '运行耗时',
                dataIndex: 'cost'
            },
            {
                title: '代码',
                dataIndex: 'code'
            }
        ]
    }
    private getDataSource() {
        let data: any = this.historyMetadataState.getData() || [];
        return data.map((it, index)=> {
            return {
                ...it,
                key: index
            }
        });
    }
    public render() {
        return (
            <Table size="small" key={'reder'} columns={this.getColumns()} dataSource={this.getDataSource()} />
        );
    }
}