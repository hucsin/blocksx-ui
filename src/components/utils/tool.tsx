import React from 'react';
import { utils } from '@blocksx/core';
import { Tag, Space } from 'antd'
import * as FormerTypes from '../Former/types';
import * as Icons from '../Icons';


export default class TablerUtils {

    private static valueTypeMap: any = {
        'select': 'xstring',
        'radio': 'xstring',
    }

    public static isMatchValue(target: any, value: any) {
        let keys: any = Object.keys(target);

        let match = keys.filter(key => {
            // console.log(key, value[key], target[key], 88777777)
            return value[key] === target[key]
        })
        return (match.length == keys.length) && (keys.length === Object.keys(value).length);
    }

    public static renderIconComponent(field: any) {
        if (field.icon && Icons[field.icon]) {
            let UIView: any = Icons[field.icon];
            return <UIView key={field.key || field.icon} />
        }
    }
    public static renderComponentByField(field: any, props: any, defaultComponent?: any) {
        // 当当前字段是存在action的时候
        //if (field.action) {
        let uiType: string = field.uiType || field.type;
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
                        return field.motion({
                            ...props.recordValue,
                            [field.key]: v
                        })
                    }} />
                )
            } else {
                if (UiView = UiView.Viewer) {
                   
                    return (
                        <UiView key={field.key} viewer={true} {...field} {...props} />
                    )
                    
                }
            }
        }
        let value: any = props.displayValue || props.value;
        if (utils.isValidValue(value)) {
            return (
                <Space size={'small'} key={'c' + field.key}>
                    {TablerUtils.renderIconComponent({
                        icon: field.icon || value.icon
                    })}
                    {TablerUtils.renderValue(field, value)}
                    {props.suffix}
                </Space>
            )
        } else {
            return defaultComponent ? defaultComponent : <span key={233} className='ui-label-empty'>{'<null>'}</span>
        }
    }

    public static renderValue(field: any, value: any) {
        // 判断是label对象

        if (utils.isArray(value)) {
            return value.map((it: any, index: number) => {
                return <Tag key={index}>{this.renderValue(field, it)}</Tag>
            })
        }

        if (utils.isLabelValue(value)) {
            return value.label;
        } else {
            if (utils.isLabelValueList(field.dict)) {
                let labelValue: any = field.dict.find(it => it.value == value);
                if (labelValue) {
                    return labelValue.label;
                }
            }

            return value;
        }
    }


    public static getFieldValidation(field: any) {
        return {
            minLength: 1,
            maxLength: field.fieldLength,
            ...field.validator,
            required: field.isRequired
        }
    }

    private static getDefaultPropsByItem(it: any) {
        let defaultProps: any = {};

        if (it.dict) {
            defaultProps.dataSource = it.dict;
        }

        if (it.dataSource) {
            defaultProps.dataSource = it.dataSource;
        }

        return defaultProps;
    }

    public static getValidationValue(it: any) {

        let valueType: string = this.valueTypeMap[it.uiType] || it.type || 'xstring';

        if (it.validation) {
            return {
                type: it.validation.type || valueType,
                ...it.validation
            }
        }

        if (utils.isValidValue(it.required)) {
            return {
                type: valueType,
                required: it.required
            }
        }
    }


    public static getDefaultSchemaProperties(fields?: any) {
        let fieldsObject: any = {};

        fields.forEach((it: any, index: number) => {
            let fieldKey: string = it.key || it.fieldKey;

            if (it.column !== 'only') {
                fieldsObject[fieldKey] = {
                    ...it,
                    type: it.type || 'string', // 统一当string处理
                    defaultValue: it.defaultValue,
                    title: it.name,
                    description: it.description,
                    column: it.column,

                    'x-modify': it.modify || it['x-modify'],
                    'x-group': it.group,
                    'x-classify': it.group,
                    'x-half-width': false,

                    'x-type-props': Object.assign({}, it.props, it.meta && it.meta.props),
                    'x-type': it.uiType || 'input',
                    'x-colspan': it.colspan,

                    'x-index': utils.isNullValue(it.index) ? index : it.index,
                    'x-control': it.control,
                    'x-validation': this.getValidationValue(it),
                    properties: it.fields ? this.getDefaultSchemaProperties(it.fields) : null,
                    ... this.getDefaultPropsByItem(it)
                }
            }
        });



        return fieldsObject;
    }
    public static getDefaultSchema(fields?: any) {
        return {
            type: 'object',
            "title": "xxx",
            properties: this.getDefaultSchemaProperties(fields)
        }
    }
}