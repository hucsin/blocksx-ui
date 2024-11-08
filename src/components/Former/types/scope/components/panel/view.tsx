import React from 'react';
import classnames from 'classnames';
import { utils } from '@blocksx/core'
import Notice from '../../../notice';
import Context from '../../contexts';
import SmartRequest from '../../../../../utils/SmartRequest';
import GlobalScope from '../../../../../core/GlobalScope';

import { Table, Empty, Spin } from 'antd';
import SearchBar from '../../../../../SearchBar';

interface PanelViewProps {
    icon: string;
    path: string;
    params?: any;
    selectKey: string;
    selectNameKey?: string;
    selectDescriptionKey?: string;
    view: string;
    value: any;
    description: string;
    current?: any;
    onGetDependentParameters?: Function;
    getFormerValue?: Function;
    onClick?: Function;
    disabled?: string;
    emptyText?: string;
}
interface PanelViewState {
    value: any;
    search: string;
    current?: any;
    description?: string;
    disabled?: string;
    loading?: boolean;
}

export default class PanelView extends React.Component<PanelViewProps, PanelViewState>{
    public static defaultProps = {
        path: '/api/thinking/findPanelView',
        emptyText: 'No data found.'
    }
    public static contextType = Context;
    public context: any;
    public requestHelper: any
    public constructor(props: PanelViewProps){
        super(props);

        this.state = {
            search: '',
            description: props.description,
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
        this.request();
    }

    private request(data:any = {}) {
        let { params = {} } = this.props;
        let flow = GlobalScope.getContext(GlobalScope.TYPES.CURRENTFLOW_CONTEXT);
        let node: any = {props: {}};
        let formerValue: any = this.props.getFormerValue && this.props.getFormerValue() || {};
        if (flow) {
            let currentNode: any = GlobalScope.getScope(GlobalScope.TYPES.CURRENTFLOW_NODE)
            node = flow.getNodeByName(currentNode.value)
        }

        let paramsKeys = Object.keys(params);
        if (paramsKeys.length) {
            params = {...params, ...utils.pick(formerValue, paramsKeys)}
            
        }

        this.setState({ loading: true })
        this.requestHelper({
            view: this.props.view,
            connection: node.props.connection || formerValue.$connection,
            componentName: node.props.componentName,
            ...(this.props.onGetDependentParameters && this.props.onGetDependentParameters()),
            ...data,
            ...params
        }).then((res: any) => {
            
            let description: string = this.props.description;
            if (res.properties) {
                description = utils.template(description, res.properties)
            }
            this.setState({ 
                description,
                value: Array.isArray(res) ? res :res.data ,
                loading: false
            })
        })
    }
    public getAllFieldsByValue(value: any[]) {
        let fields: any = [];
        
        value.forEach(it => {
            Object.keys(it).forEach(key => {
                if (!fields.includes(key)) {
                    fields.push(key)
                }
            })
        })

        return fields;
    }
    public renderContent(): React.ReactNode {
        let { value = []} = this.state;
        let selectKey: string = this.props.selectKey || 'id';
        let selectNameKey: string = this.props.selectNameKey || 'name';
        let selectDescriptionKey: string = this.props.selectDescriptionKey || 'description';
        
        let columns:any = value.length ? (this.getAllFieldsByValue(value)).map((it: any,index: number) => {
            let title: string = it.replace(/[A-Z]/g, (_,__)=> {return ' ' + _})
            return {
                title: utils.upperFirst(title),
                dataIndex: it,
                key: it,
                // fixed: index < 1 ? 'left' : false,
                render: (text: any, record: any, index: number) => {
                    
                    return JSON.stringify(text)
                }
            }
        }) : [];

        columns.unshift({
            title: '#',
            width: 22,
            fixed: 'left',
            render(_,record,index) {
                return index + 1
            } 
        })

        return (
            <Table 
                size='small'
                scroll= {{
                    x: 'max-content'
                }}
                locale={{
                    emptyText: this.props.emptyText
                }}
                title={()=> {
                    return (<SearchBar 
                        size='small'
                        onSearch={({query = ''})=> {
                            
                            this.setState({
                                search: query
                            }, () => {
                                this.request({
                                    query
                                })
                            })
                        }}
                        onMouseEnter={()=> {
                            this.context.onDisabledBlur(true)
                        }}
                        onMouseLeave={()=>{
                            this.context.onDisabledBlur(false)
                        }}
                    />)
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
                                        value: `${record[selectKey]}`, 
                                        name: record[selectNameKey] ? `${record[selectNameKey]}` : '',
                                        icon: this.props.icon,
                                        //description: record[selectDescriptionKey] || this.props.description
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
            
    }
    public render(): React.ReactNode {
        return (
            <Spin spinning={this.state.loading} tip='Loading...'>
                <div className={classnames('ui-panel-view', this.state.disabled ? 'ui-panel-view-disabled' : '')}>
                    <Notice icon={this.props.icon} value={this.state.description} />
                    {this.renderContent()}
                </div>
            </Spin>
        )
    }

}