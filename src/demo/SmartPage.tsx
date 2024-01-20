import React from 'react';
import SmartPage from '../components/SmartPage';
import Sidebar from '../components/Sidebar';

import './smartpage.scss';

export default class DemoScenFlow extends React.Component<{}, {page: string}> {
    public constructor() {
        super({})
        this.state = {
            page: 'factorenum'
        }
    }
    public render () {
        
        return (
            <div className="demo-smart-page">
                <Sidebar
                  key={2}
                  currentKey='factorenum'
                  onChange={(e) => {this.setState({page: e})}}
                  menu={[{
                    key: 'factorenum',
                    type: 'Action',
                    name: '要素配置',
                    icon: 'Folder',
                    autoFold: true
                  },
                  {
                    key: 'application',
                    name: '应用管理',
                    icon: 'Scheduled'
                  },
                  {
                    key: 'inbox',
                    name: '收信箱',
                    icon: 'Inbox'
                  },
                
                  {
                    key: 'accessToken',
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
