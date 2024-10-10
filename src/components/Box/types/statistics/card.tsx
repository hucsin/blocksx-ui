import React from "react";
import { Card, Progress, Tooltip, Typography } from 'antd';
import { Icons } from '@blocksx/ui';
import { Tiny } from '@ant-design/plots';
import { BoxItemBase } from '../../interface';

interface StatisticsCardProps extends BoxItemBase{
    
}
interface StatisticsCardState {
    value: number;
}

export default class StatisticsCard extends React.Component<StatisticsCardProps,StatisticsCardState > {
    public constructor(props: any) {
        super(props)

        this.state = {
            value: props.value || 0
        }
    }
    public renderText() {
        return <text>周同比12% 日同比11%</text>
    }
    public renderArea() {
        const data = [
            264, 417, 438, 887, 309, 397, 550, 575, 563, 430, 525, 592, 492, 467, 513, 546, 983, 340, 539, 243, 226, 192,
          ].map((value, index) => ({ title: 'f'+value,value, index }));
          const config = {
            data,
            height: 50,
            padding: 8,
            shapeField: 'smooth',
            xField: 'index',
            tooltip: {
            title: 'title',
            items: [{ channel: 'y' }],
          },
            yField: 'value',
            style: {
              fill: 'linear-gradient(-90deg, white 0%, darkgreen 100%)',
              fillOpacity: 0.6,
            },
          };
          return <Tiny.Area {...config} />;
    }
    public renderColumn() {
        const data = [
            264, 417, 438, 887, 309, 397, 550, 575, 563, 430, 525, 592, 492, 467, 513, 546, 983, 340, 539, 243, 226, 192,
          ].map((value, index) => ({ value, index }));
          const config = {
            data,
            height: 50,
            padding: 8,
            xField: 'index',
            yField: 'value',
          };
          return <Tiny.Column {...config} />;
    }
    public renderProgress() {
        let { value = 0} = this.state;

        return (
            <Progress percent={value * 100} status="active" strokeColor={{ from: '#108ee9', to: '#87d068' }} />
        )
    }
    public renderContent() {
        switch(this.props.type) {
            case 'progress':
                return this.renderProgress();
            case 'column':
                return this.renderColumn();
            case 'area':
                return this.renderArea();
            default:
                return this.renderText();
        }
    }
    public renderExtra() {
        if (this.props.description) {
            return (<Tooltip title={this.props.description}>
                <Icons.ExclamationCircleFilled/>
            </Tooltip>)
        }
        return null;
    }
    private renderValue(value: number) {
        switch(this.props.type) {
            case 'progress':
                return (value * 100) + '%'
            default: 
                return value.toLocaleString();
        }
    }
    public render()  {
        let { value = 0} = this.state;
        return (
            <Card bordered={false} size="small" title={this.props.title} extra={this.renderExtra()}>
                <div className="card-value">{this.renderValue(value)}</div>
                <div className="card-body">
                    {this.renderContent()}
                </div>
                <div className="card-footer">
                    dffd: 232211
                </div>
            </Card>
        )
    }
}