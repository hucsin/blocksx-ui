import React from 'react';
import { utils } from '@blocksx/core';
import { ScopeManger } from '@blocksx/scope';
import * as Icons from '../../../../../Icons';
import Notice from '../../../notice';
import Tooltip from './tooltip';
import { upperFirst, emit } from 'lodash';


export default class PanelOther extends React.Component<{name: string, onClick: Function, dataType: any, disabled?: boolean}, {dataType: any, disabled?: boolean}>{
    private scopeList: any;
    private noticeMap: any;
    
    public constructor(props: any){
        super(props)
        this.scopeList = ScopeManger.findGroup(props.name);
        this.noticeMap = ScopeManger.findClassifyMap();

        this.state = {
            dataType: props.dataType,
            disabled: props.disabled
        }
    }

    public UNSAFE_componentWillReceiveProps(nextProps: Readonly<{ name: string; onClick: Function; dataType: any; disabled?: boolean }>, nextContext: any): void {
        if (nextProps.dataType != this.state.dataType) {
            this.setState({
                dataType: nextProps.dataType
            })
        }
        if (nextProps.disabled != this.state.disabled) {
            this.setState({
                disabled: nextProps.disabled
            })
        }
    }
    private onSelectedItem(item: any) {
        
        if (item.parameters){
            item.parameters = item.parameters.map(it => {
                it.$type =  'value';
                return {
                    $type: 'value',
                    value: it.value || ''
                };
            })
        }
        this.props.onClick({
            $type: item.type,
            //name: item.name,
            parameters: item.parameters,
            value: item.name
        })
    }

    public matchTypes(type: any) {
        let { dataType } = this.state;

        if (this.state.disabled) {
            return false;
        }
        
        if (dataType) {
            
            if (!Array.isArray(dataType)) {
                dataType = [dataType]
            }
            
            if (dataType.includes('Any')) {
                return type;
            }

            if (Array.isArray(type)) {
                
                return type.some(it => dataType.includes(upperFirst(it)))
            }
            return dataType.includes(upperFirst(type))
        }

        return true;
    }

    public getmessage(type:any) {
        if (this.state.disabled) {
            return "The current position does not allow the input of more variables.";
        }
        return `Returns dataType '${upperFirst(type)}' is not allowed at this position; types (${this.state.dataType}) are allowed at this position.` 
    }
    public render () {
        let groupKeys: any = Object.keys(this.scopeList);
        return (
            <div  className='ui-scope-function-list'> 
                <Notice value={this.noticeMap[this.props.name].description}/>

                {groupKeys.map(it => {
                    if (['variable', 'scope'].includes(it)) {
                        return (
                            <dl>
                                <dt>variable</dt>
                                {this.scopeList[it].map(it => {
                                    let matchType:boolean = this.matchTypes(it.returns.dataType);
                                    return (<dd>
                                        <Tooltip {...it} message={!matchType ? this.getmessage(it.dataType): ''}><span className={!matchType ? 'ui-disabled': ''} onClick={()=> this.onSelectedItem(utils.copy(it))}><Icons.VariableUtilityOutlined/>{it.name}</span></Tooltip>
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
                                            <span className={!matchType ? 'ui-disabled': ''} onClick={()=> matchType && this.onSelectedItem(utils.copy(fun))}><Icons.FunctionOutlined/>{fun.method}</span>
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