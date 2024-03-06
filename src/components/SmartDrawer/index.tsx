import React from 'react';
import i18n from '@blocksx/i18n';
import { utils } from '@blocksx/core';

import { Drawer, Alert, Button, Space, Popover, Spin } from 'antd';
import SmartPage from '../SmartPage';
import SmartRequest from '../utils/SmartRequest'

interface SmartDrawerProps {
    open?: boolean;
    type: string;
    smartpage: string;
    icon?: string;
    name?: string;
    path?: string;

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
}
export default class SmartDrawer extends React.Component<SmartDrawerProps, SmartDrawerState> {
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
            width: props.width || document.body.offsetWidth * 2 / 3
        }
    }
    public UNSAFE_componentWillUpdate(newProps: SmartDrawerProps) {
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
                width: newProps.width || document.body.offsetWidth * 2 / 3,
                notice: newProps.notice,
            })
        }
    }
    private onClose = (reflush?: boolean)=> {
        if (this.props.onClose) {
            this.props.onClose(reflush)
        }
    }
    private onChangeValue=(value)=> {
        this.setState({
            value,
            errorIndex: undefined
        })
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
                                        .createPOSTByMotion(operate.motion, this.props.path || '');

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
    public render() {
        let message: string = this.getNoticeMessage();
        return (
            <Drawer
                open={this.state.open}
                title={this.state.name}
                width={this.state.width}
                onClose={()=>this.onClose()}
                className='ui-former fromer-pick-wrapper'
                footer={this.renderFooter()}
            >
                {message && <Alert key={2} showIcon message={message} type='warning' />}
                <SmartPage 
                    key={21}
                    pageMeta={{title: this.state.name}} 
                    name={this.state.smartpage}
                    onInitPage ={this.onInitPage}
                    onChangeValue={this.onChangeValue}
                ></SmartPage>
            </Drawer>
        )
    }
}
