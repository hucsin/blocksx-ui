/**
 * 单元格
 * 表格行单元格渲染组件，目前支持
 * 开关，标签，标签（颜色），词典枚举
 */
import React from 'react';

import classnames from 'classnames';
import { utils } from '@blocksx/core';
import { TablerField, LabelValue } from './typings';

import * as formerMap from '../Former/types';
import * as DesignIcons from '../Icons/index';
import { Input, Popover } from 'antd';

import TablerUtils from '../utils/tool';

export interface TablerCellProps {
    field: TablerField,
    editable?: boolean;// 标记是否可编辑
    onChange?: Function ;
    value: any,
    record: object,
    rowIndex: number,
    colIndex: number,
    onClickCell?: Function;

}

export interface TablerCellState {
    dictMap: object;
    editable?: boolean;
}


export default class TablerCell extends React.Component<TablerCellProps, TablerCellState> {
    public constructor (props: TablerCellProps) {
        super(props);
        this.state = {
            dictMap: {},
            editable: props.editable
        }
    }
    public UNSAFE_componentWillReceiveProps(newProps:TablerCellProps) {
        if(newProps.editable !== this.state.editable) {
            this.setState({
                editable: newProps.editable
            })
        }
    }
    public componentDidMount () {
        let { field } = this.props;
        let dict:any = field.dict;
        if (dict) {
            if (utils.isFunction(dict)) {
                dict = (field.dict as Function)();

                if (utils.isPromise(dict)) {
                    return dict.then((_dict: LabelValue[]) => {
                        this.setDictMap(_dict)
                    })
                }
            } 
            if (utils.isArray(dict)) {
                this.setDictMap(dict)
            }
        }
    }
    private setDictMap (dict: LabelValue []) {
        let dictMap = {};

        dict.forEach((it: LabelValue) => {
            dictMap[it.value] = it;
        });

        this.setState({
            dictMap: dictMap
        })
    }

    private getValue (value: any) {
        let { dictMap = {} } = this.state;
        let dict: any = dictMap[value];

        if (utils.isUndefined(dict)) {
          return value;
        }

        if (dict.icon) {
          let Icon: any = DesignIcons[dict.icon];
          if (Icon) {          
            return (
              <React.Fragment>
                <Icon/>
                {dict.label}
              </React.Fragment>
            )
          }
        }
        // 有提示的
        if (dict.remarks) {
          return (
            <React.Fragment>
              {dict.label}
              <Popover content={
                dict.remarks
              }>
                <span className="design-tabler-cell-icon">
                  <DesignIcons.InfoCircleOutlined />
                </span>
              </Popover>
            </React.Fragment>
          )
        }

        return dict.label;
    }
    private renderCell () {
        let { field = {}, value } = this.props;
        let props: any = {
            ...this.props,
            ...(field['props']  || field['x-type-props']),
        }

         return TablerUtils.renderComponentByField(field, {
            value: this.props.value,
            recordValue: this.props.record,
            ...props
         });

    }
    private renderEditableCell () {
        let field: TablerField = this.props.field;
        let View = formerMap[field.type] || Input;

        return (
            <View 
                value = {this.props.value} 
                onChangeValue = {(value: any) => {
                    if (this.props.onChange) {
                        this.props.onChange(value)
                    }
                }}
            ></View>
        )
    }
    /**
     * 1、除非指定了 tablerColumnType ，不然模式=只支持，switch， select
     * 2、
     */
    private onClickCell =()=> {
        this.props.onClickCell && this.props.onClickCell()
    }
    public render () {
        let { editable } = this.props;
        
        if ( editable ) {
            return this.renderEditableCell()
        } else {
            return (
                <span className={
                    classnames({
                        'tabler-cell-wraper': true,
                        'tabler-cell-first': this.props.colIndex === 0,
                    })
                }
                    onClick={this.onClickCell}
                >
                    {this.renderCell()}
                </span>
            )
        }
    }
}