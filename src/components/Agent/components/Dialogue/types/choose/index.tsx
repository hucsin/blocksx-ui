import React from 'react';
import { utils } from '@blocksx/core';
import classnames from 'classnames';
import { Input, Popover, Space, Tooltip, Button, Spin } from 'antd';
import SmartRequest from '../../../../../utils/SmartRequest';
import TablerUtils from '../../../../../utils/tool';

import './styles.scss';

interface DialogueChooseProps {
    tips?: string;
    app?: {
        name: string;
        icon: string;
    };
    name: string;
    value: any;
    viewer?: boolean;
    dataSource: any;
    onChange?: (value: any, item?: any) => void,
    onSubmit?: (value: any, item?: any) => void,
    extra?: any;
    disabled?: boolean;
}

interface DialogueChooseState {
    dataSource: any[];
    query: string;
    value: any;
    errorMessage: string;
    loading: boolean;
    disabled?: boolean;
}
export default class DialogueChoose extends React.Component<DialogueChooseProps, DialogueChooseState> {
    public static defaultProps = {
        tips: 'Please choose one {name} below.'
    }
    private helper: any;
    public constructor(props: DialogueChooseProps) {
        super(props);
        this.state = {
            dataSource: Array.isArray(props.dataSource) ? props.dataSource : [],
            query: '',
            value: props.value,
            errorMessage: '',
            loading: false,
            disabled: props.disabled
        }

        if (utils.isString(props.dataSource)) {
            this.helper = SmartRequest.makeGetRequest(props.dataSource);
        }
    }
    public UNSAFE_componentWillReceiveProps(nextProps: DialogueChooseProps) {
        if (nextProps.disabled !== this.state.disabled) {
            this.setState({
                disabled: nextProps.disabled
            })
        }
    }
    public componentDidMount() {
        if (this.helper) {
            this.helper({ query: this.state.query }).then((res: any) => {
                this.setState({
                    dataSource: res
                })
            })
        }
    }
    private onChoose = (value: any) => {
        this.setState({
            value,
            errorMessage: ''
        })

        this.props.onChange?.(
            value,
            this.state.dataSource.find((item: any) => item.value === value)
        );
    }
    private renderTips() {
        let { app = {} }: any = this.props;
        let { value, dataSource = [] } = this.state;

        if (!value) {
            let displayName: string = utils.labelName(app.name || this.props.name)
            return <span>{this.props.tips?.replace('{name}', displayName)}</span>
        }
        let find: any = dataSource.find((item: any) => item.value === value);

        return find ? <Space size={4}>
            <span>Selected {utils.labelName(app.name || this.props.name)}:</span>
            <Tooltip title={utils.labelName(find?.description || find?.value)}>{find.label || find.value}</Tooltip>
            {this.props.extra}
        </Space> : value;
    }
    public renderHeader() {
        let { app = {} }: any = this.props;
        return (<div className='dialogue-choose-header'>
            <Space size={4} className='header-content'>
                {app.icon && TablerUtils.renderIconComponent({ icon: app.icon, color: '#000' })}
                {this.renderTips()}
            </Space>
            {this.helper && <Input.Search size='small' placeholder='Filter choose items' onChange={(e) => this.setState({ query: e.target.value })} />}
        </div>)
    }
    private onSubmit() {
        if (this.state.value) {
            this.setState({
                loading: true
            })
            this.props.onSubmit?.(this.state.value, this.state.dataSource.find((item: any) => item.value === this.state.value)).finally(() => {
                this.setState({
                    loading: false
                })
            });
        } else {
            this.setState({
                errorMessage: 'Options need to be selected.'
            })
        }
    }
    public canInput() {
        return !this.props.viewer && !this.state.disabled;
    }
    public render() {
        return (<div className='dialogue-choose'>

            <Spin spinning={this.state.loading}>
                {this.renderHeader()}
                <div className='dialogue-choose-content'>
                    {this.props.dataSource.map((item, index) => {
                        let isActive = item.value === this.state.value;
                        if (this.props.viewer) {
                            if (!isActive) {
                                return null;
                            }
                        }

                        return (

                            <div className={classnames({
                                'dialogue-choose-item': true,
                                'dialogue-choose-item-viewer': (!this.canInput()),
                                'dialogue-choose-item-active': isActive
                            })} key={item.value} onClick={!this.canInput() ? undefined : () => this.onChoose(item.value)}>
                                <Space>
                                    <div className='item-icon'>{TablerUtils.renderIconComponent({ icon: isActive ? 'CheckCircleFilled' : 'CheckCircleOutlined' })}</div>
                                    <div className='item-label'>{item.label}</div>
                                    <div className='item-description'>{item.description || item.value}</div>
                                </Space>
                            </div>
                        )
                    })}
                </div>
                {this.canInput() && this.props.onSubmit && <Space>{<Button type='primary' size='small' onClick={() => this.onSubmit()} icon={TablerUtils.renderIconComponent({ icon: 'PublishUtilityFilled' })}>Submit</Button>}{this.state.errorMessage}</Space>}
            </Spin>
        </div>)
    }
}