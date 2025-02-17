import React from 'react';
import { utils } from '@blocksx/core';
import { Flex, Typography, Tooltip, Tag } from 'antd';
import * as Icons from '../../../Icons';
import { BoxItem } from '../../interface';

import BoxManger from '../../BoxManger';
import withRouter from '../../../utils/withRouter';

import StatisticsCard from './card';
import './style.scss'


interface BoxStatisticsProps extends BoxItem {
    dataSource: any,
    color?: string;
    router: any;
    value?: any;
}

export default class BoxStatistics extends React.Component<BoxStatisticsProps, { value: any }> {
    public constructor(props: BoxStatisticsProps) {
        super(props);
        this.state = {
            value: props.value
        }
    }
    private goToPlan=()=> {
        this.props.router.naviagte('/subscription')
    }
    private renderExtra() {
        let extra:any = this.props.extra;
        if (extra && extra.type =='plan') {
            let plan: string = utils.toUpper(this.state.value.plan || 'free');
            return (
                <span className='extra' onClick={this.goToPlan}>
                    <Tooltip title="Manage Your Subscription Plans">
                        <Tag color={plan=='FREE'?'#f50': 'var(--main-bg-color)'} icon={<Icons.VipUtilityOutlined/>}>{plan}</Tag> {plan === 'FREE' ? 'Upgrade Plan' : ''}
                    </Tooltip>
                </span>
            );
        }
    }
    public render() {
        let { items = [] } = this.props;

        let width: any = 1/items.length * 100;
        
        return (
            <div className='box-statistics'>
                <Typography.Title level={2}>{this.props.title} {this.renderExtra()}</Typography.Title>
                <Typography.Paragraph className='block-subtitle'>{this.props.description}</Typography.Paragraph>
                <Flex gap={16}>
                    {
                        items.map((it, index) => {
                            return (
                                <div key={index} className='box-statistics-item' style={{width: width + '%'}}>
                                    <StatisticsCard {...it} key={index} value={this.state.value} />
                                </div>
                            )
                        })
                    }
                </Flex>
            </div>
        )
    }
}

BoxManger.set('statistics', withRouter(BoxStatistics))