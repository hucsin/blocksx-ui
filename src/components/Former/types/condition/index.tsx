import React from 'react';
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
}

const LogicSymbol = Regular.Logic.symbol;

export default class FormerCondition extends React.Component<FormerConditionProps, FormerConditionState> {

    private logicMap: any =  [
        ['allOf', 'AllOfUtilityOutlined'],
        ['anyOf', 'AnyOfUtilityOutlined'],
        ['oneOf', 'OneOfUtilityOutlined'],
        ['allNotOf', 'AllNotOfUtilityOutlined'],
        ['anyNotOf', 'AnyNotOfUtilityOutlined'],
        ['oneNotOf', 'OneNotOfUtilityOutlined']
    ];

    public constructor(props: FormerConditionProps) {
        super(props);

        this.state = {
            value: {
                type: 'logic',
                logic: 'allOf',
                value: [
                    {
                        type: 'tuple',
                        value: {
                            leftValue: 1,
                            operator: '=',
                            rightValue: 1,
                        }
                    },
                    {
                        type: 'logic',
                        logic: 'oneOf',
                        value: [
                            {
                                type: 'tuple',
                                value: {
                                    leftValue: 2,
                                    operator: '=',
                                    rightValue: 2
                                }
                            }
                        ]
                    }
                ]
            }
        }
    }
    public  UNSAFE_componentWillReceiveProps(nextProps: Readonly<FormerConditionProps>, nextContext: any): void {
        if (nextProps.value != this.state.value ) {
            this.setState({
             //   value: nextProps.value
            })
        }
    }
    public doChangeValue() {
        this.setState({
            value: this.state.value
        })
    }
    public getSlotChild() {
        let slot: any = {};
        this.props.children.map(it => {
            slot[it.key] = it;
        })
        return slot;
    }
    public renderTuple(tuple: any, slotMap: any) {
        return (
            <div className='ui-regular-tuple'>
                <Space.Compact block>
                    {React.cloneElement(slotMap.left, {})}
                    {React.cloneElement(slotMap.operator, {})}
                    {React.cloneElement(slotMap.right, {})}
                </Space.Compact>
            </div>
        )
    }
    
    public renderLogic(logic: any, slotMap: any) {

        return (
            <div className='ui-regular-logic'>
                {logic.value.map(it=> {
                    if (it.type =='tuple') {
                        return this.renderTuple(it, slotMap)
                    }
                    return this.renderLogic(it, slotMap)
                })}

                {this.renderLogicType(logic.logic, (value) => {
                    logic.logic = value;
                    this.doChangeValue();
                })}
                <div className='ui-condition-toolbar'>
                    <Space.Compact block>
                        <Button  size="small" icon={<Icons.FolderAddOutlined/>}>group</Button>
                        <Button  size="small" icon={<Icons.PlusOutlined/>}>rule</Button>
                    </Space.Compact>
                </div>
                <div className='ui-condition-remove'><Icons.DestroyUtilityOutlined /></div>
            </div>
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
                {value.type == 'tuple' ? this.renderTuple(value, slotMap) : this.renderLogic(value, slotMap)}
            </div>
        )
    }
}