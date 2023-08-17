import React from 'react';
import { Tabs, Table } from 'antd';
import { StateX, StateComponent } from '@blocksx-ui/StateX/index';

interface HistoryPanelProps {
    namespace: string;
}


export default class FeedbackHistoryPanel extends StateComponent<HistoryPanelProps> {
    public constructor(props:HistoryPanelProps) {
        super(props)
    }

    public render() {
        return <Table size="small" columns={[
            {
                title: '状态',
                dataIndex: 's',
                key: 's',
                render: (text) => <span>{text}</span>,
              },
              {
                title: '运行时间',
                dataIndex: 't',
                key: 't',
                render: (text) => <span>{text}</span>,
              },
              {
                title: '运行耗时',
                dataIndex: 'yt',
                key: 'yt',
                render: (text) => <span>{text}</span>,
              },
              {
                title: '运行代码',
                dataIndex: 'c',
                key: 'c',
                render: (text) => <span>{text}</span>,
              }
        ]} dataSource={[
            {
                s: '运行中',
                t: '2023/08/16 15:13:35',
                yt: '498 ms',
                c: 'select * from item'
            },
            {
                s: '运行中',
                t: '2023/08/16 15:13:35',
                yt: '498 ms',
                c: 'select * from item'
            },
            {
                s: '运行中',
                t: '2023/08/16 15:13:35',
                yt: '498 ms',
                c: 'select * from item'
            }

        ]} />;
    }
}