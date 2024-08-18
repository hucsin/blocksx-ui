import React from 'react';
import { utils } from '@blocksx/core';
import SmartPage from '../components/SmartPage';
import Sidebar from '../components/Sidebar';
import SmartRequest from '../components/utils/SmartRequest'

import './smartpage.scss';

export default class DemoScenFlow extends React.Component<{}, {menu: any, page: string,currentKey ?: string }> {
    private menuRequest: any = SmartRequest.makeGetRequest('/eos/resources/findTree');
    public constructor() {
        super({})
        let cache: any = window.localStorage.getItem('__cache');
        this.state = {
            currentKey: cache || 'workflow', 
            menu: [],
            page: (cache || 'workflow').replace(/([a-z]+\.)/, '')
        }
    }
    public componentDidMount() {
        this.menuRequest({}).then(result => {
            
            let menu: any = [];
            let router: any = [];
            let roadmap: any = [];

            result.sort((a,b ) => a.index > b.index ? -1 : 1).forEach(it => {
                let item: any = {
                    ...it,
                    key: it.value,
                    name: it.label

                }
                // 页面菜单
                if (item.pageMenu) {
                    item.isRoadmap 
                        ? roadmap.push(item) 
                        : menu.push(item)
                }

                if ( item.componentName && item.pagePath) {
                    router.push(item)
                }
            })
            let menuTree: any = utils.array2tree(menu, 'value', 'parent');
            this.setState({
                menu: menuTree,
                currentKey: menuTree[0].key
            })
        })
    }
    public render() {
        if (this.state.menu.length) {
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
                    menu={this.state.menu}
                />
                <SmartPage
                    key={1}
                    name={this.state.page}


                />
            </div>

        )
    } else {
        return null;
    }
    }
}
