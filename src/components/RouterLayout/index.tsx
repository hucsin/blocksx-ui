import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { utils } from '@blocksx/core'

import { WithRouterSmartPage }  from '../SmartPage';
import { WithRouterSmartPageGroup } from '../SmartPage/group';
import SmartRequest from '../utils/SmartRequest';


import PageLayout from './Layout';

interface RouterLayoutProps {
    //页面组件MAP
    pageComponentMap: any;
    defaultMenus?: any;
}

interface RouterLayoutState {
    menu: any[];
    roadmap: any[];
    router: any [];

    currentPage: string;

}

export default class RouterLayout extends React.Component<RouterLayoutProps, RouterLayoutState> {
    private onFetchPageTree: any = SmartRequest.makeGetRequest('/eos/resources/findTree');
    public constructor(props: RouterLayoutProps) {
        super(props)

        this.state = {
            menu: [],
            roadmap: [],
            router: [],
            currentPage: ''
        }
    }

    public componentDidMount() {
        let pathname: string = window.location.pathname;
        // 重定向到welcome
        if (pathname == '/') {

            window.location.href = '/workspace'
        } else {
            // 获取
            if (!pathname.match(/\/login/)) {

                this.onFetchPageTree({}).then((result) => {
                    
                    this.setState(this.pretreatment(result))
                    
                }).catch(() =>{})
            }
        }
    }

    private getMatchMenus = (keypath: string[], menus: any) => {
        let match: any = [];
        let nowPath: any = keypath.shift();
    
        if (nowPath) {
            let find: any = menus.find(it=> it.key == nowPath);
            if (find) {
                match.push(find.key);
                if (find.children) {
                    match = match.concat(this.getMatchMenus(keypath, find.children))
                }
            }
        }
        return match;
    }
    
    private  matchPath = (pathname: string, menu:any, roadmap: any) => {
        let allMenus: any = [...menu, ...roadmap];
        let path: string [] = pathname.replace(/^\//,'').split('/');
        return this.getMatchMenus(path, allMenus)
    }
    private wrapDefault(menu: any) {
        if (menu && menu.length > 0) {
            return menu;
        }
        return this.props.defaultMenus || [];
    }
    private pretreatment (result: any) {
        let menu: any = [];
        let router: any = [];
        let roadmap: any = [];

        this.wrapDefault(result).sort((a,b ) => a.index > b.index ? -1 : 1).forEach(it => {
            let item: any = {
                ...it,
                key: it.value,
                name: it.label,
                type: ''
            }
            // 页面菜单

            if (it.pageType == 'Link') {
                item.type = 'Link';
                item.href= it.pagePath;
            }
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
        
        return {
            menu: menuTree,
            roadmap,
            router,
            currentPage: this.matchPath(window.location.pathname, menuTree,roadmap).join('.') || ''
        }
    }

    private renderRouterItem = (router: any, index: number)=> {
        let PageComponentMap: any = this.props.pageComponentMap;
        let RouterComponent: any = PageComponentMap[router.componentName];

        switch (router.pageType) {
            case 'SmartPage':
                return (
                    <Route key={index} path={router.pagePath} element={<WithRouterSmartPage {...router.pageParams} key={index} name={router.componentName} />} />
                )
            case 'SmartPageGroup':
                return (
                    <Route key={index} path={router.pagePath} element={<WithRouterSmartPageGroup {...router.pageParams} key={index} name={router.componentName} />} />
                )
            default:

                let ViewUI: any = RouterComponent 
                    ? <RouterComponent {...router.pageParams} key={index}/> 
                    : <PageComponentMap.PageNotFound key={index}/>


                return <Route  path={router.pagePath}   key={index}  element ={ViewUI}/>
        }

    }

    private renderRouter() {
        let pageComponentMap: any = this.props.pageComponentMap ||{};
        let routerMap: any[] = this.state.router || [];
        
        return (
            this.state.menu.length ? <BrowserRouter>
                <Routes>
                   <Route 
                        key='more'
                        path="/"
                        element={<PageLayout 
                            menu={this.state.menu} 
                            currentKey={this.state.currentPage}
                            roadmap={this.state.roadmap} 
                            onChange={() => {}}
                        />}
                    >
                        {routerMap.map(this.renderRouterItem)}
                        <Route key={'*'} path="*" element={<pageComponentMap.PageNotFound/>}/>
                    </Route>
                </Routes>
            </BrowserRouter> : <BrowserRouter>
                    <Routes>
                        <Route path="/login" key="login" element={<pageComponentMap.PageLogin key="1"/>}></Route>
                    </Routes>
            </BrowserRouter>
        )
    }

    public render() {
        return (
            <React.Fragment>
                {this.renderRouter()}
            </React.Fragment>
        )
    }
}
