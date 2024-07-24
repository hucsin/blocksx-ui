import React from 'react';
import { utils } from '@blocksx/core';
import classnames from 'classnames';
import Regular from '@blocksx/regular';

import './style.scss';
import { Space, Button, Select, Tooltip } from 'antd';
import * as Icons from '../../../Icons';


interface FormerConditionProps {
    children: any;
    value: any;
    onChangeValue: Function;
}
interface FormerConditionState {
    value: any;
    index: number;
    left: number;
    right: number;
}

const LogicSymbol = Regular.Logic.symbol;
const TupleSymbol = Regular.Tuple.symbol;

export default class FormerCondition extends React.Component<FormerConditionProps, FormerConditionState> {

    private logicMap: any =  [
        ['allOf', 'AllOfUtilityOutlined'],
        ['anyOf', 'AnyOfUtilityOutlined'],
        ['oneOf', 'OneOfUtilityOutlined'],
        ['allNotOf', 'AllNotOfUtilityOutlined'],
        ['anyNotOf', 'AnyNotOfUtilityOutlined'],
        ['oneNotOf', 'OneNotOfUtilityOutlined']
    ];
    private index: number;
    public constructor(props: FormerConditionProps) {
        super(props);

        this.state = {
            value: props.value ,
            index: 0,
            left: 0,
            right: 0
        };
        this.index = 1;
    }
    public  UNSAFE_componentWillReceiveProps(nextProps: Readonly<FormerConditionProps>, nextContext: any): void {
        if (nextProps.value != this.state.value ) {
            this.setState({
                value: nextProps.value
            })
        }
    }
    public doChangeValue(noChange?: boolean) {
        this.setState({
            index: 0,
            left: 0,
            right: 0,
            value: utils.copy(this.state.value)
        }, ()=> {
            !noChange && this.props.onChangeValue(this.state.value)
        })

        
    }
    public getSlotChild() {
        let slot: any = {};
        this.props.children.map(it => {
            slot[it.key] = it;
        })
        return slot;
    }
    public renderTuple(tuple: any, slotMap: any, changeValue: Function, index: number) {
        let caseInsensitive: any = TupleSymbol[tuple.value.operator] || {};
        let hideLeft: any = this.state.right == index;
        let hideRight: any = this.state.left == index;
        
        return (
            <div className={classnames({
                'ui-regular-tuple': true,
                'ui-conditioin-hascase': caseInsensitive.case,
                'ui-regular-hide-left': hideLeft,
                'ui-regular-hide-right': hideRight
            })}>
                <Space.Compact block>
                    {React.cloneElement(slotMap.left, {
                        value: tuple.value.left,
                        props: hideLeft ? {
                            width: 0
                        } : hideRight ? { width: 'calc(100% - 23px)'}: undefined,
                        onFocus: ()=> {
                            this.setState({left: index})
                        },
                        onBlur: ()=> {
                            this.setState({left: 0})
                        },
                        onChangeValue: (value)=> {
                            tuple.value.left = value;
                            changeValue(tuple.value)
                        }
                    })}
                    {React.cloneElement(slotMap.operator, {
                        value: tuple.value.operator,
                        onChangeValue: (value) => {
                            tuple.value.operator = value;
                            changeValue(tuple.value)
                        }
                    })}
                    { caseInsensitive.case &&<Tooltip title={ !tuple.value.case ? "Case sensitive" : "Case insensitive"}><Button className={tuple.value.case ? 'case-insensitive' : ''} onClick={()=> {
                        tuple.value.case = !tuple.value.case;
                        changeValue(tuple.value)
                    }}><Icons.CaseUtilityOutlined/></Button></Tooltip>}
                    {!caseInsensitive.single && React.cloneElement(slotMap.right, {
                        value: tuple.value.right,
                        props: hideRight ? {
                            width: 0
                        } : hideLeft ? {width: "calc(100% - 23px)"} : undefined,
                        onFocus: ()=> {
                            this.setState({right: index})
                        },
                        onBlur: ()=> {
                            this.setState({right: 0})
                        },
                        onChangeValue:(value: any)=> {
                            tuple.value.right = value;
                            changeValue(tuple.value)
                        }
                    })}
                </Space.Compact>
                <Tooltip placement='topLeft' arrow={{pointAtCenter: true}} title="Remove the current group">
                        <Icons.DestroyUtilityOutlined  onClick={()=> {
                            if (changeValue) {
                                changeValue(null)
                            } else {
                                this.doChangeValue();
                            }
                        }}/>
                    </Tooltip>
            </div>
        )
    }
    
    public renderLogic(logic: any, slotMap: any, changeValue?: Function, index: number =1)  {
        
        return (
            <div 
                className={classnames({
                    'ui-regular-logic': true,
                    'ui-regular-logic-hover': index == this.state.index
                })}
                onMouseOver={(e)=> {
                    this.setState({
                        index: index || 1
                    })
                    e.stopPropagation();
                }}
                onMouseOut={(e)=> {
                    this.setState({
                        index: 0
                    })
                    //e.stopPropagation();
                }}
            >
                <div>
                {logic.value.map((it, idx)=> {
                    if (it.type =='tuple') {
                        return this.renderTuple(it, slotMap, (value) => {
                            if (!value) {
                                logic.value.splice(index, 1)
                            } else {
                                it.value = value;
                            }
                            this.doChangeValue();
                        }, index * 1000 + idx)
                    }
                    return this.renderLogic(it, slotMap, ()=> {
                        logic.value.splice(index, 1);
                        this.doChangeValue();
                    }, index* 1000 + idx)
                })}
                </div>

                {this.renderLogicType(logic.logic, (value) => {
                    logic.logic = value;
                    this.doChangeValue();
                })}
                {logic.value.length ? <div className='ui-condition-toolbar'>
                    {this.renderAddButton((value)=> {
                        logic.value.push(value)
                        this.doChangeValue();
                    })}
                </div> : this.renderAddButton((value)=> {
                        logic.value.push(value)
                        this.doChangeValue();
                    })}
                <div className='ui-condition-remove'>
                    <Tooltip placement='topLeft' arrow={{pointAtCenter: true}} title="Remove the current group">
                        <Icons.DestroyUtilityOutlined  onClick={()=> {
                            if (changeValue) {
                                changeValue()
                            } else {
                                logic.value = [];
                                this.doChangeValue();
                            }
                        }}/>
                    </Tooltip>
                </div>
            </div>
        )
    }
    private renderAddButton(changeValue: Function) {
        return (
            <Space.Compact block>
                
                <Button onClick={()=> {
                    changeValue({
                        type: 'tuple',
                        value: {
                            operator: '='
                        }
                    })
                }} size="middle"  icon={<Icons.PlusOutlined/>}>Rule</Button>

<Button  size="middle" onClick={()=> {
                    changeValue({
                        type: 'logic',
                        logic: 'allOf',
                        value: [
                            {
                                type: 'tuple',
                                value: {
                                    operator: '='
                                } 
                            }
                        ]
                    })
                }} icon={<Icons.FolderAddOutlined/>}>Group</Button>
            </Space.Compact>
        )
    }
    private renderLogicType(value: string, changeValue: Function) {
       
        return (
            <Tooltip title={LogicSymbol[value].label}>
                <Select 
                    variant="borderless" 
                    size='small'
                    value={value}
                    popupMatchSelectWidth={false}
                    onChange={(v)=> changeValue(v)}
                    options={this.logicMap.map(it => {
                        let IconView: any = Icons[it[1]];
                        return {
                            value: it[0],
                            label: (<>
                                <IconView/>
                                <span style={{paddingLeft: 8}}>{LogicSymbol[it[0]].label}</span>
                            </>)
                        }
                    })}
                />
            </Tooltip>
        )
    }
    public render() {
        let value: any = this.state.value || {};
        let slotMap: any = this.getSlotChild();
        
        return (
            <div className='ui-former-condition'>
                {value.type == 'logic' && this.renderLogic(value, slotMap, undefined, this.index)}
            </div>
        )
    }
}