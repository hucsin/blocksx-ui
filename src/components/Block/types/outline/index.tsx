import React from 'react';
import classnames from 'classnames';
import { utils } from '@blocksx/core';
import Former from '../../../Former';
import * as Icons from '../../../Icons';
import {  Typography } from 'antd';
import { BlockItem } from '../../interface';
import BlockManger from '../../BlockManger';

import './style.scss';
/**
 * 概览，
 * 显示：图标
 *      标题
 *      注释
 *      buttons
 *      tags
 */
export default class Outline extends React.Component<BlockItem, any> {

    private renderAvator() {
        let icon: any = this.props.icon;
        
        if (utils.isArray(icon)) {
            return icon.map((item, index) => {
                return (
                    <Former.FormerTypes.avatar icon={item} size={64} />
                )
            })
        } else {
            return <Former.FormerTypes.avatar icon={icon} size={64} />
        }
    }
    public render() {
        return (
            <>
                {this.renderAvator()}
                {this.props.title && <Typography.Title level={2}>{this.props.title}</Typography.Title>}
                {this.props.description && <Typography.Paragraph>{this.props.description}</Typography.Paragraph>}
            </>
        )
    }
}

BlockManger.set('outline', Outline)