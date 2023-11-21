import React from  'react';
import ReactDOM from 'react-dom';
import { message, Select, Button } from 'antd';

import { utils } from '@blocksx/core';

import './style.scss';

interface PickOption {
    value?: string;
    key?: string;

    name?: string;
    label?: string;
}

interface PickProps {
    type: 'option' | 'confirm';
    option?: PickOption[];
    value?: string;
    visible?: boolean;
    onChange?: Function;
    onConfirm?: Function;
    onHidden?: Function;

    okText?: string;
    cancelText?: string;
    danger?: boolean;

    maskClosable?: boolean;
    title?: string;
}

interface PickState {
    visible?: boolean;
    value?: any;
    option: PickOption[];
}

export default class Pick extends React.Component<PickProps, PickState> {
    static defaultProps: any = {
        maskClosable: true,
        type: 'option',
        okText: 'Confirm',
        cancelText: 'Cancel'
    }
    private uuid: any ; 
    private visible: boolean;
    public constructor(props: PickProps) {
        super(props);

        this.state = {
            visible: props.visible || false,
            value: props.value,
            option: props.option || []
        }
        this.visible = false;
        this.uuid = utils.uniq('pick')
        this.togglePick();
        
    }

    public UNSAFE_componentWillReceiveProps(newProps: PickProps) {
        if (newProps.visible !== this.state.visible) {
            this.setState({
                visible: newProps.visible
            }, () => {
                this.togglePick();
            })
            
            this.togglePick();
        }
        if (newProps.value !== this.state.value) {
            this.setState({
                value: newProps.value
            })
        }
        
    }
    private onConfirm() {
        if (this.props.onConfirm) {
            this.props.onConfirm();
        }
        this.hidePick(true);
    }
    private renderContent() {

        if (this.props.type =='confirm') {
            return (
                <div className='hoofs-pick-buttons' >
                    <Button size='small' onClick={()=> {this.hidePick(true)}}>{this.props.cancelText}</Button>
                    <Button size='small' type='primary' danger={this.props.danger} onClick={()=>{this.onConfirm()}}>{this.props.okText}</Button>
                </div>
            )
        }

        return (
            <Select
                size='small'
                showSearch
                options={this.state.option.map((it) => {
                    return {
                        value: it.value || it.key,
                        label: it.label || it.name
                    }
                })}
                value ={this.state.value}
                onChange={(v)=> {
                    this.setState({
                        value: v,
                        visible: false
                    })
                    this.hidePick();
                    this.props.onChange && this.props.onChange(v)
                }}
            ></Select>
        )
    }
    public getPickOption() {
        
        return (
            <div className='hoofs-pick-content'>
                <h4>{this.props.title}</h4>
                {this.renderContent()}
            </div>
        )
    }
    public togglePick() {
        if (this.state.visible) {
            this.showPick();
        } else {
            this.hidePick();
        }
    }
    public showPick() {
        if (this.visible == false) {
            this.visible = true;
            message.info({
                key: this.uuid,
                className: 'hoofs-pick',
                duration: 0,
                content: this.getPickOption()
            })
        }
    }
    public hidePick(hide?:boolean) {
        message.destroy(this.uuid)
        this.visible = false;
        hide && this.setState({
            visible: false
        })
        
        if (this.props.onHidden) {
            this.props.onHidden();
        }
    }
    public render() {
        if (this.state.visible) {
            return ReactDOM.createPortal(
                <div 
                    className='hoofs-pick-mask'
                    onClick={() => {
                        if (this.props.maskClosable) {
                            this.hidePick(true);
                            
                        }
                    }}
                ></div>,
                document.body
            )
        } else {
            return null;
        }
    }
}