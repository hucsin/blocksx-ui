import React from "react";
import { Card, Progress, Tooltip, Space } from 'antd';

import { ExclamationCircleFilled } from '../../../Icons'
//import { Tiny } from '@ant-design/plots';
import { Sparklines, SparklinesLine, SparklinesBars } from 'react-sparklines';

import { BoxItemBase } from '../../interface';

interface StatisticsCardProps extends BoxItemBase{
    footer?: any[];
    steps?: any[];
    valueKey?: string;
    valumeKey?: string;
    valumePaddingKey?: string;
}
interface StatisticsCardState {
    value: number;
}

export default class StatisticsCard extends React.Component<StatisticsCardProps,StatisticsCardState > {
    public constructor(props: any) {
        super(props)

        this.state = {
            value: props.value
        }

    }
    public renderText() {
        let { steps = [] } = this.props;
        let { value = {}} = this.state;
        return <span><Space>{steps.map((it, index) => {
            return <Tooltip title={it.tooltip} key={index}><span>{it.name} {this.renderValue(value[it.valueKey])}</span></Tooltip>
        })}</Space></span>
    }
    public renderArea() {
        const data = this.getTinyData();
          const config = {
            data,
            height: 50,
            padding: 8,
            shapeField: 'smooth',
            xField: 'index',
            tooltip: {
                title: 'label',
                items: [{ channel: 'y' }],
            },
            yField: 'value',
            style: {
              fill: 'linear-gradient(-90deg, white 0%, darkgreen 100%)',
              fillOpacity: 0.6,
            },
          };
          return (<div style={{ position: 'relative' }}>
                {/* 定义渐变 */}
        
                {/* 渲染 Sparkline 并应用渐变 */}
                <Sparklines data={data.map(it => it.value)} limit={30} height={20} width={100}>
                <SparklinesLine color="#87d068"  strokeWidth={3} onMouseMove={(e,a) => {
                    
                }} />
            </Sparklines>
          </div>)
    }
    public getTinyData() {
        let { valumeKey, valumePaddingKey } = this.props;
        let { value = {}} = this.state;
        let valumeObject:any = value[valumeKey as string];
        let valumePaddingObject:any = value[valumePaddingKey as string];
        let data:any[] = [];
        Object.keys(valumePaddingObject).forEach((it, index) => {
            data.push({
                value: valumePaddingObject[it],
                //index: index,
                label: it
            })
        })
        Object.keys(valumeObject).forEach((it, index) => {
            data.push({
                value: valumeObject[it],
                //index: index,
                label: it
            })
        })
        data = data.sort((a,b)=> {
            return a.label > b.label ? 1 : -1;
        });
        if (data.length < 30) {
            (new Array(30 - data.length)).fill(0).forEach((it, index) => {
                data.unshift({
                    value: 0,
                    //index: data.length + index,
                    label: 'No Data​'
                })
            })
        }
        return data.map((it, index) => {
            return {
                ...it,
                index: index
            }
        });
    }
    public renderColumn() {
        const data = this.getTinyData();
          const config = {
            data,
            height: 50,
            padding: 8,
            xField: 'index',
            yField: 'value',
            tooltip: {
                title: 'label',
                items: [{ channel: 'y' }],
            },
          };


          return (<div style={{ position: 'relative' }}>
            {/* 定义渐变 */}
      
            {/* 渲染 Sparkline 并应用渐变 */}
            <Sparklines data={data.map(it => it.value)} limit={30} height={20} width={100}>
                <SparklinesBars  style={{ width: 3,fill: "#41c3f9",stroke: "white", strokeWidth: "1"}} onMouseMove={(e,a) => {
                    
                }} />
        </Sparklines>
          </div>)
    }
    public renderProgress() {
        let { value = 0} = this.state;
        let pecent: number = parseFloat((value[this.props.valueKey as string] * 100).toFixed(2));


        return (
            <Progress percent={pecent} status="active" strokeColor={{ from: '#108ee9', to: '#87d068' }} />
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
                <ExclamationCircleFilled/>
            </Tooltip>)
        }
        return null;
    }
    private renderValue(value: number) {
        switch(this.props.type) {
            case 'progress':
                if (value < 1) {
                    return (value * 100).toFixed(2) + '%'
                }
            default: 
                return value && value.toLocaleString();
        }
    }
    public render()  {
        let { value = {}} = this.state;
        let { footer = [] } = this.props;

        return (
            <Card variant={'borderless'} size="small" title={this.props.title} extra={this.renderExtra()}>
                <div className="card-value">{this.renderValue(value[this.props.valueKey as string])}</div>
                <div className="card-body">
                    {this.renderContent()}
                </div>
                <div className="card-footer">
                    <Space>
                        {
                            footer.map((it, index) => {
                                return <Tooltip title={it.tooltip} key={index}><span key={index}>{it.name} {this.renderValue(value[it.valueKey])}</span></Tooltip>
                            })
                        }
                    </Space>
                </div>
            </Card>
        )
    }
}