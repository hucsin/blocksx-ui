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

    searchRef?: any;
    toolbarRef?: any;
}
export interface SmartPageTablerState {
    tableProps: any;
    reflush: any;
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
            reflush: props.reflush
        }

        this.initTableProps();

        this.initRequset();
    }   
    public UNSAFE_componentWillUpdate(newProps: SmartPageTablerProps) {

        if (newProps.reflush!= this.state.reflush) {
            
            this.setState({
                reflush: newProps.reflush
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
                colspan: fieldMeta.colspan || 1,
                dict: field.fieldDict,
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
                    fields: this.getFieldProps(field.fields)
                });
            }

            return fieldObject
        })
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

        return tableProps;
    }
    private getRequestParams = ()=> {
        return this.props.onGetRequestParams && this.props.onGetRequestParams();
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

                onRowAction={(e, r, v)=>{
                    console.log(e,r,v, 333)
                }}
                
            />
        )
    }
}