import React from 'react';
import ScopeManger from '../../core/ScopeManger';
import * as Icons from '../../../../../Icons';
import Notice from '../../../notice';
import Tooltip from './tooltip';

export default class PanelOther extends React.Component<{name: string, onClick: Function}>{
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
    }
    private onSelectedItem(item: any) {
        
        item.parameters = item.parameters.map(it => {
            it.type =  'value';
            return {
                type: 'value',
                value: it.value || ''
            };
        })
        this.props.onClick(item)
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
                                    return (<dd>
                                        <Tooltip {...it}><span onClick={()=> this.onSelectedItem(it)}><Icons.VariableUtilityOutlined/>{it.method}</span></Tooltip>
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
                                    return (
                                        <Tooltip {...fun}>
                                            <span onClick={()=> this.onSelectedItem(fun)}><Icons.FunctionOutlined/>{fun.method}</span>
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