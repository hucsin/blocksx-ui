import React from 'react';
import { utils } from '@blocksx/core';
import { Tag } from 'antd'
import * as Icons from '../Icons';
import CombineIcon from '../Icons/CombineIcon';
import Session from '../core/Session';


export default class TablerUtils {

    private static valueTypeMap: any = {
        'select': 'xstring',
        'radio': 'xstring',
    }

    public static isMatchValue(target: any, value: any) {
        let keys: any = Object.keys(target);
        let matchvalue: any = {
            ...value,
            'session.plan': Session.getUserPlan()
        }

        let match = keys.filter(key => {
            // console.log(key, value[key], target[key], 88777777)
            if (Array.isArray(target[key])) {
                return target[key].includes(matchvalue[key])
            }
            return matchvalue[key] === target[key]
        })
        return (match.length == keys.length) //&& (keys.length === Object.keys(value).length);
    }

    public static renderIconComponent(field: any) {
        let icon: string = field.icon;

        if (utils.isString(icon)) {

            let iconsplit: any = icon.split('#');
            let iconstring: string = iconsplit[0];

            if (iconstring && Icons[iconstring]) {
                let UIView: any = Icons[iconstring];

                return <UIView style={{color:field.color}} size={field.size} key={iconstring || icon || 'j'} />
            }
        } else {
            if (Array.isArray(icon) ) {
                if (icon.length == 2) {
                    return <CombineIcon key={icon} subscript={this.renderIconComponent({icon:icon[1]})} main={this.renderIconComponent({icon:icon[0]})}/>
                } else {
                    return this.renderIconComponent({
                        icon: icon[0]
                    })
                }
            }
        }
        return field.icon;
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

    public static makeField(field:any) {
        let fieldMeta: any = field.meta || {
            type: 'input'
        }
        return {
            ...field,
            key: field.fieldKey,
            fieldKey: field.fieldKey,
            ...fieldMeta,
            control: field.fieldControl,
            uiType: fieldMeta.type,
            type: field.fieldType,
            column: fieldMeta.column,
            columnGroup: field.columnGroup,
            tablerColumn: fieldMeta.column ? {
                filter: field.isIndexed,
            } : null,
            colspan: fieldMeta.colspan || 1,
            dict: field.fieldDict,
            step: fieldMeta.step,
            defaultValue: field.defaultValue,
            name: field.fieldName || field.fieldKey,
            validation: this.getFieldValidation(field),
            'x-label-hidden': fieldMeta.label === false ? true : false
        }
    }
    public static getFieldValidation(field: any) {
        
        return {
            minLength: 1,
            maxLength: field.fieldLength,
            ...field.validator,
            required: field.isRequired || field?.meta?.required
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
        // 特殊处理array
        if (it.uiType == 'array') {
            if (it.fields) {
                let moreItems: any = it.fields.filter(it => it.major === false);
                if (moreItems.length) {
                    defaultProps.moreItems = {
                        fields: moreItems
                    }//this.getDefaultSchema(moreItems);
                }
                
            }
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

    public static getDefaultFieldSchema(it:any, index) {
       
        let props: any = Object.assign({}, it.props, it.meta && it.meta.props);
        let meta: any = it.meta || {};
        return {
            ...it,
            type: it.type || 'string', // 统一当string处理
            defaultValue: it.defaultValue,
            title: utils.labelName(it.name || it.fieldName),
            description: it.description,
            column: it.column,

            'x-modify': it.modify || it['x-modify'],
            'x-group': it.group,
            'x-classify': it.group,
            'x-float': meta.float,
            'x-clear': meta.clear,
            'x-half-width': false,
            'x-portal': it.portal,

            'x-type-props': props,
            'x-type': it.uiType || meta.type || 'input',
            'x-colspan': it.colspan,
            //'x-model-switch': true,
            'x-label-bold': meta.labelbold,
            'x-label-icon': meta.labelicon,

            'x-index': (it.key || it.fieldKey || '').indexOf('_') == 0 ? -1 : utils.isNullValue(it.index) ? index : it.index,
            'x-control': it.control,
            'x-validation': this.getValidationValue(it),
            [`${it.uiType =='array' ? 'items': 'properties'}`]: 
                it.fields ? 
                    it.uiType =='array' 
                        ? this.getDefaultSchemaArrayItems(it.fields, props) 
                        : this.getDefaultSchemaProperties(it.fields) 
                : null,
            
            ... this.getDefaultPropsByItem(it)
        }
    }

    public static getDefaultSchemaArrayItems(fields: any, props) {
        // arary 过滤
        
        return this.getDefaultSchema(fields.filter(it=> it.major !== false).map(it => {
            
            if (props.disabled) {
                it.props = Object.assign({}, it.props || {}, {
                    disabled: true
                })
            }
            
            return it;
        }))

    }
    public static getDefaultSchemaProperties(fields?: any) {
        let fieldsObject: any = {};
        let splitObject: any = {};

        fields.forEach((it: any, index: number) => {
            let fieldKey: string = it.key || it.fieldKey;

            if (!this.isColumnOnly(it)) {
                // 如果是带有$符号的key
                
                if (fieldKey.indexOf('$')  > 1) {

                    let split: any = fieldKey.split('$');

                    if (!splitObject[split[0]]) {
                        fieldsObject[split[0]] = {
                            type: 'object',
                            uiType: 'object',
                            'x-index': index,
                            'x-group':  it.group || '2',
                            defaultValue: {},
                            'x-colspan': 2
                        };
                        splitObject[split[0]] = []
                    }

                    splitObject[split[0]].push({
                        ...it,
                        key: split[1],
                        group: '',
                        fieldKey: split[1]
                    })


                } else {
                
                    fieldsObject[fieldKey] = this.getDefaultFieldSchema(it, index)
                }
            }
        });

        // 合并
        Object.entries(splitObject).forEach(([key, value]) => {
            fieldsObject[key].properties = this.getDefaultSchemaProperties(value)
        })

        return fieldsObject;
    }
    public static isColumnOnly(field: any) {
        let {column} = field;
        
        if (utils.isPlainObject(column)) {
            return column.only;
        }

        return column == 'only';
    }

    public static getFieldKeysByColumnOnly(fields: any) {
        return fields.filter(it=> this.isColumnOnly(it)).map(it => it.key || it.fieldKey)
    }
    public static getDefaultSchema(fields?: any) {
        return {
            type: 'object',
            "title": "xxx",
            properties: this.getDefaultSchemaProperties(fields)
        }
    }

    public static  toggleFullscreen(elem: any) {
        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) { // Firefox
          elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) { // Chrome, Safari, Opera
          elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { // IE/Edge
          elem.msRequestFullscreen();
        }
    }

    public static downloadFile(filename, content) {
        // 创建一个 Blob 对象，内容类型默认为 text/plain
        //@ts-ignore
        const blob = new Blob([content], { type: 'text/plain' });
    
        // 检查浏览器是否为 IE 并支持 msSaveBlob 方法
        //@ts-ignore
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            // 如果是 IE 使用 msSaveBlob 方法下载文件
            //@ts-ignore
            window.navigator.msSaveBlob(blob, filename);
        } else {
            // 其他现代浏览器的下载方式
            //@ts-ignore
            const url = URL.createObjectURL(blob); // 创建 Blob URL
            //@ts-ignore
            const a = document.createElement('a'); // 创建 <a> 元素
            a.href = url;
            a.download = filename; // 设置下载文件名
    
            // 触发下载
            //@ts-ignore
            document.body.appendChild(a); // 需要将元素添加到 DOM 中才能触发点击
            a.click();
    
            // 下载完成后清理
            //@ts-ignore
            document.body.removeChild(a); // 移除 <a> 元素
            //@ts-ignore
            URL.revokeObjectURL(url); // 释放 Blob URL
        }
    }
    public static  exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        // @ts-ignore
        } else if (document.mozCancelFullScreen) { // Firefox
            // @ts-ignore
            document.mozCancelFullScreen();
            // @ts-ignore
        } else if (document.webkitExitFullscreen) { // Chrome, Safari, Opera
            // @ts-ignore
            document.webkitExitFullscreen();
            // @ts-ignore
        } else if (document.msExitFullscreen) { // IE/Edge
            // @ts-ignore
            document.msExitFullscreen();
        }
    }
}