import React from 'react';
import { Tabs, Table } from 'antd';
import { StateX, StateComponent } from '@blocksx/ui/StateX/index';
import { EditorWorkspaceState, EditorFeedbackState } from '@blocksx/ui/Editor/states';
import { utils } from '@blocksx/core';
import './style.scss';

interface RecordPanelProps {
    namespace: string;
}


export default class FeedbackRecordPanel extends StateComponent<RecordPanelProps, { result:any, loading: boolean }> {
    public ListenModels: string[] = [EditorFeedbackState.name];
    private workspaceState: EditorWorkspaceState = StateX.findModel(EditorWorkspaceState);
    private recordMetadataState: any;
    public constructor(props:RecordPanelProps) {
        super(props);
        this.recordMetadataState = this.workspaceState.getCurrentFeedback().get(props.namespace);
        this.state={
            result: [],
            loading: false
        }
    }
    private getAutoWidth(key: string, result: any[]) {
        let maxLength: number = key.length;
        result.forEach(it => {
            maxLength = Math.max(new String(it[key]).length, maxLength);
        })

        return maxLength * 9 + 16;
    }
    private getColumns(result: any) {
        if (result[0]) {
            let keys: string[] = Object.keys(result[0]);
            let columns = keys.map((it, index) => {
                let key = [it, index].join('')
                
                return {
                    key: key,
                    title: it,
                    width: this.getAutoWidth(it, result),
                    ellipsis: true,
                    dataIndex: it, 
                    render:(text,r, i) => {
                        let _k: string =[key,i].join('');
                        if (utils.isUndefined(text) || utils.isNull(text)) {
                            return <i key={_k}>{'<null>'}</i>
                        } 
                        if (utils.isBoolean(text)) {
                            return <span key={_k}>{text ? 'true' : 'false'}</span>;
                        }
                        return <span key={_k}>{text}</span>;
                    }
                }
            });

            columns.unshift({
                key: 'key',
                title: '#',
                width: 20,
                dataIndex: '#',
                fixed: 'left',
                render: (_,r,index)=>{
                    return <span key={index}>{index +1}</span>;
                }
            } as any)

            return columns
        }
    }
    private markDataSource(list: any[]) {
        return list.map((it, index) => {
            return {
                ...it,
                __index: index
            }
        })
    }

    public render() {
        let recordState: any = this.recordMetadataState;
        let resultList: any = recordState.getResultList();

        if (resultList && resultList.length) {
            return (
                <div className='feedback-record-panel'>
                    <Table 
                        size="small"
                        loading={recordState.getLoading()}
                        columns={this.getColumns(resultList) || []} 
                        dataSource={this.markDataSource(resultList)} 
                        scroll={{y: '100%' ,x: 'max-content' }}
                        rowKey="__index"
                    />
                </div>
            );
        }
    }
}