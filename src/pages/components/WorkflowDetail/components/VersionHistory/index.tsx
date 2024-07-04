import React from 'react';
import { Drawer, Alert, Space } from 'antd';
import i18n from '@blocksx/i18n';

import { MircoAvatar, Tabler } from '@blocksx/ui';

import { UserOutlined } from '@ant-design/icons'

import './style.scss'

interface VersionHistoryProps {
    id: string;
    open: boolean;
    fetchMap:any;
    onClose: Function
    onReflush: Function
}

interface VersionHistoryState {
    open: boolean;
    reflush: number;
}

export default class VersionHistory extends React.Component<VersionHistoryProps, VersionHistoryState> {
    private fetchVersionHistory: any;
    private fetchRestoreHistory: any;
    public constructor(props: VersionHistoryProps) {
        super(props);

        this.state = {
            open: props.open,
            reflush: +new Date()
        }

        if (props.fetchMap) {
            this.fetchVersionHistory = props.fetchMap['versionHistory'];
            this.fetchRestoreHistory = props.fetchMap['restoreHistory']
        }
    }
    public UNSAFE_componentWillUpdate(newProps: VersionHistoryProps) {
        if (newProps.open !== this.state.open) {
            this.setState({
                open: newProps.open,
                reflush: newProps.open ? +new Date : this.state.reflush
            })
        }
    }
    private restoreHistory = (historyItem: any)=> {
        return this.fetchRestoreHistory({
            id: this.props.id,
            historyId: historyItem.id
        }).then(()=> {
            this.onClose();
            this.props.onReflush();
        })
    }
    private onClose() {
        this.props.onClose();
    }
    public render() {
        return (
            <Drawer
                className='ui-former ui-workflow-versionhistory'
                title={i18n.t('Publish Version History')}
                open={this.state.open}
                width={600}
                onClose={()=> {this.onClose()}}
            >  
                <Alert showIcon message="Viewing the publish history of the version, restoring the history is risky, so be cautious when operating" type="warning"/>
                <Tabler.TablerList
                    maxIcon={1}
                    minIcon={1}
                    size='small'
                    avatarSize={40}
                    titleKey="version"
                    avatarShape='square'
                    actionSize='small'
                    reflush={this.state.reflush}
                    renderDescription={(item) => {
                        return (<Space>
                            { item.fromVersion && <span className='ui-empty'>({item.fromVersion})</span>}
                            {new Date(item.createdAt).toLocaleString()}
                            {item.createdBy && <span className='ui-empty'><UserOutlined/>{item.createdBy}</span>}
                        </Space>)
                    }}
                    actionMap={[
                        {value: 'restore', confirm: "Confirm whether to restore to version {version}", action : this.restoreHistory, label: 'Restore'}
                    ]}
                    renderItemClassName={it => `ui-runlog-${it.type}`}
                    renderAvatar={()=><MircoAvatar shape='square' color="transparent" icon="HistoryOutlined"/>}
                    onFetchList={(params: any) => {
                        return this.fetchVersionHistory({
                            ...params,
                            id: this.props.id
                        })
                    }}
                ></Tabler.TablerList>
            </Drawer>
        )
    }
}