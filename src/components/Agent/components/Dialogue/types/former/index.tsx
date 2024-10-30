import React from 'react';
import { utils } from '@blocksx/core';
import classnames from 'classnames'; 
import Former from '../../../../../Former';
import Choose from '../choose/index';
import TablerUtils from '../../../../../utils/tool';
import './styles.scss';
import { Tooltip } from 'antd';

interface DialogueFormerProps {
    app: any;
    value: any;
    first?: any;
    disabled?: any;
    schema: any;
    onSubmit?: (value: any) => Promise<any>;
}

interface DialogueFormerState {
    value: any;
    stepone: boolean;
    step: boolean;
    loading: boolean;
    disabled?: boolean;
    
}

export default class DialogueFormer extends React.Component<DialogueFormerProps, DialogueFormerState> {
    private formerSchema: any;
    public constructor(props: DialogueFormerProps) {
        super(props);
        this.state = {
            value: props.value || {},
            stepone: props.first ? true : false,
            step: !!props.first,
            loading: false,
            disabled: props.disabled
        }

        this.formerSchema = Former.JSONSchema2FormerSchema.convert(props.schema);
    }
    public UNSAFE_componentWillReceiveProps(nextProps: DialogueFormerProps) {
        if (nextProps.value != this.state.value) {
            this.setState({value: nextProps.value});
        }
        if (nextProps.disabled != this.state.disabled) {
            this.setState({disabled: nextProps.disabled});
        }
    }
    public renderFormer() {
        let { first = {} } = this.props;
        return (
            <div className='dialogue-former-wrapper'>
                <Former 
                    column={1}
                    schema={this.formerSchema} 
                    value={this.state.value}
                    loading={this.state.loading}
                    okText='Submit'
                    okIcon ='PublishUtilityFilled'
                    cancelText='Empty Data'
                    cancelType='link'
                    onCancel={() => {
                        this.setState({value: utils.pick(this.state.value, [first.name])})
                    }}
                    onSubmit={(value) => {
                        this.setState({loading: true}); 
                        return this.props.onSubmit?.(value).finally(() => {
                            this.setState({loading: false});
                        });
                    }}
                />
            </div>
        )
    }
    
    public renderChoose() {
        let { first = {} } = this.props;
        let { value = {} } = this.state;
        let displayValue = value[first.name];
        return (
            <Choose 
                app={this.props.app} 
                tips={'First, please select the {name} below.'}
                value={displayValue} 
                name={first.name} 
                dataSource={first.dataSource} 
                extra={!this.state.stepone && first && <Tooltip title='Go First'><span className='back-btn' onClick={() => this.setState({stepone: true})}>{TablerUtils.renderIconComponent({icon: 'GoLeftDirectivityFilled'})}</span></Tooltip> }
                onChange={(val, item) => {
                    value[first.name] = val;
                    this.setState({value, stepone: false});
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