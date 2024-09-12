import React from 'react';
import classnames from 'classnames';
import PanelProcess from './process';
import PanelStorges from './storges';
import PanelOther from './other';
import PanelView from './view';
import ScopeManger from '../../core/ScopeManger';
import Avatar from '../../../avatar';


import './panel.scss';

interface ScopePanelProps {
    scope: any;
    open: any;
    total: number;
    dataType: any;
    disabled?: boolean;
    value: any;
    iterator?: boolean;
    panel: any;
    onGetDependentParameters?: Function;
    readonly?: boolean;
}
interface ScopePanelState {
    current: number;
    open: any;
    total: number;
    dataType: any;  
    panel: any;
    disabled?: boolean;
    value: any;
    readonly?: boolean;
}

export default class ScopePanel extends React.Component<ScopePanelProps, ScopePanelState> {
    private groupList: any = ScopeManger.findGroup();
    private timer: any;
    private cache:any;
    public constructor(props: ScopePanelProps) {
        super(props);
        this.state = {
            current: 0,
            open: props.open,
            total: props.total,
            dataType: props.dataType,
            disabled: props.disabled,
            value: props.value,
            panel: props.panel,
            readonly: props.readonly || false
        }
        this.cache = {};
    }
    public UNSAFE_componentWillReceiveProps(nextProps: Readonly<ScopePanelProps>, nextContext: any): void {

        if (nextProps.open != this.state.open) {
            this.setState({
                open: nextProps.open
            })
        }
        
        if (nextProps.panel != this.state.panel) {
            this.setState({
                panel: nextProps.panel
            })
        }

        if (nextProps.total != this.state.total) {
            this.setState({
                total: nextProps.total
            })
        }
        if (nextProps.disabled != this.state.disabled) {
            this.setState({
                disabled: nextProps.disabled
            })
        }

        if (nextProps.dataType != this.state.dataType) {
            this.setState({
                dataType: nextProps.dataType
            })
        }

        if (nextProps.value != this.state.value) {
            this.setState({
                value: nextProps.value
            })
        }

        if (nextProps.readonly != this.state.readonly) {
            this.setState({
                readonly: nextProps.readonly || false
            })
        }
    }
    private renderBody(name, index, isSelected) {
        let { onGetDependentParameters } = this.props;
        if (index == 0) { 
            if (this.state.panel) {
                return (
                    <PanelView 
                        {...this.state.panel} 
                        disabled={this.state.disabled}
                        onGetDependentParameters={()=> onGetDependentParameters && onGetDependentParameters()} 
                        value={this.state.value}
                        onClick={(props: any) => {
                            this.props.scope.addValueIntoScope({
                                type: 'view',
                                ...props
                            })
                        }} 
                    />
                )
            }
        }

        switch (name) {
            case 'Thinking':
           
                return (!isSelected && this.cache[name] || isSelected) ? this.cache[name] =  (
                    <PanelProcess  
                        disabled={this.state.disabled} 
                        dataType={this.state.dataType} 
                        total={this.state.total}
                        iterator={this.props.iterator}

                        value={this.state.value}
                        
                        onClick={(value, keypath: string, { source, node }) => {
                            this.props.scope.addValueIntoScope({
                                type: 'scope',
                                dataType: node.type,
                                source, 
                                keypath: keypath,
                                value: value
                            })
                        }} 
                />): null;
            case 'Data Stores':
                return <PanelStorges />
            default:
                return (
                    <PanelOther
                        disabled={this.state.disabled} 
                        dataType={this.state.dataType} 
                        name={name}
                        onClick={(item: any) => {
                            this.props.scope.addValueIntoScope(item)
                        }} 
                />)

        }
    }
    private typeMaps: any = {
        Math: 'Number'
    }
    private filterTabs(tabs: any) {
        let { dataType = [] } = this.state;

        return dataType ? tabs.filter(it => {
            let trueType: string = this.typeMaps[it] || it;
            
            if (['Array','Object'].includes(trueType)) {
                return dataType.join(',').indexOf(trueType) > -1;
            }
            return dataType.includes(trueType)
        }): tabs;
    }
    public render() {
        let groupKeys: any = Object.keys(this.groupList);
        let titleKeys: any = ['Thinking', ...this.filterTabs([
            ...groupKeys,
            //'Data Stores'
        ])]

        if (this.state.panel) {
            titleKeys = [this.state.panel.title, ...titleKeys]
        }
        
        if (!this.state.open) {
            return null;
        }

        return (
            <div className='ui-scope-panel-inner'
                onMouseDown={(e: any) => {
                    e.preventDefault();
                    //e.stopPropagation();
                }}
            >
                <div className='ui-scope-panel-header'>
                    <Avatar icon="VariableUtilityOutlined" color="#4d53e8" />

                    <div className='ui-scope-classify'>
                        {titleKeys.map((it, index) => {
                            return (
                                <span
                                    onMouseEnter={() => {
                                        /*if (this.timer ) {
                                            clearTimeout(this.timer);
                                        }
                                        this.timer = setTimeout(() => {
                                            this.setState({current: it})
                                            this.timer = null;
                                        }, 200)
                                        */
                                    }}
                                    onClick={() => {
                                        this.setState({ current: index })
                                    }}
                                    //onMouseLeave={()=> this.timer && clearTimeout(this.timer)}
                                    className={classnames({
                                        "ui-selected": index == this.state.current
                                    })}>{it}</span>
                            )
                        })}
                    </div>
                </div>
                <div className='ui-scope-panel-body'>
                    {titleKeys.map((it, index) => {
                        return (
                            <div className={classnames({ 'ui-selected': index == this.state.current })}>
                                {this.renderBody(it, index, this.state.current == index)}
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }
}