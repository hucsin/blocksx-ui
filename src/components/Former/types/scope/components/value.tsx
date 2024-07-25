import React from 'react';
import { utils } from '@blocksx/core';

import Context from '../contexts';
import FormerScopeFunction from './function';

import FunctionManger from '../core/ScopeManger';
import FormerScopeInput from './input';
import FormerScopeLabel from './scope';
import FormerVariable from './variable';
//import FormerScope from '..';
import { ScopeType } from '../types'

interface FormerScopeProps {
    context?: any;
    value: ScopeType[] | string;
    onChangeValue: Function;
    onRemoveValue: Function;
    index: number;
    level: number;
    parentScope?: any;
    serial: number
}

interface FormerScopeState {
    value: ScopeType[] | string;
    originValue: any;

    index: number;
    level: number;

    reflush: number;
}

export default class FormerScopeValue extends React.Component<FormerScopeProps, FormerScopeState> {
    private index:number ;
    public static contextType = Context;
    public context: any;
    public static defaultProps = {
        index: 0,
        level: 12,
        serial: -1
    }
    public constructor(props: FormerScopeProps) {
        super(props);

        this.state = {
            value: props.value,
            originValue: this.getOriginValue(props.value),

            index: props.index,
            level: props.level,
            reflush: 1
        }
    }
    public UNSAFE_componentWillReceiveProps(nextProps: Readonly<FormerScopeProps>, nextContext: any): void {
        if (nextProps.value != this.state.value) {
            this.setState({
                value: nextProps.value,
                originValue: this.getOriginValue(nextProps.value)
            })
        }

        if (nextProps.index != this.state.index) {
            this.setState({
                index: nextProps.index
            })
        }

        if (nextProps.level != this.state.level) {
            this.setState({
                level: nextProps.level
            })
        }
    }

    public doChangeValue(value?: string, isRemove?: boolean) {
        let originValue: any = utils.copy(this.state.originValue);
        this.setState({
            reflush: isRemove ? this.state.reflush +1 : this.state.reflush,
            originValue: originValue ,
            value: typeof value == 'string' ? value :  this.cleanOriginValue(originValue) 
        }, () => {
            this.props.onChangeValue(this.state.value)
        })
    }
    private cleanOriginValue(value: any) {
        // 清理padding
        return value.filter(it => {
            if (!it.value && it.padding) {
                return false;
            }

            delete it.padding;

            if (it.type == 'function') {
                it.parameters = it.parameters.filter(it => {
                    return !it.value && it.padding ? false : true
                })
            }
            return true;
        })
    }
    private getOriginValue(value) {
        if (Array.isArray(value)) {
            // 遍历数据项，给添加空白
            let originValue: any = [];
            
            value.forEach((it: any ,index: number) => {
                if (it.type == 'value') {
                    originValue.push(it)
                } else {
                    let preNode: any = originValue[originValue.length - 1];
                    let nextNode: any = value[index + 1];
                    // 检查前面是否有value
                    if (!preNode || preNode.type !=='value') {
                        originValue.push({
                            type: 'value',
                            padding: true,
                            value: ''
                        })
                    }

                    // 调整function的arguments
                    if (it.type =='function') {
                        it.parameters = this.paddingParameters(it) 
                    }
                    
                    originValue.push(it);


                    if (!nextNode || nextNode.type !=='value') {
                        originValue.push({
                            type: 'value',
                            padding: true,
                            value: ''
                        })
                    }
                }
            })

            return originValue;
        } else {
            return [{
                type: 'value',
                value: value
            }]
        }
    }
    private paddingParameters(item: any) {

        let funcmeta: any = FunctionManger.get(item.name) || {};
        let paramsmeta: any = funcmeta.parameters|| [];
        let restParams: any = paramsmeta[paramsmeta.length -1];

        let displayMaxLength: number = restParams.type == 'rest' ? paramsmeta.length -1 : paramsmeta.length ;


        let parameters: any = [...(item.parameters || [])];
        
        if (parameters.length < displayMaxLength) {
            Array.from({length: displayMaxLength - parameters.length}).map(it => {
                parameters.push({
                    type: 'value',
                    padding: true,
                    value: ''
                })
            })
        }

        return parameters;
    }
    private renderFunction(item:any, index:number) {
        
        return (
            <FormerScopeFunction 
                name={item.name} 
                key={[item.name, this.state.reflush, index].join('.')}
                parameters={item.parameters}
                onAddParam={()=> {
                    item.parameters.push({
                        type: 'value',
                        value: ''
                    })

                    
                    this.doChangeValue();
                    this.doFocus()
                }}
            >
                {item.parameters.map((it, idx)=> {
                    return (<FormerScopeValue 
                                key={[item.name,this.state.reflush, idx].join('.')}
                                level={this.state.level-2} 
                                index={ index + this.getDefaultIndex(this.state.level -1) * (idx+1)} 
                                context={this.context} 
                                onRemoveValue={(currentIndex) => {
                                    return this.doRemoveScopeValue(item.parameters, idx, currentIndex)
                                    /*if (idx == 0) {
                                        return false
                                    }
                                    item.parameters.splice(Math.max(0,idx-1), 1);
                                    
                                    this.doChangeValue(undefined, true);*/
                                }}
                                onChangeValue={(value: any)=> {
                                    it.value = value;
                                    this.doChangeValue();                        
                                }} 
                                value={it.value} 
                                parentScope= {null}
                            />)
                })}
            </FormerScopeFunction>
        )
    }
    private renderScope(item: any ,parentIndex:number ) {
        
        return (
            <FormerScopeLabel {...item}/>
        )
    }
    private renderVariable(item: any, parentIndex:number) {
        return (
            <FormerVariable {...item} />
        )
    }
    private renderContent =(item: any, index: number, remove: Function)=> {
        let parentIndex: number = (index+1) * this.getDefaultIndex() + this.state.index;
        switch (item.type) {
            case 'function':
                return this.renderFunction(item, parentIndex);
            case 'variable':
                return this.renderVariable(item, parentIndex);
            case 'scope':
                return this.renderScope(item, parentIndex);
            default:
                return (
                    <FormerScopeValue 
                        key = {[item.type, this.state.reflush, index].join('.')}
                        onRemoveValue={remove}  
                        level={this.state.level-1} 
                        index={parentIndex}
                        serial={index}
                        context={this.context} 
                        value={item.value} 
                        parentScope= {this}
                        onChangeValue={(val)=> {
                            item.value = val;
                            this.doChangeValue();
                        }}  
                    />
                )
        }
    }
    private onRemoveValue(currentIndex?: number) {
        if (this.props.onRemoveValue ) {
            return this.props.onRemoveValue(currentIndex)
        }
    }
    private getDefaultIndex(_level?: number) {
        let level = _level || this.state.level;
        return Math.pow(10, level);
    }
    public addValueIntoScope(cursorPosition: number, inputValue: string, serial: number, scopeValue: any, currentIndex: number) {
        let originValue: any = this.state.originValue;
        let range: any = this.context.findInputRange();
        let focusPosition: number = 0;
        // 有选取的时候
        
        if (range && range.length>0) {

            // 需要替换掉 选取的文字
            if (range.start == 0) {
                // 前面部分截取
                if (range.end < inputValue.length) {
                    originValue.splice(serial,1, scopeValue, {
                        type: 'value',
                        value: inputValue.substring(range.end, inputValue.length)
                    })
                } else {
                    // 全部截取
                    originValue.splice(serial, 1, scopeValue)
                }
            } else {
                // 中间解决
                if (range.end < inputValue.length) {
                    originValue.splice(serial, 1, {
                        type: 'value',
                        value: inputValue.substring(0, range.start)
                    },scopeValue, {
                        type: 'value',
                        value: inputValue.substring(range.end, inputValue.length)
                    });
                } else {
                    // 后面截取
                    originValue.splice(serial, 1, {
                        type: 'value',
                        value: inputValue.substring(0, range.start)
                    }, scopeValue)
                }
            }

        }  else {
            

            if (cursorPosition == 0) {

                originValue.splice(serial, 0, scopeValue);
                
            } else {
                // 在后面加
                if (cursorPosition == inputValue.length) {
                    originValue.splice(serial + 1, 0, scopeValue);
                } else {
                    // 中间拆分
                    let beforeText: string = inputValue.substring(0,cursorPosition);
                    originValue.splice(serial, 1, 
                        {
                            type: 'value', value: beforeText
                        },
                        scopeValue,
                        {
                            type: 'value',
                            value: inputValue.substring(cursorPosition, inputValue.length)
                        }
                    );

                }
            }
        }
        
        this.doChangeValue();
        this.doFocus(currentIndex + 1, focusPosition)
    }

    private doRemoveScopeValue(originValue: any, index: number, currentIndex: number) {
        
        if (index ==0) {
            return false;
        }
        
        // 需要判断上一个值是否是是value
        let prevScpoe: any = originValue[index - 1];
        let currentCusorposition: number = -1;
        if (prevScpoe.type == 'value') {
            if (this.isSampleScopeValue(prevScpoe) && prevScpoe.value.length > 0) {
                
                // 当值大于零的时候，焦点
                prevScpoe.value = prevScpoe.value.substring(0, prevScpoe.value.length - 2)
                currentIndex--;
            } else {
                originValue.splice(index - 1, 1);
            }
            
        } else {
            // 判断他前面一个是否是value节点，如果是就合并
            let prevnextscope: any = originValue[index - 2];
            let currentScope: any = originValue[index];
            
            // 合并删除
            if (this.isSampleScopeValue(prevnextscope)) {
                currentScope.value = prevnextscope.value + currentScope.value;
                delete currentScope.padding;
                originValue.splice(index - 2, 3, currentScope);
                currentIndex -=2;
                currentCusorposition = prevnextscope.value.length;
            } else {
                // 直接删除
                originValue.splice(index - 1, 1);
            }

        }

        this.doChangeValue(undefined, true);
        this.doFocus(currentIndex, currentCusorposition);
        return false;
    }
    private isSampleScopeValue(scope: any) {
        if (scope && scope.type == 'value') {
            return !Array.isArray(scope.value)
        }
    }
    private doFocus(currentIndex?: number, cursorPosition?: number) {
        setTimeout(()=> {
            this.context.onFocus(currentIndex, cursorPosition)
        }, 0)
    }
    public render() {
        let { value, originValue } = this.state;
        
        if (Array.isArray(value)) {
            return (
                <>
                    {originValue.map((it,index)=> {
                        return this.renderContent(it,index, (currentIndex: any) => {
                            return this.doRemoveScopeValue(originValue, index, currentIndex)
                        })
                    })}
                </>
            )
        } else {
            return (
                <FormerScopeInput serial={this.props.serial} parentScope={this.props.parentScope || this} onRemoveValue={(current: any)=>{
                   return this.onRemoveValue(current)
                }} context={this.context} index={this.state.index} onChangeValue={(val)=> {
                    this.doChangeValue(val)
                }} value={value as string} />
            )
        }
    }
}