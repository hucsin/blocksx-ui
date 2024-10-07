import React from 'react';

import ReactMarkdown from 'react-markdown';
import { utils } from '@blocksx/core';
import Former from '../../../Former';
import * as Icons from '../../../Icons';
import { Space, Typography, Button, Tag } from 'antd';
import { BoxItem, BoxAction, BoxTag } from '../../interface';
import BoxManger from '../../BoxManger';

import './style.scss';
/**
 * 概览，
 * 显示：图标
 *      标题
 *      注释
 *      buttons
 *      tags
 */
export default class Outline extends React.Component<BoxItem, any> {
    private avatarSizeMap: any = {
        small: 64,
        default: 98,
        large: 128
    };
    private getAvatarSize() {
        return this.avatarSizeMap[this.props.size || 'large']
    }
    private renderAvatar() {
        let icon: any = this.props.icon;
        
        if (utils.isArray(icon)) {
            return (
                <Space>
                    {icon.map((item, index) => {
                        return (
                            <Former.FormerTypes.avatar key={index} icon={item} size={this.getAvatarSize()} />
                        )
                    })}
                </Space>
            )
        } else {
            return <Former.FormerTypes.avatar icon={icon} size={this.getAvatarSize()} />
        }
    }
    private renderIcon(icon: string) {
        let IconView: any = Icons[icon];
        if (IconView) {
            return <IconView/>
        }
    }
    private renderActions() {
        let { events = {} } = this.props;
        if ( utils.isArray(this.props.actions)) {
            return (
                <Space style={{paddingTop: '32px'}}>
                    {this.props.actions?.map((item: BoxAction, index) => {
                        return (
                            <Button 
                                key={index} 
                                size={(this.props.size || item.size || 'large') as any} 
                                type={item.type || 'primary'} 
                                icon={this.renderIcon(item.icon as any)}
                                onClick = {() => {
                                    if (item.action && events[item.action]) {
                                        events[item.action](item.params)
                                    }
                                }}
                            >{item.text}</Button>
                        )
                    })}
                </Space>
            )
        }
    }
    private renderTags() {
        if ( utils.isArray(this.props.tags)) {
            return (
                <Typography.Paragraph className='block-outline-tags'>
                    <Space>
                        {this.props.tags?.map((item: BoxTag, index: number) => {
                            
                            return (
                                <Tag key={index} closeIcon={false} icon={this.renderIcon(item.icon as string)}>{item.text}</Tag>
                            )
                        })}
                    </Space>
                </Typography.Paragraph>
            )
        }
    }
    private getTitleLevel() {
        if (this.props.size == 'large') {
          // return 1
        }
        return 2;
    }
    public render() {
        
        return (
            <>
                {this.renderAvatar()}
                {this.props.title && <Typography.Title level={2}>{this.props.title}</Typography.Title>}
                {this.props.description && <Typography.Paragraph className='block-subtitle'><ReactMarkdown>{this.props.description}</ReactMarkdown></Typography.Paragraph>}
                {this.renderActions()}
                {this.renderTags()}
            </>
        )
    }
}

BoxManger.set('outline', Outline)