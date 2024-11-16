import React from 'react';
import { utils } from '@blocksx/core';
import classnames from 'classnames'; 
import Former from '../../../../../Former';
import Choose from '../choose/index';
import TablerUtils from '../../../../../utils/tool';
import './styles.scss';
import { Tooltip,Space } from 'antd';
import * as Icons from '../../../../../Icons';
interface DialogueFormerProps {
    app: any;
    value: any;
    first?: any;
    disabled?: any;
    schema: any;
    firstChooseItem?: any;
    state: any;
    onSubmit?: (value: any,state?: any) => Promise<any>;
}

interface DialogueFormerState {
    value: any;
    stepone: boolean;
    step: boolean;
    loading: boolean;
    disabled?: boolean;
    title?: string;
    firstChooseItem?: any;
}

export default class DialogueFormer extends React.Component<DialogueFormerProps, DialogueFormerState> {
    private formerSchema: any;
    public constructor(props: DialogueFormerProps) {
        super(props);
        this.state = {
            value: props.value || {},
            stepone: this.getDefaultStepOne(props),
            step: !!props.first,
            loading: false,
            disabled: props.disabled,
            ...props.state,
            title: (props?.schema?.title || '').replace(/\.$/,'')
        }

        console.log(props,332323)
        this.formerSchema = Former.JSONSchema2FormerSchema.convert(props.schema);
    }
    private getDefaultStepOne({ first, value }:any) {
        if (first && value) {
            if (first && first.key) {   
                return !value[first.key];
            }   
        }

        return false;
    }
    public UNSAFE_componentWillReceiveProps(nextProps: DialogueFormerProps) {
        if (nextProps.value != this.state.value) {
            this.setState({value: nextProps.value});
        }
        if (nextProps.disabled != this.state.disabled) {
            this.setState({disabled: nextProps.disabled});
        }
    }
    private renderTitle() {
        let { first, app = {} } = this.props;
        
        if (this.state.title) {
            return <Space className='dialogue-tips-title' size={4}>
                        {!first && app.icon ? TablerUtils.renderIconComponent({icon: app.icon}) : !first && <Icons.FileTextOutlined/>}
                        <span>{this.state.title}</span>
                    </Space>
        }
        return null;
    }
    public renderFormer() {
        
        return (
            <div className='dialogue-former-wrapper'>
                <Former 
                    column={1}
                    schema={this.formerSchema} 
                    value={this.state.value}
                    loading={this.state.loading}
                    okText='Submit'
                    title={this.renderTitle()}
                    okIcon ='PublishUtilityFilled'
                    cancelText='Empty Data'
                    cancelType='link'
                    onCancel={() => {
                        //this.setState({value: first ? utils.pick(this.state.value, [first.name]) : this.state.value})
                    }}
                    onSubmit={(value) => {
                        this.setState({loading: true}); 
                        return this.props.onSubmit?.(value, {firstChooseItem: this.state.firstChooseItem}).finally(() => {
                            this.setState({loading: false});
                        })
                    }}
                />
            </div>
        )
    }
    
    public renderChoose() {
        let { first = {} } = this.props;
        let { value = {} } = this.state;
        let displayValue = value[first.key];
        
        return (
            <Choose 
                app={this.props.app} 
                tips={'First, please select the {name} below.'}
                value={displayValue}
                show={this.state.stepone}
                name={first.name} 
                chooseItem={this.state.firstChooseItem}
                dataSource={first.dataSource} 
                extra={!this.state.stepone && first && <Tooltip title='Go First'><span className='back-btn' onClick={() => this.setState({stepone: true})}>{TablerUtils.renderIconComponent({icon: 'GoLeftDirectivityFilled'})}</span></Tooltip> }
                onChange={(val, item) => {
                    value[first.key || first.name] = val;

                    this.setState({value, stepone: false, firstChooseItem: item});
                }}
            />
        )
    }    
    public render() {
        return (
            <div className={classnames({
                'dialogue-former': true,
                'dialogue-former-stepone': this.state.stepone
            })}>
                {this.state.step && this.renderChoose()}
                {this.renderFormer()}
            </div>
        )
    }
}