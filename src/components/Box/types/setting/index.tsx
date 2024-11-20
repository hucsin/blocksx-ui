import React from 'react';

import './style.scss';
import { List ,Button, Typography, Avatar} from 'antd';
import * as FormerTypes from '../../../Former/types';

import BoxSettingInput from './components/input';
import BoxSettingSelect from './components/select';
import BoxSettingAvatar from './components/avatar';
import BoxSettingSwitch from './components/switch';

import BoxManger from '../../BoxManger';
import SmartAction from '../../../core/SmartAction';
import SmartRequest from '../../../utils/SmartRequest';

interface BoxSettingProps {
    meta?: any;
    title: string;
    titleKey?: string;
    value?: any;
    valueKey?: string;

    description: string;
    descriptionKey?: string;
    items: any[];
}

export default class BoxSetting extends React.Component<BoxSettingProps> {
    private helperRequest: any;
    public renderItem = (item: any) => {
        let { value = {} } = this.props;
        let avatar = item.avatarKey && value[item.avatarKey] || item.avatar;
        return (
            <List.Item key={item.email}>
              <List.Item.Meta
                avatar={avatar ? avatar.includes('.') ? <Avatar src={avatar} size={48} /> : <FormerTypes.avatar size={40} icon={avatar} /> : null}
                title={item.titleKey && value[item.titleKey] || item.title}
                description={item.descriptionKey && value[item.descriptionKey] || item.description}
              />
              <div>
                {this.renderAction(item.setting || {}, value[item.valueKey || item.dataKey], item.valueKey || item.dataKey)}
              </div>
            </List.Item>
        )
    }
    public renderAction(setting: any, value?: any, valueKey?: string) {
        switch (setting.type) {
            case 'button':
                return <Button 
                    icon={setting.icon} 
                     size='large'
                    type='default'
                    onClick={() => {
                        if (setting.smartaction) {
                            SmartAction.doAction(setting.smartaction)
                        }
                            }}
                >{setting.label}</Button>
            case 'switch':
                return <BoxSettingSwitch {...setting} value={value} object={this.props.value} onSubmit={this.onSave} valueKey={valueKey} />
            case 'avatar':
                return <BoxSettingAvatar {...setting} value={value} object={this.props.value} onSubmit={this.onSave} valueKey={valueKey} />
            case 'select':
                return (
                    <BoxSettingSelect {...setting} value={value} object={this.props.value} onSubmit={this.onSave} valueKey={valueKey} />
                )
            case 'input':
                return (
                    <BoxSettingInput {...setting} value={value} object={this.props.value} onSubmit={this.onSave} valueKey={valueKey} />
                )
            default:
                return <Typography.Paragraph copyable>{value}</Typography.Paragraph>;
        }
        
    }

    public onSave = (key: string, value: any) => {
        let HelperRequest = this.getHelperRequest();
        if (!HelperRequest) {
            return Promise.resolve();
        }
        return HelperRequest({
            [key]: value
        })
    }
    public getHelperRequest() {
        if (this.props.meta && this.props.meta.path) {
            if (this.helperRequest) {
                return this.helperRequest;
            }
            return this.helperRequest = SmartRequest.makePostRequest(this.props.meta.path +'/save')
        }
    }
    
    public render() {
        console.log(this.props,29);
        return (
            <div className='box-setting'>
                <h2>{this.props.title}</h2>
                <p>{this.props.description}</p>
                <div className='box-setting-items'>
                    <List
                        dataSource={this.props.items}
                        renderItem={this.renderItem}
                    />

                </div>
            </div>)
        }
}

BoxManger.set('setting', BoxSetting);