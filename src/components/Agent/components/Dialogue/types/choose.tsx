import React from 'react';
import { utils } from '@blocksx/core';
import classnames from 'classnames';
import { Input, Space } from 'antd';
import SmartRequest from '../../../../utils/SmartRequest';
import TablerUtils from '../../../../utils/tool';

import './choose.scss';

interface DialogueChooseProps {
    tips?: string;
    app?: {
        name: string;
        icon: string;
    };
    name: string;
    value: any;
    dataSource: any;
}

interface DialogueChooseState {
    dataSource: any[];
    query: string;
    value: any;
}
export default class DialogueChoose extends React.Component<DialogueChooseProps, DialogueChooseState> {
    public static defaultProps = {
        tips: 'Please choose one {name} below.'
    }
    private helper: any ;
    public constructor(props: DialogueChooseProps) {
        super(props);
        this.state = {
            dataSource: Array.isArray(props.dataSource) ? props.dataSource : [],
            query: '',
            value: props.value
        }

        if (utils.isString(props.dataSource)) {
            this.helper = SmartRequest.makeGetRequest(props.dataSource);
        }
    }
    public componentDidMount() {
        if (this.helper) {
            this.helper({query: this.state.query}).then((res: any) => {
                this.setState({
                    dataSource: res
                })
            })
        }
    }
    private onChoose = (value: any) => {
        this.setState({
            value
        })
    }
    public renderHeader() {
        let { app = {}}:any = this.props;
        let displayName: string  = utils.labelName(app.name || this.props.name)
        return ( <div className='dialogue-choose-header'>
            <Space size={4} className='header-content'>
                {app.icon && TablerUtils.renderIconComponent({icon: app.icon,color:'#000'})}
                {this.props.tips?.replace('{name}', displayName)}
            </Space>
            <Input.Search size='small' placeholder='Filter choose items' onChange={(e) => this.setState({query: e.target.value})}/>
        </div>)
    }

    public render() {
        return (<div className='dialogue-choose'>
            {this.renderHeader()}
            <div className='dialogue-choose-content'>
                {this.props.dataSource.map((item, index) => (
                    <div className={classnames({
                        'dialogue-choose-item': true,
                        'dialogue-choose-item-active': item.value === this.state.value
                    })} key={item.value} onClick={() => this.onChoose(item.value)}>
                        <Space>
                            <div className='item-icon'>{TablerUtils.renderIconComponent({icon: item.value === this.state.value ? 'CheckCircleFilled' : 'CheckCircleOutlined'})}</div>
                            <div className='item-label'>{item.label}</div>
                            <div className='item-description'>{item.description || item.value}</div>
                        </Space>
                    </div>
                ))}
            </div>
        </div>)
    }
}