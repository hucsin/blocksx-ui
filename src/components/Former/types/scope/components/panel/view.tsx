import React from 'react';
import classnames from 'classnames';
import { utils } from '@blocksx/core'
import Notice from '../../../notice';
import { GlobalScope, SmartRequest } from '@blocksx/ui';

import { Table, Empty, Spin } from 'antd';

interface PanelViewProps {
    icon: string;
    path: string;
    selectKey: string;
    selectNameKey?: string;
    selectDescriptionKey?: string;
    view: string;
    value: any;
    description: string;
    current?: any;
    onGetDependentParameters?: Function;
    onClick?: Function;
    disabled?: string;
    emptyText?: string;
}
interface PanelViewState {
    value: any;
    search: string;
    current?: any;

    disabled?: string;
    loading?: boolean;
}

export default class PanelView extends React.Component<PanelViewProps, PanelViewState>{
    public static defaultProps = {
        path: '/api/thinking/findPanelView',
        emptyText: 'No data found.'
    }
    public requestHelper: any
    public constructor(props: PanelViewProps){
        super(props);

        this.state = {
            search: '',
            value: [],
            disabled: props.disabled,
            current: this.getValue(props.value),
            loading: false
        }

        this.requestHelper = SmartRequest.makeGetRequest(this.props.path);

    }

    public UNSAFE_componentWillReceiveProps(nextProps: Readonly<PanelViewProps>, nextContext: any): void {
        if (nextProps.disabled != this.state.disabled) {
            this.setState({
                disabled: nextProps.disabled
            })
        }
        let nextValue: any = this.getValue(nextProps.value)
        if (nextValue != this.state.current) {
            this.setState({
                current: nextValue
            })
        }
    }
    private getValue(value: any) {
        if (Array.isArray(value)) {
            return value[0] ? value[0].value : value
        }
        return value
    }
    public componentDidMount(): void {
        let flow = GlobalScope.getContext(GlobalScope.TYPES.CURRENTFLOW_CONTEXT);
        let node: any = {props: {}};
        if (flow) {
            let currentNode: any = GlobalScope.getScope(GlobalScope.TYPES.CURRENTFLOW_NODE)
            node = flow.getNodeByName(currentNode.value)
        }

        this.setState({ loading: true })
        
        this.requestHelper({
            view: this.props.view,
            connection: node.props.connection,
            componentName: node.props.componentName,
            ...(this.props.onGetDependentParameters && this.props.onGetDependentParameters())
        }).then((res: any) => {
            
            this.setState({ 
                value: Array.isArray(res) ? res :res.data ,
                loading: false
            })
        })
    }

    public renderContent(): React.ReactNode {
        let { value = []} = this.state;
        let selectKey: string = this.props.selectKey || 'id';
        let selectNameKey: string = this.props.selectNameKey || 'name';
        let selectDescriptionKey: string = this.props.selectDescriptionKey || 'description';
        
        if (value.length) {
            let columns:any = Object.keys(value[0]).map((it: any,index: number) => {
                let title: string = it.replace(/[A-Z]/g, (_,__)=> {return ' ' + _})
                return {
                    title: utils.upperFirst(title),
                    dataIndex: it,
                    key: it,
                    fixed: index < 1 ? 'left' : false,
                    render: (text: any, record: any, index: number) => {
                        
                        return JSON.stringify(text)
                    }
                }
            })
            return (
                <Table 
                    size='small'
                    scroll= {{
                        x: 'max-content'
                    }}
                    bordered={true}
                    pagination={false}
                    onRow={(record: any)=> {
                        return {
                            onClick: (e: any) => {
                                if (!this.state.disabled)  {
                                    this.setState({
                                        current: record[selectKey]
                                    })
                                    if (this.props.onClick) {
                                        this.props.onClick({ 
                                            value: record[selectKey], 
                                            name: record[selectNameKey],
                                            icon: this.props.icon,
                                            description: record[selectDescriptionKey] || this.props.description
                                        })
                                    }
                                }
                            }
                        }
                    }}
                    rowClassName={(record: any)=> {
                        let current: any = record[selectKey];
                        return current === this.state.current ? 'ui-panel-view-row-active' : ''
                    
                    }}
                    dataSource={this.state.value} 
                    columns={columns} 
                />
            )
        } else {
            return <Empty
                description={this.props.emptyText}
            />
        }
    }
    public render(): React.ReactNode {
        return (
            <Spin spinning={this.state.loading} tip='Loading...'>
                <div className={classnames('ui-panel-view', this.state.disabled ? 'ui-panel-view-disabled' : '')}>
                    <Notice icon={this.props.icon} value={this.props.description} />
                    {this.renderContent()}
                </div>
            </Spin>
        )
    }

}