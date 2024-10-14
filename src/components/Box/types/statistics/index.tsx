import React from 'react';
import { Flex, Typography, Tooltip } from 'antd';
import classnames from 'classnames';
import { BoxItem } from '../../interface';
import { Icons } from '@blocksx/ui';
import BoxManger from '../../BoxManger';

import StatisticsCard from './card';
import './style.scss'


interface BoxStatisticsProps extends BoxItem {
    dataSource: any,
    color?: string;
    value?: any;
}

export default class BoxStatistics extends React.Component<BoxStatisticsProps, { value: any }> {
    public constructor(props: BoxStatisticsProps) {
        super(props);
        this.state = {
            value: props.value
        }
    }
    public render() {
        let { items = [] } = this.props;

        let width: any = 1/items.length * 100;
        
        return (
            <div className='box-statistics'>
                <Typography.Title level={2}>{this.props.title}</Typography.Title>
                <Typography.Paragraph className='block-subtitle'>{this.props.description}</Typography.Paragraph>
                <Flex gap={16}>
                    {
                        items.map(it => {
                            return (
                                <div className='box-statistics-item' style={{width: width + '%'}}>
                                    <StatisticsCard {...it} value={this.state.value} />
                                </div>
                            )
                        })
                    }
                </Flex>
            </div>
        )
    }
}

BoxManger.set('statistics', BoxStatistics)