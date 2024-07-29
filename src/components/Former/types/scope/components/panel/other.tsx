import React from 'react';
import ScopeManger from '../../core/ScopeManger';
import * as Icons from '../../../../../Icons';
import Notice from '../../../notice';
import Tooltip from './tooltip';
import { upperFirst } from 'lodash';

export default class PanelOther extends React.Component<{name: string, onClick: Function, dataType: any}, {dataType: any}>{
    private scopeList: any;
    private noticeMap: any = {
        'Math': 'Some mathematical functions for performing numerical calculations. [Know more]()',
        'String': 'String manipulation functions for common operations such as concatenation and slicing.',
        'Object': 'Object manipulation functions for iterating over objects and performing some specific operations.',
        'Array': 'Array utility functions for performing operations on array values, used to modify array-type values in a process.'
    }
    
    public constructor(props: any){
        super(props)
        this.scopeList = ScopeManger.findGroup(props.name)
        this.state = {
            dataType: props.dataType
        }
    }

    public UNSAFE_componentWillReceiveProps(nextProps: Readonly<{ name: string; onClick: Function; dataType: any; }>, nextContext: any): void {
        if (nextProps.dataType != this.state.dataType) {
            this.setState({
                dataType: nextProps.dataType
            })
        }
    }
    private onSelectedItem(item: any) {
        
        if (item.parameters){
            item.parameters = item.parameters.map(it => {
                it.type =  'value';
                return {
                    type: 'value',
                    value: it.value || ''
                };
            })
        }
        this.props.onClick(item)
    }

    public matchTypes(type: string) {
        let { dataType } = this.state;
        
        if (dataType) {
            if (!Array.isArray(dataType)) {
                dataType = [dataType]
            }

            return dataType.includes(upperFirst(type))
        }

        return true;
    }

    public getmessage(type:any) {
        return `Return type '${upperFirst(type)}' is not allowed at this position; types (${this.state.dataType}) are allowed at this position.` 
    }
    public render () {
        let groupKeys: any = Object.keys(this.scopeList);
        return (
            <div  className='ui-scope-function-list'> 
                <Notice value={this.noticeMap[this.props.name]}/>

                {groupKeys.map(it => {
                    if (['variable', 'scope'].includes(it)) {
                        return (
                            <dl>
                                <dt>variable</dt>
                                {this.scopeList[it].map(it => {
                                    
                                    let matchType:boolean = this.matchTypes(it.dataType);
                                    return (<dd>
                                        <Tooltip {...it} message={!matchType ? this.getmessage(it.dataType): ''}><span className={!matchType ? 'ui-disabled': ''} onClick={()=> this.onSelectedItem(it)}><Icons.VariableUtilityOutlined/>{it.method}</span></Tooltip>
                                        <span className='o'>{it.description}</span>
                                    </dd>)
                                })}
                            </dl>
                        )
                    } else {
                        return (
                            <dl>
                                <dt>{it}</dt>
                                <dd>{this.scopeList[it].map(fun => {
                                    let returnTypes: any = fun.returns && (fun.returns.dataType || fun.returns.type);
                                    let matchType: boolean = this.matchTypes(returnTypes);
                                    return (
                                        <Tooltip {...fun} message={!matchType ? this.getmessage(returnTypes): ''}>
                                            <span className={!matchType ? 'ui-disabled': ''} onClick={()=> matchType && this.onSelectedItem(fun)}><Icons.FunctionOutlined/>{fun.method}</span>
                                        </Tooltip>
                                    )
                                })}</dd>
                            </dl>
                        )
                    }
                })}
            </div>
        )
    }
}