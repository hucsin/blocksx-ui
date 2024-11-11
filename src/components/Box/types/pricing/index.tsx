import React from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames'
import { Tooltip, Typography, Tag, Space, Switch, Button } from 'antd';
import * as Icons from '../../../Icons';

import SmartRequest from '../../../utils/SmartRequest';
import TablerUtils from '../../../utils/tool'
import { BoxItem, BoxAction, BoxTag } from '../../interface';

import BoxManger from '../../BoxManger';
import './style.scss';

interface PricingProps extends BoxItem {
    discount: number;
    features?: any[],
    plans?: any[],
    toolbarRef: any;
}

export default class BoxPricing extends React.Component<PricingProps, { selected: string, isCut: boolean, features: any, plans }> {
    public static defaultProps = {
        discount: 10
    }
    private requestHelper: any;
    private defaultSelectd: any;

    public constructor(props: PricingProps) {
        super(props);

        if (Array.isArray(props.items)) {
            this.defaultSelectd = props.items[1] && props.items[1].value;
        }

        this.state = {
            features: props.features || [],
            plans: this.getGroupPlans(props.plans || []),
            isCut: false,
            selected: this.defaultSelectd
        }

        if (props.motion) {
            this.requestHelper = SmartRequest.makePostRequest(props.motion)
        }
    }
    public componentDidMount(): void {
        if (this.requestHelper) {
            this.requestHelper({}).then((result: any) => {
                let features: any[] = [];
                let plans: any[] = [];

                result.forEach(it => {
                    if (it.type == 'features') {
                        features.push(it)
                    } else {
                        plans.push(it)
                    }
                })

                this.setState({
                    features: features.sort((a, b) => a.sortno < b.sortno ? -1 : 1),
                    plans: this.getGroupPlans(plans)
                })
            })
        }
    }

    public getGroupPlans(plans: any) {
        let group: any = [];
        let groupCache: any = {};
        plans.sort((a, b) => a.sortno < b.sortno ? -1 : 1).forEach(plan => {
            if (!groupCache[plan.name]) {
                group.push(groupCache[plan.name] = {
                    name: plan.name,
                    value: [plan]
                })

            } else {
                groupCache[plan.name].value.push(plan)
            }
        })
        return group;
    }

    public renderHeader() {
        let { items = [] } = this.props;

        return (
            <>
                <th>{this.props.subtitle}</th>
                {items.map(it => {
                    return (
                        <th className={classnames({
                            'plan-item': true,
                            [`plan-item-${it.value}`]: it.value
                        })} >{TablerUtils.renderIconComponent(it)}{it.label}</th>
                    )
                })}
            </>
        )
    }
    private findMatchPlan(planList: any, key: string) {
        return planList.find(it => it.type == key)
    }
    private renderLineCell(cell: any) {

        if (cell) {
            if (cell.volume) {
                return cell.volume
            } else {
                if (cell.description) {
                    return cell.description;
                }
                // dui 
                return (
                    <Icons.CheckCircleOutlined />
                )
            }
        }
        return '-'
    }
    public renderLine(rowdata: any) {
        let { items = [] } = this.props;
        let plans = rowdata.plans || [];

        return (
            <tr>
                <td>{rowdata.name} {rowdata.description && <Tooltip title={rowdata.description}><Icons.ExclamationCircleOutlined /></Tooltip>}</td>
                {items.map(it => {
                    let key: string = it.value;
                    let find: any = this.findMatchPlan(plans, key)

                    return (
                        <td className={classnames({
                            'plan-item': true,
                            [`plan-item-${it.value}`]: it.value
                        })} >
                            {this.renderLineCell(find)}
                        </td>
                    )
                })}
            </tr>
        )
    }


    public renderPricingTable() {
        let { features } = this.state;

        return (
            <table className='ui-box-pricing'>
                <thead>
                    <tr>
                        {this.renderHeader()}
                    </tr>
                </thead>
                <tbody>
                    {features.map(it => this.renderLine(it))}
                </tbody>
            </table>
        )
    }
    private renderSubmitPrice(it: any) {

        if (it.price) {
            let price: number = this.state.isCut ? it.price * (100 - this.props.discount) / 100 : it.price;
            return (
                <span className='price'>
                    ${price}
                    <span className='sub'>/mo</span>
                </span>
            )
        }
        return 'Free'
    }

    public renderLinePrice(rowdata: any, type: any) {

        let value: any[] = rowdata.value || [];
        let matchItem: any = value.map(it => {
            let item: any = this.findMatchPlan(it.plans || [], type);
            if (item) {
                item.description = it.description
                item.label = it.label
            }
            
            return item;
        }).filter(Boolean)

        let hasChildren: boolean = matchItem.length >= 1;
        let first: any = rowdata.value[0];

        return matchItem.length ? (
            <dd>
                <h3>{rowdata.name} {first.description && !hasChildren && <Tooltip title={first.description}><Icons.ExclamationCircleOutlined /></Tooltip>}</h3>
                {hasChildren && <ul>
                    {matchItem.map(item => {

                        return (
                            <li>{item.label} <Tooltip title={item.description}><Icons.ExclamationCircleOutlined /></Tooltip></li>
                        )
                    })}
                </ul>}
            </dd>
        ) : null
    }
    public renderPricingSubmit() {

        let { items = [] } = this.props;
        
        return (
            <div className='ui-pricing-submit'>

                {items.map(it => {

                    return (
                        <dl className={classnames({
                            [`ui-pricing-submit-${it.value}`]: it.value,
                            'ui-selected': it.main
                            })}
                        >
                            <dt>
                                <Tag closable={false}>{it.label}</Tag>
                                <p className='price-wrapper'>
                                    {this.renderSubmitPrice(it)}
                                </p>
                                <p>{it.slogan}</p>
                            </dt>

                            {
                                this.state.plans.map(row => this.renderLinePrice(row, it.value))
                            }

                            <dd className='ui-price-buy'>
                                <Button size='large' block type={it.main? 'primary': 'default'}>
                                    {it.value == 'free' ? 'Start for free' : 'Add the plan'}
                                </Button>
                                <div id="paypal-button-container-P-5L978383GP515450CM4HDWQI"></div>

                            </dd>
                        </dl>
                    )
                })}
            </div>
        )
    }
    private renderSwitch() {
        if (this.props.toolbarRef && this.props.toolbarRef.current) {
            return ReactDOM.createPortal(
                this.renderSwitchContent()
                , this.props.toolbarRef.current)
        } else {
            return this.renderSwitchContent();
        }
    }
    private renderSwitchContent () {
        return (
            <Space className={classnames({
                'ui-box-price-switch': true,
                'ui-box-price-cut': this.state.isCut
            })}>
                Billed monthly
                <span className='ui-box-price'>
                    {this.state.isCut && <span>Save {this.props.discount}%</span>}
                    <Switch size='default' onChange={(e) => {
                        this.setState({ isCut: e })
                    }} />
                </span>
                Billed yearly
            </Space>
        )
    }
    public render() {

        return <div className='ui-box-pricing-inner'>
            {this.props.title && <Typography.Title level={1}>{this.props.title}</Typography.Title>}
            {this.props.description && <Typography.Paragraph className='block-subtitle'>{this.props.description}</Typography.Paragraph>}
            <Typography.Title className='all-features' level={3}>{this.renderSwitch()}</Typography.Title>
            
            {this.renderPricingSubmit()}
            <Typography.Title className='all-features' level={3}> All plan features</Typography.Title>
            {this.renderPricingTable()}
        </div>
    }
}


BoxManger.set('pricing', BoxPricing);
