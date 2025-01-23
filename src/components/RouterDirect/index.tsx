import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Spin } from 'antd';

import { utils } from '@blocksx/core';

import * as Icons from '../Icons';

import SmartRequest from '../utils/SmartRequest';
import { WithRouterSmartPage }  from '../SmartPage';
import { WithRouterSmartPageGroup } from '../SmartPage/group';

import './device.scss';

export default class RouterDirect extends React.Component<{pageComponentMap: any}, {loading: boolean, router: any, message: string}> {
    private onFetchPageTree: any = SmartRequest.makeGetRequest('/eos/resources/findTree');
    public constructor(props: any) {
        super(props);

        this.state = {
            loading: false,
            message: '',
            router: null
        }
    }
    public componentDidMount() {

        let router: any = window.location.pathname.replace(/\/h5/, '');

        this.onFetchPageTree({}).then((result) => {
            if (utils.isValidArray(result)) {
                let findRouter: any = result.find(it=> it.pagePath == router);

                if (findRouter) {
                    return this.setState({
                        router: findRouter
                    })
                }
                this.setState({
                    message: 'Invalid request parameters. Please check the information.'
                })
            }
        })
    }
    private renderRouterItem = (router: any, index: number)=> {
        let PageComponentMap: any = this.props.pageComponentMap || {};
        let RouterComponent: any = PageComponentMap[router.componentName];

        switch (router.pageType) {
            case 'SmartPage':
                return (
                    <WithRouterSmartPage {...router.pageParams} key={index} name={router.componentName} />
                )
            case 'SmartPageGroup':
                return (
                    <WithRouterSmartPageGroup {...router.pageParams} key={index} name={router.componentName} />
                )
            default:

                return  RouterComponent 
                    ? <RouterComponent {...router.pageParams} key={index}/> 
                    : <PageComponentMap.PageNotFound key={index}/>

        }

    }
    public renderMain() {
        return (
            <Spin spinning={!this.state.router}>
                <div className='router-direct-wrapper'>
                    { this.state.router ? <div className='logo'><Icons.AnyhubsBrandFilled/></div> : null}
                    {
                        this.state.router ? this.renderRouterItem(this.state.router, 0) : <div className='router-loading'>loading</div>
                    }
                </div>
            </Spin>
        )
    }
    public render() {
        
        return (
            <BrowserRouter>
                <Routes>
                    <Route path={window.location.pathname} element={this.renderMain()}></Route>
                </Routes>
            </BrowserRouter>
        )
    }

}