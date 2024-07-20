import React from 'react';
import './style.scss';
import { Space, Button } from 'antd';

interface FormerConditionProps {
    children: any;
    value: any;
    onChangeValue: Function;
}
interface FormerConditionState {
    value: any;
}

export default class FormerCondition extends React.Component<FormerConditionProps, FormerConditionState> {
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
                <Space.Compact>
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
                <div>
                    <Button>Add group</Button> <Button>Add rule</Button>
                </div>
            </div>
        )
    }
    public render() {
        let value: any = this.state.value || {};
        let slotMap: any = this.getSlotChild();
        console.log(value,3)
        return (
            <div className='ui-former-condition'>
                {value.type == 'tuple' ? this.renderTuple(value, slotMap) : this.renderLogic(value, slotMap)}
            </div>
        )
    }
}