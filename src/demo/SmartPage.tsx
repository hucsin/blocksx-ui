import React from 'react';
import SmartPage from '../components/SmartPage';
import Sidebar from '../components/Sidebar';

import './smartpage.scss';

export default class DemoScenFlow extends React.Component<{}, { page: string,currentKey ?: string }> {
    public constructor() {
        super({})
        let cache: any = window.localStorage.getItem('__cache');
        this.state = {
            currentKey: cache || 'factorenum', 
            page: (cache || 'factorenum').replace(/([a-z]+\.)/, '')
        }
    }
    public render() {

        return (
            <div className="demo-smart-page">
                <Sidebar
                    key={2}
                    currentKey={this.state.currentKey}
                    onChange={(e) => { 
                        let page: string = e.replace(/([a-z]+\.)/, '');
                        let key: string = e;
                        this.setState({ page: page }) 
                        window.localStorage.setItem('__cache', key);
                    }}
                    menu={[{
                        key: 'factorenum',
                        type: 'Action',
                        name: '要素配置',
                        icon: 'Folder',
                        autoFold: true
                    },
                    {
                        key: 'cd',
                        name: '数据源中心',
                        icon: 'Scheduled',
                        children: [
                            {
                                key: 'hosts',
                                name: '主机管理',
                                group: '主机',
                                icon: 'Inbox'
                            },
                            {
                                key: 'datasource',
                                group: '数据源中心',
                                autoFold: true,
                                name: '数据源(Datasource)',
                                icon: 'Datasource'
                            },
                            {
                                key: 'schema',
                                group: '数据源中心',
                                autoFold: true,
                                name: '数据库(Schema)',
                                icon: 'FileModel'
                            },
                            {
                                key: 'openapi',
                                group: 'OPENAPI',
                                name: '暴露接口',
                                icon: 'IAPI'
                            }
                        ]
                    },

                    {
                        key: 'application',
                        name: '访问令牌',
                        icon: 'AccessToken'
                    }]}
                />
                <SmartPage
                    key={1}
                    name={this.state.page}

                    router={{}}

                />
            </div>

        )
    }
}
