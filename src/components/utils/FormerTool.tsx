import React from 'react';
import { utils } from '@blocksx/core';
import { Tag, Space, Tooltip } from 'antd'
import * as FormerTypes from '../Former/types';
import TablerUtils from './tool';
import SmartAction from '../core/SmartAction';


export default class FormerTool {

    public static renderComponentByField(field: any, props: any, defaultComponent?: any) {
        // 当当前字段是存在action的时候
        //if (field.action) {
        let uiType: string = field.uiType || field.type;
        

        if (utils.isPlainObject(field.column)) {
            if (field.column.uiType) {
                uiType = field.column.uiType;
            }
        }


        let UiView: any = FormerTypes[uiType];

       
        let record: any = props.recordValue || {};
        let DisplayValue: any = record['DisplayValue_' + field.key]

        if (DisplayValue) {
            props.value = DisplayValue
        }

        if (utils.isFunction(defaultComponent)) {
            return defaultComponent(field)
        }

        
        
        if (UiView) {
            if (utils.isFunction(field.motion)) {

                return (
                    <UiView key={field.key} size="default"  {...props} loading={true} onChangeValue={(v) => {
                        
                        return new Promise((resolve, reject)=> {
                            field.motion({
                                ...props.recordValue,
                                [field.key]: v
                            }).then(data=> {
                                if (data && data.smartaction) {
                                    
                                    return SmartAction.doAction(data, () => {
                                        
                                        resolve(data)
                                    })
                                }
                                
                                resolve(data)
                            }).catch(reject)
                        })
                    }} />
                )
            } else {
                if (UiView = UiView.Viewer) {
                   
                    return (
                        <UiView viewer={true} {...field} {...props}  key={field.key}  />
                    )
                    
                }
            }
        }
        let value: any = props.displayValue || props.value;
        
        if (utils.isValidValue(value)) {
            let iconField: any = this.findIconInField(field, value);
            
            return (
                <Space size={'small'} key={'c' + field.key}>
                    <span className='ui-text'>
                        {iconField ? <Tooltip title={field.fieldName}>{TablerUtils.renderIconComponent({
                            icon: this.findIconInField(field, value)
                        })}</Tooltip> : null}
                        <Tooltip placement="topLeft" rootClassName="ui-tooltip" title={field.summary ? utils.isString(field.summary) ? field.summary : value : ''}>
                            {TablerUtils.renderValue(field, value)}
                        </Tooltip>
                    </span>
                    {props.suffix}
                </Space>
            )
        } else {
            return defaultComponent ? defaultComponent : <span key={233} className='ui-label-empty'>{'<null>'}</span>
        }
    }

    public static findIconInField(field: any, value) {
        if (field.dict) {
            let find: any = field.dict.find(it => it.value == value);
            if (find && find.icon) {
                return find.icon
            }
        }
        return field.icon || value.icon;
    }
}