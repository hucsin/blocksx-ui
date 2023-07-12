import React from  'react';
import ReactDOM from 'react-dom';
import { message, Select } from 'antd';

import { utils } from '@blocksx/core';

import './style.scss';

interface PickOption {
    value?: string;
    key?: string;

    name?: string;
    label?: string;
}

interface PickProps {

    option: PickOption[];
    value?: string;
    visible?: boolean;
    onChange?: Function;

    title?: string;
}

interface PickState {
    visible?: boolean;
    value?: any;
    option: PickOption[];
}

export default class Pick extends React.Component<PickProps, PickState> {
    private uuid: any ; 
    private visible: boolean;
    public constructor(props: PickProps) {
        super(props);

        this.state = {
            visible: props.visible || false,
            value: props.value,
            option: props.option
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
    public getPickOption() {
        
        return (
            <div className='hoofs-pick-content'>
                <h4>{this.props.title}</h4>
                <Select 
                    size='small'
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
    public hidePick() {
        message.destroy(this.uuid)
        this.visible = false;
    }
    public render() {
        if (this.state.visible) {
            return ReactDOM.createPortal(
                <div 
                    className='hoofs-pick-mask'
                ></div>,
                document.body
            )
        } else {
            return null;
        }
    }
}