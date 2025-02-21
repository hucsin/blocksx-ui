import React from 'react';
import { utils } from '@blocksx/core';
import { List ,Tag, Typography, Avatar, Space, Popover} from 'antd';

import * as Icons from '../../../Icons';

import * as BoxTypes from './components'

import BoxManger from '../../BoxManger';

import SmartRequest from '../../../utils/SmartRequest';
import TablerUtils from '../../../utils/tool';
import withRouter from '../../../utils/withRouter';
import './style.scss';

interface BoxSettingProps {
    meta?: any;
    title: string;
    titleKey?: string;
    value?: any;
    valueKey?: string;
    router: any;

    description: string;
    descriptionKey?: string;
    items: any[];
}

class BoxSetting extends React.Component<BoxSettingProps> {
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
                title={this.renderTitle(item,value)}
                description={item.descriptionKey && value[item.descriptionKey] || item.description}
              />
              <Space>
                {this.renderTips(item, value)}
                {this.renderAction(setting || {}, value[item.valueKey || item.dataKey], item.valueKey || item.dataKey, item)}
              </Space>
            </List.Item>
        )
    }
    private renderTitle(item: any, value: any) {
        return (
            <>
                {item.titleKey && value[item.titleKey] || item.title}
                {item.subscription && this.renderSubscription(value)}
            </>
        )
    }
    private onClick =()=> {
        this.props.router.naviagte('/subscription')
    }
    private renderSubscription(value:any) {
        let isFree: boolean = (!value.plan || value.plan == 'free');
        return (
            <div className='subscription' onClick={this.onClick}>
                <Popover content={isFree ? 'Click to upgrade the plan.' :  'The current billing cycle ends on '+ value.planExpiration}>
                    <Tag color={isFree?'#f50': 'var(--main-bg-color)'} icon={<Icons.VipUtilityOutlined/>}>{utils.toUpper(value.plan ||'free')}</Tag>
                    {isFree && 'Upgrade Plan'}
                </Popover>
            </div>
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
    public renderAction(setting: any, value?: any, valueKey?: string, item?: any) {


        if (BoxTypes[setting.type]) {
            let View: any = BoxTypes[setting.type];
            
            return <View {...setting} value={value || setting.defaultValue } valueKey={valueKey} object={this.props.value} onSubmit={(key, value)=> {
                return this.onSave(key, value, item)
            }}  />
        } else {
            if (setting.type) {
                return <Typography.Paragraph copyable>{value}</Typography.Paragraph>;
            }
        }
        
    }
    private doAction (type: string,key:string, value: any) {
        switch(type) {
            case 'localStorage':
                localStorage.setItem(['setting', key].join('.'), value)
        }
    }

    public onSave = (key: string, value: any, item: any) => {
        let HelperRequest = this.getHelperRequest();

        if (item.onAfterAction) {
            this.doAction(item.onAfterAction,key, value);
        }

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

BoxManger.set('setting', withRouter(BoxSetting));