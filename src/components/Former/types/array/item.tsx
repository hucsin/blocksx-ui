import React from 'react';

import { IFormerBase } from '../../typings';
import { Popconfirm, Tooltip } from 'antd';
import * as Icons from '../../../Icons';
import StepFormer from '../../StepFormer';

import { pick } from 'lodash'

interface IFormerArrayItem extends IFormerBase {
    index: number;
    isLastItem: boolean;
    onArrayItemRemove: Function;
    onArrayItemMove: Function;
    children?:any;
    moreItems?: any;
    value: any;
}

export default class FormerArrayItem extends React.Component<IFormerArrayItem, {value: any}> {
    public constructor(props: IFormerArrayItem) {
        super(props);

        this.state = {
            value: props.value
        }
    }
    // 删除项
    private onArrayItemRemove =()=> {
        if (this.props.onArrayItemRemove) {
            this.props.onArrayItemRemove(this.props.index);
        }
    }
    private onArrayItemMove =(step: number)=> {
        if (this.props.onArrayItemMove) {
            this.props.onArrayItemMove(this.props.index, step);
        }
    }
    public render() {
        let moreItemfields: any = this.props.moreItems && this.props.moreItems.fields && this.props.moreItems.fields.map(it=> it.fieldKey);
        
        
        return (
            <div className="former-array-item" data-index={this.props.index +1}>
                {this.props.children}
                <div className='fomre-array-item-toolbar'>
                    {!this.props.isLastItem &&<Tooltip placement="left" title="Move down one line"><Icons.MoveDownDirectivityOutlined  onClick={()=> this.onArrayItemMove(1)} /></Tooltip>}
                    {this.props.index !==0 &&<Tooltip placement="left" title="Move up one line"><Icons.MoveUpDirectivityOutlined onClick={()=> this.onArrayItemMove(-1)} /></Tooltip>}
                    
                </div>
                {this.props.moreItems &&<div className='former-array-advanced-wrapper'> <StepFormer
                    schema = {this.props.moreItems}
                    onChangeValue = {()=>{}}
                    formerType="popover"
                    value={this.state.value}
                    readonly={this.props.disabled}
                    width={500}
                    pageMeta={{
                        icon: 'SettingUtilityOutlined'
                    }}
                    okText='Save'
                    iconType='icon'
                    title="Advanced Setting"
                    size="small"
                    onSave={(value)=> {
                        let trueValue: any = {...pick(value,moreItemfields)}
                        this.setState({
                            value: trueValue
                        })
                        this.props.onChangeValue && this.props.onChangeValue(trueValue, this.props.index)
                    }}
                ><div className='former-array-advanced'><Icons.ControlOutlined/> Advanced Setting</div></StepFormer></div>}
                <div className='former-array-item-remove'>
                    <Tooltip placement="top" title="Delete the line"><Popconfirm
                        title="Confirm deletion of array item"
                        onConfirm ={this.onArrayItemRemove}
                    ><Icons.DestroyUtilityOutlined /></Popconfirm></Tooltip>
                </div>
            </div>
        )
    }
}