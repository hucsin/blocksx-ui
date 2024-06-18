import React from 'react';
import { Tabs, Spin } from 'antd';

import ReactMarkdown from 'react-markdown';
import * as Icons from '../Icons';
import TableUtils from '../utils/tool';

//import withRouter from '../withRouter';
//import MiniSearch from '../MiniSearch';

import Panel from './Panel';
import './style.scss';

interface TitleMap {
    [prop: string] : string;
}

export interface ClassifyPanelProps {
    children: any;
    icon?: string;
    title: string;
    renderContent?: Function;
    description?: string ;
    extra?: any;
    tabsExtra?: any;

    showQuery:boolean;
    activeKey?: string;
    defaultActiveKey?: string;
    groupKey?: string;
    onChange?: Function;

    //onFetchClassifyMapDict?(type: string, category: string, classify: string): Promise<FetchResult>;
}

interface ClassifyPanelState {
    
    query?: string;
    activeKey?: string;
   // groupKey: string;
    icon?: string;
    totalDict:any;
    loading: boolean;
    title: string;
    description: any;
}

export default class ClassifyPanel extends React.Component<ClassifyPanelProps, ClassifyPanelState> {
    static Panel: any = Panel;

    static defaultProps = {
        showQuery: true,
        activeKey: 'all',
        groupKey: 'all',
        defaultActiveKey: 'all'
    }

    public constructor(props: ClassifyPanelProps) {
        super(props)

        this.state = {
            query: '',
            title: props.title,
            icon: props.icon,
            activeKey: props.defaultActiveKey,
            //groupKey: this.getDefaultGroupKey(props),
            totalDict: {},
            loading:false,
            description: props.description,
        }
    }
    public componentDidMount() {
        //this.getTotalDict();
    }
    public UNSAFE_componentWillReceiveProps(newProps: ClassifyPanelProps) {
       
        if (newProps.title != this.state.title) {
        
            this.setState({
                title: newProps.title
            })
        }

        if (newProps.description != this.state.description) {
            this.setState({
                description: newProps.description
            })
        }

        if (newProps.icon !=this.state.icon) {
            this.setState({
                icon: newProps.icon
            })
        }
    }
    private getTabLabel(props: any) {
        let label: string = props.label || props.title;
        //let value: string = props.value;
        //let totalDict: any = this.state.totalDict;

       // let total: any = totalDict[value] || props.total;

        return (
            <span className='ui-label'>
                {TableUtils.renderIconComponent(props)}
                {label}
               
            </span>
        )
    }
    private getTabsItems() {
        return React.Children.map(this.props.children, (item: any, index: number) => {
            
            let { props = {} } = item;
            
            return {
                label: this.getTabLabel(props),//props.label || props.title,
                key: item.value || item.key || index,
                children: item
            };
        })
    }
    private onChange =(activeKey:string)=> {
        
        this.setState({
            activeKey
        }, () => {
            this.props.onChange && this.props.onChange(activeKey)
           // this.go(activeKey)
        });
    }
    private renderTitleIcon() {
        if (this.props.icon) {
            let IconView: any = Icons[this.props.icon];
            if (IconView) {
                return <IconView/>
            }
        }
        return null;
    }
    public render() {
        return (
            <div className='ui-classify-panel'>
                <div className='ui-header'>
                    <div className='ui-title'>
                        {this.renderTitleIcon()}
                        {this.state.title}
                        <span className='des'><ReactMarkdown>{this.state.description}</ReactMarkdown></span>
                    </div>
                    <div className='ui-extra'>
                        {this.props.extra}
                    </div>
                </div>
                {<Tabs 
                    items={this.getTabsItems()}
                    activeKey={this.state.activeKey}
                    key={'t2'}
                    tabBarExtraContent={this.props.tabsExtra}
                    onChange={this.onChange}
                />}
                {this.props.renderContent && this.props.renderContent()}
            </div>
        )
    }
}