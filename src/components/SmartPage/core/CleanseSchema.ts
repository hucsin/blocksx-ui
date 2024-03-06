/**
 * 清洗数据
 */
import SmartRequst from '../../utils/SmartRequest'
import RelationshipExtendEnum from '@blocksx/bulk/lib/constant/RelationshipExtendEnum';

import { utils } from '@blocksx/core';

export default class CleanseSchema {
    private static tablerRecordTypeMap = {
        clone: 'edit'
    }
    public static getFieldProps(path: string, fields: any) {
        let fieldsList: any = [];

        fields.map(field => {
            let factor: any = field.factor;
            let fieldMeta: any = field.meta || {
                type: 'input'
            }

            let fieldObject: any = {
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
            };

            if (fieldMeta.motion) {
                fieldObject.motion = SmartRequst.createPOST(path + `/${fieldMeta.motion}`, ['id', fieldObject.key], true)
            }

            if (factor) {

                let factorRequst: any = SmartRequst.createPOST(
                    factor.path + `/${field.factor.type}`,
                    true
                );
                fieldObject.dataSource = (value: any) => {
                    let params: any = {
                        ...value
                    }

                    if (factor.parent) {
                        params.parent = factor.parent;
                    }

                    if (value.query) {
                        //  params.query = value.query;
                    }

                    return factorRequst(params)
                }
                // 
                //console.log(fieldMeta.tags, 987654)
                //if (fieldMeta.folder) {
                //    fieldObject.onTagsList = SmartRequst.createPOST(factor.path + '/list')
                // }

            }

            if (field.type == 'relation') {

                Object.assign(fieldObject, {
                    //column: false,
                    type: this.isOnemRelation(field) ? 'array' : 'plainObject',
                    'x-relyon': true,
                    props: field.relatedPath ? {
                        mode: (props: any) => {
                            if (this.isRelyRelation(field)) {
                                return false;
                            }
                            if (props.onGetDependentParameters) {
                                let params: any = props.onGetDependentParameters() || {};
                                console.log(params, 333)
                                return !!params[RelationshipExtendEnum.MASTERID]
                            }
                        },

                        onPage: SmartRequst.createPOST(field.relatedPath + '/list'),
                        onCreate: SmartRequst.createPOST(field.relatedPath + '/create', true),
                        onDelete: SmartRequst.createPOST(field.relatedPath + '/delete', ['id'], true),
                        onView: SmartRequst.createPOST(field.relatedPath + '/view', ['id']),
                        onEdit: SmartRequst.createPOST(field.relatedPath + '/update', true)
                    } : {},
                    fields: this.getFieldProps(path, field.fields) || [],
                    searcher: this.getSearch(field.fields)
                });

                // 
                if (!this.isOnemRelation(field)) {
                    this.bindingRelationshipFileds(fieldObject, fieldsList)
                }
            }

            return fieldsList.push(fieldObject)
        })

        return fieldsList;
    }

    public static getSearchQuick(field: any) {

        if (field) {
            let fieldUI: any = field.fieldUI;
            let quick: any = fieldUI.quick;

            return {
                type: quick,
                field: field.fieldKey,
                data: field.fieldDict
            }
        }
    }
    public static getSearch(fields: any) {
        let quick: any = fields.find(field => field.fieldUI && field.fieldUI.quick);
        return {
            searcher: 'query',
            quick: this.getSearchQuick(quick)
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

    public static bindingRelationshipFileds(fieldObject: any, fieldsList: any[]) {
        // 如果是1v1这种场景, 把他下面的字段加入
        let fields: any = fieldObject.fields.filter(field => !field.labelvalue && !field.labelname)
        let group: string = fieldObject.group || fieldObject.name;
        let hideContrl: any = [];

        fields.forEach((field, index) => {
            if (field.column || field.major) {
                let trueKey: string = [fieldObject.key, field.key].join('.')
                fieldsList.push({
                    //...field,
                    dict: field.dict,
                    key: trueKey,
                    name: field.name,
                    type: 'label',
                    uiType: 'label',
                    index: index + 1,
                    group,
                    props: field.props
                })

                hideContrl.push(trueKey);
            }
        })

        Object.assign(fieldObject, {
            group: group,
            index: 0,
            control: [
                {
                    when: true,
                    show: hideContrl
                }
            ]
        })
    }

    /**
     * 获取行操作按钮
     * @param schema 
     */
    public static getRowoperate(path:string, schema: any) {
        let meta: any = schema.meta;
        if (utils.isArray(meta.rowoperate)) {
            return meta.rowoperate.map(op => {
                let rowOperate: any = {
                    ...op,
                    key: op.type,
                    align: op.align || 0,
                };
                let type: string = op.type.split('.');
                let isRecord: boolean = type[0] == 'record';

                // 行记录操作的时候
                if (isRecord) {
                    Object.assign(rowOperate, {
                        type: this.tablerRecordTypeMap[type[1]] || type[1],
                        motion: op.motion ? SmartRequst.createPOST(path + '/' + op.motion, true) : null
                    })
                }


                return rowOperate;
            })
        }
    }

    public static getBatchoperate(schema: any) {
        let meta: any = schema.meta;
        if (utils.isArray(meta.batchoperate)) {
            return meta.batchoperate;
        }
    }

    public static isRelyRelation(field: any) {
        return ['rely_one', 'rely_onem'].indexOf(field.fieldType) > -1;
    }
    public static isOnemRelation(field: any) {
        return ['onem', 'rely_onem'].indexOf(field.fieldType) > -1;
    }
}