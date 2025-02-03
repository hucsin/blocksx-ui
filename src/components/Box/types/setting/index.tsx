import React from 'react';

import './style.scss';
import { List ,Tag, Typography, Avatar, Space} from 'antd';

import BoxSettingInput from './components/input';
import BoxSettingSelect from './components/select';
import BoxSettingAvatar from './components/avatar';
import BoxSettingSwitch from './components/switch';
import BoxSettingButton from './components/button';
import BoxSettingQrcode from './components/qrcode';

import BoxManger from '../../BoxManger';

import SmartRequest from '../../../utils/SmartRequest';
import TablerUtils from '../../../utils/tool';

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
        let settingIndex = value[item.settingIndexKey];
        let settings = item.setting || [];

        let setting = Array.isArray(settings) ? settings[typeof settingIndex == 'number' ? settingIndex : 0] : settings;
        
        return (
            <List.Item key={item.email}>
              <List.Item.Meta
                avatar={avatar ? avatar.includes('.') ? <Avatar src={avatar} size={48} /> : TablerUtils.renderIconComponent({icon: avatar, size: 40}) : null}
                title={item.titleKey && value[item.titleKey] || item.title}
                description={item.descriptionKey && value[item.descriptionKey] || item.description}
              />
              <Space>
                {this.renderTips(item, value)}
                {this.renderAction(setting || {}, value[item.valueKey || item.dataKey], item.valueKey || item.dataKey)}
              </Space>
            </List.Item>
        )
    }
    private renderTips(item: any, value: any) {
        
        if (item.plan == value.plan) {
            if (value.success) {
                return (
                    <Tag bordered={false} color="success">{value.success}</Tag>
                )
            } else if (value.error) {
                return (
                    <Tag bordered={false} color="error">{value.error}</Tag>
                )
            }
        }
        return null;
    }
    public renderAction(setting: any, value?: any, valueKey?: string) {
        
        switch (setting.type) {
            case 'qrcode':
                return <BoxSettingQrcode {...setting} value={value} object={this.props.value} />
            case 'button':
                return <BoxSettingButton {...setting} value={value} object={this.props.value}  />
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
                if (setting.type) {
                    return <Typography.Paragraph copyable>{value}</Typography.Paragraph>;
                }
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