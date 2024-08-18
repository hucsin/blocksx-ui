import React from 'react';
import { Drawer, Alert, Space, Button,Popconfirm } from 'antd';
import i18n from '@blocksx/i18n';

import { Tabler, FormerTypes } from '@blocksx/ui';

import { UserOutlined } from '@ant-design/icons'

import './style.scss'

interface VersionHistoryProps {
    id: string;
    open: boolean;
    fetchMap:any;
    onClose: Function;
    onReflush: Function;

    version?: string;
}

interface VersionHistoryState {
    open: boolean;
    reflush: number;
    version: string;
}

export default class VersionHistory extends React.Component<VersionHistoryProps, VersionHistoryState> {
    private fetchVersionHistory: any;
    private fetchRestoreHistory: any;
    private fetchDeleteHistory: any;

    public constructor(props: VersionHistoryProps) {
        super(props);

        this.state = {
            open: props.open,
            reflush: +new Date(),
            version: props.version || ''
        }

        if (props.fetchMap) {
            this.fetchVersionHistory = props.fetchMap['versionHistory'];
            this.fetchRestoreHistory = props.fetchMap['restoreHistory'];
            this.fetchDeleteHistory = props.fetchMap['deleteHistory'];
        }
    }
    public UNSAFE_componentWillUpdate(newProps: VersionHistoryProps) {
        if (newProps.open !== this.state.open) {
            this.setState({
                open: newProps.open,
                reflush: newProps.open ? +new Date : this.state.reflush
            })
        }
        if (newProps.version && newProps.version !== this.state.version) {
            this.setState({
                version: newProps.version
            })
        }
    }
    private removeHistory = (item: any) => {
        if (this.fetchDeleteHistory) {
            return this.fetchDeleteHistory({
                id: item.id
            }).then(() => {
                this.setState({
                    reflush: +new Date
                })
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
        if (!this.state.open) {
            return null;
        }
        return (
            <Drawer
                className='ui-former ui-workflow-versionhistory'
                title={i18n.t('Publish Version History')}
                open={this.state.open}
                width={600}
                onClose={()=> {this.onClose()}}
            >  
                <FormerTypes.notice  value="Viewing the publish history of the version, restoring the history is risky, so be cautious when operating"/>
                <Tabler.TablerList
                    maxIcon={1}
                    minIcon={1}
                    size='small'
                    avatarSize={40}
                    titleKey="version"
                    avatarShape='square'
                    actionSize='small'
                    reflush={this.state.reflush}
                    renderRowTitle={(item)=> {
                        return item.version;
                    }}
                    renderRowDescription={(item) => {
                        return (<Space>
                            { item.fromVersion && <span className='ui-empty'>(from {item.fromVersion})</span>}
                            {item.createdBy && <span className='ui-empty'><UserOutlined/>{item.createdBy}</span>}
                        </Space>)
                    }}
                    actionMap={[
                        {value: 'restore', confirm: "Confirm whether to restore to version {version}", action : this.restoreHistory, label: 'Restore'}
                    ]}
                    renderRowOperater={(item)=> {
                        if (item.version == this.state.version) {

                            return 'Current Version';
                        } else {
                            return (
                                <Space size={'small'}>
                                    <Popconfirm title={`Confirm whether to delete this version ${item.version}.`} onConfirm={()=> {
                                        this.removeHistory(item)
                                    }}>
                                        <Button type='link' danger size="small">Remove</Button>
                                    </Popconfirm>
                                    <Popconfirm title={`Confirm whether to restore to version ${item.version}.`} onConfirm={()=> {
                                        this.restoreHistory(item)
                                    }}>
                                        <Button type='link' size="small">Restore</Button>
                                    </Popconfirm>
                                </Space>
                            )
                        }
                    }}
                    renderItemClassName={it => `ui-runlog-${it.type}`}
                    renderRowAvatar={()=><FormerTypes.avatar shape='square' color="transparent" icon="HistoryOutlined"/>}
                    onFetchList={(params: any) => {
                        console.log(params, 333)
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