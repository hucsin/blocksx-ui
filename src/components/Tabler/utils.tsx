import React from 'react';
import { utils } from '@blocksx/core';
import * as FormerTypes from '../Former/types';
import * as Icons from '../Icons';

import SmartRequst from '../utils/SmartRequest'
import RelationshipExtendEnum from '@blocksx/bulk/lib/constant/RelationshipExtendEnum';


export default class TablerUtils {
    public static renderIconComponent(field: any) {
        if (field.icon && Icons[field.icon]) {
            let UIView: any = Icons[field.icon];
            return <UIView key={field.key|| field.icon}/>
        }
    }
    public static renderComponentByField(field: any, props: any,  defaultComponent?: any) {
        // 当当前字段是存在action的时候
        //if (field.action) {
        let uiType: string = field.uiType || field.type;
        let UiView: any = FormerTypes[uiType];
        
        if (utils.isFunction(defaultComponent)) {
            return defaultComponent(field)
        }

        if (UiView) {
            if (utils.isFunction(field.motion)) {

                return (
                    <UiView key={field.key} {...props} loading={true} onChangeValue={(v) => {
                        return field.motion({
                            ... props.recordValue,
                            [field.key]: v
                        })
                    }} />
                )
            } else {
                if (UiView= UiView.Viewer) {
                    return (
                        <UiView key={field.key} {...props} />
                    )
                }
            }
        }
        
        return (
            <React.Fragment key={'c' + field.key}>
                {TablerUtils.renderIconComponent(field)}
                {TablerUtils.renderValue(field, props.displayValue || props.value)}
            </React.Fragment>
        )
    }
    public static renderValue(field: any, value: any) {
        // 判断是label对象
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
    
    public static convertModelFields2TablerFields(fields: any[], basePath: string) {
        return fields.map(field => {
            let factor: any = field.factor;
            let fieldMeta: any = field.meta || {
                type: 'input'
            }

            let fieldObject: any  = {
                key: field.fieldKey,
                ...fieldMeta,
                uiType: fieldMeta.type,
                type: field.fieldType,
                column: fieldMeta.column,
                columnGroup: field.columnGroup,
                tablerColumn:  fieldMeta.column ?  {
                    filter: field.isIndexed,
                }: null,
                labelValue: fieldMeta.labelvalue,
                labelName: fieldMeta.labelname,
                colspan: fieldMeta.colspan || 1,
                dict: field.fieldDict,
                name: field.fieldName || field.fieldKey,
                validation: TablerUtils.getFieldValidation(field),
                'x-label-hidden': fieldMeta.label === false ? true : false
            };
            
            if (fieldMeta.motion) {
                fieldObject.motion = SmartRequst.createPOST(basePath + `/${fieldMeta.motion}`, ['id', fieldObject.key], true)
            }

            if (factor) {
            
                let factorRequst: any = SmartRequst.createPOST( 
                    factor.path + `/${field.factor.type}`,
                    true
                );
                fieldObject.dataSource = (value: any) => {
                    let params: any = {}

                    if (factor.parent) {
                        params.parent = factor.parent;
                    }

                    if (value.query) {
                        params.query = value.query;
                    }

                    return factorRequst(params)
                }
            }
            console.log(field, 3333,fieldObject)
            if (field.type == 'relation') {
                
                Object.assign(fieldObject, {
                    column: false,
                    type: 'array',
                    'x-relyon': true,
                    props: field. relatedPath ? {
                        mode: (props: any) => {
                            if (props.onGetDependentParameters) {
                                let params: any = props.onGetDependentParameters() || {};
                                return !!params[RelationshipExtendEnum.MASTERID]
                            }
                        },

                        onPage: SmartRequst.createPOST(field.relatedPath + '/list'),
                        onCreate: SmartRequst.createPOST(field.relatedPath + '/create', true),
                        onDelete: SmartRequst.createPOST(field.relatedPath + '/delete', ['id'], true),
                        onView: SmartRequst.createPOST(field.relatedPath + '/view', ['id']),
                        onEdit: SmartRequst.createPOST(field.relatedPath + '/update', true)
                    } : {},
                    fields: TablerUtils.convertModelFields2TablerFields(field.fields, basePath)
                });
            }

            return fieldObject
        })
    }
}