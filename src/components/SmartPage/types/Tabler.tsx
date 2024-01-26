import React from 'react';
import { utils } from '@blocksx/core'
import Tabler from '../../Tabler/index';
import SmartRequst from '../../utils/SmartRequest'
import RelationshipExtendEnum from '@blocksx/bulk/lib/constant/RelationshipExtendEnum';

export interface SmartPageTablerProps {
    schema: any,
    meta: any,
    path: string;
    triggerMap: any,
    reflush: any,
    onGetRequestParams?: Function;
    onChangeValue?: Function;
    searchRef?: any;
    toolbarRef?: any;
    noOperater?: boolean;
    mode?: string;
    rowSelection?: boolean;
}
export interface SmartPageTablerState {
    tableProps: any;
    reflush: any;
    rowSelection: any;
    mode?: string;
}
export default class SmartPageTabler extends React.Component<SmartPageTablerProps, SmartPageTablerState> {
    
    private ListRequest: any;
    private UpdateRequest: any;
    private DeleteRequest: any;
    private CreateRequest: any;
    private ViewRequest: any ;

    public constructor(props: SmartPageTablerProps) {
        super(props);
        
        this.state = {
            tableProps: this.initTableProps(),
            reflush: props.reflush,
            rowSelection: props.rowSelection,
            mode: props.mode
        }

        this.initTableProps();

        this.initRequset();
    }   
    public UNSAFE_componentWillUpdate(newProps: SmartPageTablerProps) {

        if (newProps.reflush!= this.state.reflush) {
            
            this.setState({
                reflush: newProps.reflush,
                mode: newProps.mode
            })
        }

        if (newProps.mode != this.state.mode) {
            this.setState({
                mode: newProps.mode
            })
        }
    }
    private initRequset() {
        this.ListRequest = SmartRequst.createPOST(this.props.path + '/list');
        this.UpdateRequest = SmartRequst.createPOST(this.props.path + '/update', true);
        this.DeleteRequest = SmartRequst.createPOST(this.props.path + '/delete', ['id'], true);
        this.CreateRequest = SmartRequst.createPOST(this.props.path + '/create', true);
        this.ViewRequest = SmartRequst.createPOST(this.props.path + '/view', ['id'], true)
    }
    private getSearchQuick(field: any) {

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
    private getSearch(fields: any) {
        let quick: any = fields.find(field => field.fieldUI && field.fieldUI.quick);
        return {
            searcher: 'query',
            quick: this.getSearchQuick(quick)
        }
    }
    private getFieldValidation(field: any) {
        return {
            minLength: 1,
            maxLength: field.fieldLength,
            ...field.validator,
            required: field.isRequired
        }
    }
    private getFieldProps(fields: any) {
        let fieldsList: any = [];

        fields.map(field => {
            let factor: any = field.factor;
            let fieldMeta: any = field.meta || {
                type: 'input'
            }

            let fieldObject: any  = {
                key: field.fieldKey,
                ...fieldMeta,
                control: field.fieldControl,
                uiType: fieldMeta.type,
                type: field.fieldType,
                column: fieldMeta.column,
                columnGroup: field.columnGroup,
                tablerColumn:  fieldMeta.column ?  {
                    filter: field.isIndexed,
                }: null,
                colspan: fieldMeta.colspan || 1,
                dict: field.fieldDict,
                defaultValue: field.defaultValue,
                name: field.fieldName || field.fieldKey,
                validation: this.getFieldValidation(field),
                'x-label-hidden': fieldMeta.label === false ? true : false
            };
            
            if (fieldMeta.motion) {
                fieldObject.motion = SmartRequst.createPOST(this.props.path + `/${fieldMeta.motion}`, ['id', fieldObject.key], true)
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
                    column: false,
                    type: this.isOnemRelation(field) ? 'array': 'plainObject',
                    'x-relyon': true,
                    props: field. relatedPath ? {
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
                    fields: this.getFieldProps(field.fields) || [],
                    searcher : this.getSearch(field.fields)
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
    private bindingRelationshipFileds(fieldObject: any, fieldsList: any[]) {
        // 如果是1v1这种场景, 把他下面的字段加入
        let fields: any = fieldObject.fields.filter(field => !field.labelvalue && !field.labelname)
        let group: string = fieldObject.group || fieldObject.name;
        let hideContrl: any = [];
        
        fields.forEach((field, index) => {
            if (field.column || field.major) {
                let trueKey: string = [fieldObject.key,field.key].join('.')
                fieldsList.push({
                    //...field,
                    dict: field.dict,
                    key: trueKey,
                    name: field.name,
                    type: 'label',
                    uiType: 'label',
                    index: index + 1,
                    group
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
    private isRelyRelation(field: any) {
        return ['rely_one', 'rely_onem'].indexOf(field.fieldType) > -1;
    }
    private isOnemRelation(field: any) {
        return ['onem', 'rely_onem'].indexOf(field.fieldType) > -1;
    }
    private tablerRecordTypeMap = {
        clone: 'edit'
    }
    private initTableProps() {
        let tableProps: any = {};
        let {schema = { fields: []}, meta, path} = this.props

        
        tableProps.fields = this.getFieldProps(schema.fields);
        tableProps.searcher = this.getSearch(schema.fields);

        tableProps.type = meta.type;
        tableProps.formerColumn = meta.column;
        
        if (utils.isArray(meta.rowoperate)) {
            tableProps.rowOperate = meta.rowoperate.map(op => {
                let rowOperate: any = {
                    ...op,
                    key: op.type,
                    align: op.align || 0,
                };
                let type: string = op.type.split('.');
                let isRecord: boolean = type[0] =='record';
                
                // 行记录操作的时候
                if (isRecord) {
                    
                    Object.assign(rowOperate, {
                        type: this.tablerRecordTypeMap[type[1]] || type[1],
                        motion: op.motion ? SmartRequst.createPOST(path +'/'+ op.motion, true) : null
                    })  
                }


                return rowOperate;
            })
        }

        if (utils.isArray(meta.batchoperate)) {
            tableProps.batchOpertate = meta.batchoperate;
        }

        return tableProps;
    }
    private getRequestParams = ()=> {
        return this.props.onGetRequestParams && this.props.onGetRequestParams();
    }
    private onChangeValue = (value)=> {
        if (this.props.onChangeValue) {
            this.props.onChangeValue(value)
        }
    }
    public render() {
        
        return (
            <Tabler 
                multilineEdit={false} 
                {...this.state.tableProps}
                reflush={this.state.reflush}
                dataSource={this.ListRequest}
                
                onEdit={this.UpdateRequest}
                onRemove={this.DeleteRequest}
                onAdd={this.CreateRequest}
                onView={this.ViewRequest}

                onGetRequestParams={this.getRequestParams}
                
                searchRef={this.props.searchRef}
                toolbarRef={this.props.toolbarRef}
                
                mode={this.state.mode}
                noOperater={this.props.noOperater}
                onChangeValue={this.onChangeValue}
                onRowAction={(e, r, v)=>{
                    console.log(e,r,v, 333)
                }}
                
            />
        )
    }
}