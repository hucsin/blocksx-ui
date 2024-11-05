import React from 'react';
import i18n from '@blocksx/i18n';
import { utils } from '@blocksx/core';

import { Drawer, Button, Space, Popover, Spin } from 'antd';
import * as FormerTypes from '../Former/types';
import SmartPage from '../SmartPage';
import SmartRequest from '../utils/SmartRequest';
import TablerUtils from '../utils/tool';


import withRouter, { routerParams } from '../utils/withRouter';

import './style.scss'

interface SmartDrawerProps {
    router: routerParams;
    open?: boolean;
    type: string;
    value?: any;
    smartpage: string;
    motion?: string;
    icon?: string;
    
    name?: string;
    path?: string;
    pageURI?: string;

    mode?: string;
    notice?: string;

    onClose?: Function;
    width?: number;
    draweroperate?: any;
}

interface SmartDrawerState {
    open?: boolean;
    draweroperate?: any;
    name?: string;
    smartpage: string;
    type: string;
    icon?: string;
    width?: number;

    mode?: string;
    notice?: string;

    loadingIndex?: number;
    errorMessage?: string;
    errorIndex?: number;
    value?: any;
    loading?: boolean;
}
class SmartDrawer extends React.Component<SmartDrawerProps, SmartDrawerState> {
    private defaultErrorTips: string = 'At least one item needs to be selected';
    private defaultNoticeModeMap: any ={
        pickone: 'Select a record from the data in the table below, and the system will automatically establish a binding relationship!',
        pickmore: 'Select some records from the data in the table below, and the system will automatically establish a binding relationship!'
    }
    public constructor(props: SmartDrawerProps) {
        super(props);

        this.state = {
            open : false,
            name: props.name,
            smartpage: props.smartpage,
            type: props.type,
            icon: props.icon,
            mode: props.mode,
            notice: props.notice,
            loading: false,
            width: props.width || this.getDefaultWidth()
        }
    }
    private getDefaultWidth() {
        return Math.min(1200,Math.max(700,document.body.offsetWidth * 3 / 4))
    }
    public UNSAFE_componentWillReceiveProps(newProps: SmartDrawerProps) {
        if (newProps.open != this.state.open) {
            this.setState({
                open: newProps.open
            })
        }
        
        if (newProps.smartpage != this.state.smartpage) {
            this.setState({
                smartpage: newProps.smartpage,
                name: newProps.name,
                type: newProps.type,
                draweroperate: newProps.draweroperate,
                mode: newProps.mode,
                width: newProps.width || this.getDefaultWidth(),
                notice: newProps.notice,
            })
        }
    }
    private onClose = (reflush?: boolean)=> {
        if (this.props.onClose) {
            this.props.onClose(reflush)
        }
        this.setState({
            loading: false
        })
    }
    private onChangeValue=(value)=> {
        this.setState({
            value,
            errorIndex: undefined
        })
    }
    private doSmartAction(action: any) {
        if (action) {
            switch(action.type) {
                case 'router':
                    if (this.props.router) {
                        this.props.router.utils.goPath(action.router, action);
                    }
                    break;
            }
        }
    }
    private onSelectedValue =(value)=> {
        let { mode, motion } = this.props;
        if (mode == 'pick' && motion) {
            let requestHelper: any = SmartRequest.makePostRequest(motion);
            this.setState({loading:true})
            requestHelper(utils.pick(value, ['id'])).then((result) => {
                
                if (result.smartaction) {
                    this.doSmartAction(result)
                }
            })
        }
    }
    private showErrorMessage(message: string, index: number) {
        this.setState({
            errorIndex: index,
            errorMessage: message
        })
        
        setTimeout(()=> {
            this.setState({
                errorIndex: undefined
            })
        }, 3000)
    }
    private onClick (operate: any, index: number) {
        let { value, loadingIndex } = this.state;
        
        if (utils.isUndefined(loadingIndex)) {
            switch(operate.type) {
                // 需要带记录值的请求
                case "record.motion":
                    if (operate.motion) {
                        
                        if (!utils.isValidValue(value)) {
                            
                            this.showErrorMessage(operate.notice || this.defaultErrorTips, index)
                            
                        } else {
                            let motion: Function = SmartRequest
                                        .makePostRequestByMotion(operate.motion, this.props.path || '');

                            this.setState({
                                loadingIndex: index
                            }, () => {

                                motion({
                                    value
                                }).then(()=> {
                                    this.setState({
                                        errorIndex: undefined,
                                        loadingIndex: undefined,
                                    })
                                    this.onClose(true);
                                }).catch(e => {
                                    this.setState({loadingIndex: undefined})
                                    e && this.showErrorMessage(e, index)
                                })

                            })
                        }
                    }
                    break;
            }
        }
    }

    private onInitPage=(pageInit: any)=> {
        
        if (this.state.mode == 'pickmore') {
            Object.assign(pageInit, {
                noFolder: true,
                noHeader: true,
                noToolbar: true,
                rowSelection: true,
                mode: this.state.mode
            })

        }

        this.setState({
            icon: pageInit.icon
        })
    }
    private getNoticeMessage() {

        if (this.state.notice) {
            return this.state.notice;
        }
        return this.defaultNoticeModeMap[this.state.mode || ''] || ''
    }
    private renderFooter() {
        let draweroperate: any = this.state.draweroperate || [];
        let operateList: any = draweroperate.filter(operate => !operate.disabled)
        
        return (
            <Space>
                {operateList.map((operate: any, index: number) => {
                    return (
                        <Popover key={'2'+index} placement="topLeft" open={index===this.state.errorIndex} content={this.state.errorMessage}>
                            <Button 
                                loading={index==this.state.loadingIndex}
                                key={index}  
                                type={index == 0 ? 'primary' : 'default'}
                                onClick={()=> this.onClick(operate, index)}
                            >
                                {operate.name}
                            </Button>
                        </Popover>
                    )
                })}
                <Button key="-1" onClick={()=>this.onClose()}>{i18n.t('Cancel')}</Button>
            </Space>
        )
    }
    private renderTitle() {
        return (
            <>
                {TablerUtils.renderIconComponent(this.state)}
                {this.state.name}
            </>
        )
    }
    public render() {
        let message: string = this.getNoticeMessage();
        return (
            <Drawer
                open={this.state.open}
                title={this.renderTitle()}
                width={this.state.width}
                onClose={()=>this.onClose()}
                className='ui-former fromer-pick-wrapper ui-smart-drawer'
                footer={this.renderFooter()}
            >
                <Spin spinning={this.state.loading}>
                    {message && <FormerTypes.notice icon={this.state.icon} color={'#ccc'} key={2}  value={message} />}
                    <SmartPage 
                        key={21}
                        pageURI={this.props.pageURI}
                        mode={this.state.mode}
                        //pageMeta={{title: this.state.name}} 
                        name={this.state.smartpage}
                        onInitPage ={this.onInitPage}
                        onChangeValue={this.onChangeValue}
                        onSelectedValue={this.onSelectedValue}
                    ></SmartPage>
                </Spin>
            </Drawer>
        )
    }
}

export default withRouter(SmartDrawer)