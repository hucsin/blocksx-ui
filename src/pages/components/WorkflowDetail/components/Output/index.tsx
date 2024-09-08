import React from 'react';
import { utils } from '@blocksx/core';

import classnames from 'classnames';

import { Segmented, Space, Tooltip, Tabs } from 'antd';
import { Icons, ValueView, TablerUtils } from '@blocksx/ui'
import './style.scss';


interface RunLogOutputProps {
    nodesStatus: any;
    nodeStatus: any;
    expand?: boolean;
}
export default class RunLogOutput extends React.Component<RunLogOutputProps, {value: any, expand?: boolean,nodesStatus:any, fullscreen: boolean, type:  "auto" | "text" | "json"}> {
    private ref: any;
    public constructor(props: any) {
        super(props);
        this.state = {
            value:  props.expand  ? "" : this.getOutcome() ? 'Output' : this.getIncome() ? 'Input' : '',
            expand: props.expand || false,
            type: 'auto',
            nodesStatus: props.nodesStatus,
            fullscreen: false
        }

        this.ref = React.createRef();
    }
    public UNSAFE_componentWillReceiveProps(nextProps: Readonly<RunLogOutputProps>, nextContext: any): void {
        if (nextProps.nodesStatus != this.state.nodesStatus) {
            this.setState({
                nodesStatus: nextProps.nodesStatus
            })
        }
    }
    private renderHeader() {
        
        return (
            <div className='ui-output-header'>
                <Segmented 
                    size='small' 
                    onClick={()=>{this.setState({expand: false})}}
                    onChange={(v)=>{
                        this.setState({value: v, expand:false})
                    }}
                    value={this.state.value} 
                    options={[this.getIncome() ? 'Input': null, this.getOutcome() ? 'Output': null].filter(Boolean)} 
                ></Segmented>

                {this.state.value &&<Space size={'small'}>
                    <Tooltip title="View Display Mode">
                        <Icons.RecordUtilityOutlined  
                            className={classnames({'ui-selected': this.state.type == 'auto'})}
                            onClick={()=> {
                                this.setState({
                                    type: 'auto',
                                    expand: false
                                })
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Code Display Mode">
                        <Icons.CodeOutlined 
                            className={classnames({'ui-selected': this.state.type == 'json'})}
                            onClick={()=> {
                                this.setState({
                                    type: 'json',
                                    expand: false   
                                })
                            }}
                        />
                    </Tooltip>
                    
                    {this.state.fullscreen 
                        ? <Icons.FullscreenExitOutlined onClick={()=> { this.setState({ fullscreen: !this.state.fullscreen})}} /> 
                        : <Icons.FullscreenOutlined onClick={()=> { this.setState({ fullscreen: !this.state.fullscreen})}}/>}
                    
                    {<Icons.DownloadOutlined onClick={()=> {
                            TablerUtils.toggleFullscreen(this.ref.current)
                            if (this.state.value) {
                                TablerUtils.downloadFile(this.state.value +'.json', JSON.stringify(this.getTextValue(), null, 2))
                            }
                      }}/>
                    }
                </Space>}
            </div>
        )
    }
    private getIncome() {
        let { nodesStatus = {} } = this.state;
        let { income } = this.props.nodeStatus;
        if (Array.isArray(income)) {
            //TODO
        } else {
           // console.log(income && income.source, income && nodesStatus[income.source].outcome, 2222)
            if (income && income.source) {
                return nodesStatus[income.source] && nodesStatus[income.source].outcome;
            }
        }

        return income
    }
    
    private getOutcome() {
        let { outcome } = this.props.nodeStatus;
        return outcome ;
    }
    private isIteratorValue(value: any) {
        return Array.isArray(value) 
            && value[0] 
            && !utils.isUndefined(value[0].$iterator)
    }
    private renderDescription() {

        let valueText: any = this.getTextValue();
        let isIterator: boolean = this.isIteratorValue(valueText);
        
        if (isIterator) {
            return (
                <div className="ui-run-log-output">
                    
                    <Tabs   
                        tabBarExtraContent ={
                            { left: <Tooltip title="Chunk index of array iteration."><Icons.FieldNumberOutlined/></Tooltip> }
                        }
                        size='small'
                        items={valueText.map(it => {
                            let label: string = [it.$index + 1, it.$iterator].join('/')
                            return {
                                label: label,
                                key: label,
                                children: (
                                    <ValueView value={it.value} type={this.state.type}/>
                                )
                            }
                        })}
                    />
                </div>
            )
        } else {
            return (
                <div className="ui-run-log-output">
                    <ValueView value={valueText ? valueText.value: valueText} type={this.state.type} />
                </div>
            )
        }
    }
    private getTextValue() {
        return this.state.value == 'Input' ? this.getIncome() : this.getOutcome();
    }
    public render() {
        return (
            <div
                ref={this.ref} 
                onMouseLeave={()=> {
                    this.setState({
                      //  fullscreen: false
                    })
                }}
                className={classnames({
                    'ui-output-tips': true,
                    'ui-output-fullscreen': this.state.fullscreen,
                    'ui-output-expand': this.state.expand
                })}
            >
                {this.renderHeader()}
                {this.renderDescription()}
            </div>
        )
    }
}