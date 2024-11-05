/**
 * 清洗数据
 */
import SmartRequst from '../../utils/SmartRequest'
import SmartUtils from '../../utils/tool';
import RelationshipExtendEnum from '@blocksx/bulk/es/constant/RelationshipExtendEnum';

import { utils } from '@blocksx/core';

export default class CleanseSchema {
    private static tablerRecordTypeMap = {
        clone: 'edit'
    }
    public static makeField(field:any) {
        return SmartUtils.makeField(field)
    }
    public static getFieldValidation(field: any) {
        return SmartUtils.getFieldValidation(field)
    }
    public static getFieldProps(path: string, fields: any) {
        let fieldsList: any = [];

        fields.map(field => {
            let factor: any = field.factor;
            let fieldMeta: any = field.meta || {
                type: 'input'
            }

            let fieldObject: any = this.makeField(field);

            if (fieldMeta.motion) {
                fieldObject.motion = SmartRequst.makePostRequest(path + `/${fieldMeta.motion}`, ['id', fieldObject.key])
            }

            if (factor) {

                let factorRequst: any = SmartRequst.makePostRequest(
                    factor.path + `/${field.factor.type || field.factor.name}`
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
                

            }

            if (field.type == 'relation') {

                Object.assign(fieldObject, {
                    //column: false,
                    type: this.isOnemRelation(field) ? 'array' : 'plainObject',
                    'x-relyon': true,
                    colspan: field.colspan || 2,
                    props: field.relatedPath ? {
                        mode: (props: any) => {
                            if (this.isRelyRelation(field)) {
                                return false;
                            }
                            if (props.onGetDependentParameters) {
                                let params: any = props.onGetDependentParameters() || {};
                                
                                return !!params[RelationshipExtendEnum.MASTERID]
                            }
                        },

                        onPage: SmartRequst.makeGetRequest(field.relatedPath + '/list'),
                        onCreate: SmartRequst.makePostRequest(field.relatedPath + '/create'),
                        onDelete: SmartRequst.makePostRequest(field.relatedPath + '/delete', ['id']),
                        onView: SmartRequst.makeGetRequest(field.relatedPath + '/view', ['id']),
                        onEdit: SmartRequst.makePostRequest(field.relatedPath + '/update')
                    } : {},
                    fields: this.getFieldProps(path, field.fields) || [],
                    searcher: this.getSearch(field.fields)
                });

                // 
                if (!this.isOnemRelation(field)) {
                    this.bindingRelationshipFileds(fieldObject, fieldsList)
                }
            } else if (field.fields) {
                fieldObject.fields = field.fields.map(it => this.makeField(it))
            }

            return fieldsList.push(fieldObject)
        })

        return fieldsList;
    }
    public static matchItem(value:any, schema: any) {
        switch(schema.type) {
            case 'notIn':
                return schema.value.indexOf(value) ==-1;
            case 'in':
                return schema.value.indexOf(value) > -1;

        }
    }
    public static filterDict(dict:any, key: string, where: any, dictKey: string ='value') {
        if (where && dict) {

            return dict.filter(it => {
                if (utils.isPlainObject(where[key])) {
                    return this.matchItem(it[dictKey], where[key])
                } else {
                 
                    return utils.isUndefined(where[key]) ? true : where[key] === it[dictKey];
                }
            })
        } else {
            return dict;
        }
    }
    public static getSearchQuick(field: any, where: any= null) {

        if (field) {
            let fieldUI: any = field.meta;
            let quick: any = fieldUI.quick;
            let defaultValue: any ;
            let props: any = {};
            let datasource: any = fieldUI.dict ||field.fieldDict


            if (utils.isPlainObject(quick)) {
                datasource = this.filterDict(quick.dict || datasource || [], field.fieldKey , where); 
                defaultValue =  (datasource.find(it=> it.defaultValue) || {}).value;
                props = quick;
                quick = quick.type;
            }
            
            return {
                type: quick,
                field: field.fieldKey,
                data: datasource,
                defaultValue,
                props
            }
        }
    }
    public static getSearch(fields: any) {
        
        let quick: any = fields.find(field => !field.classify && field.meta && field.meta.quick);
        return {
            searcher: 'query',
            quick: this.getSearchQuick(quick)
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
                        motion: op.motion ? SmartRequst.makePostRequest(path + '/' + op.motion) : null
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