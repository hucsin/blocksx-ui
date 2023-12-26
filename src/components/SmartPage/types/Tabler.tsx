import React from 'react'
import Tabler from '../../Tabler/index';
import SmartRequst from '../../utils/SmartRequest'


export interface SmartPageTablerProps {
    schema: any,
    meta: any,
    path: string;
    triggerMap: any,
    reflush: any,
    routerParams: any
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

    public constructor(props: SmartPageTablerProps) {
        super(props);
        
        this.state = {
            tableProps: this.initTableProps(),
            reflush: props.reflush
        }

        this.initTableProps();

        this.initRequset();
    }   
    private initRequset() {
        this.ListRequest = SmartRequst.createPOST(this.props.path + '/list');
        this.UpdateRequest = SmartRequst.createPOST(this.props.path + '/update');
        this.DeleteRequest = SmartRequst.createPOST(this.props.path + '/delete');
        this.CreateRequest = SmartRequst.createPOST(this.props.path + '/create');
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
            let fieldUI: any = field.fieldUI || {
                type: 'input'
            }
            return {
                key: field.fieldKey,
                type: fieldUI.type,
                tabler: true,
                group: field.fieldGroup,
                tablerColumn: {
                    filter: field.isIndexed,
                },
                colspan: fieldUI.colspan,
                dict: field.fieldDict,
                name: field.fieldName || field.fieldKey,
                validation: this.getFieldValidation(field)
            }
        })
    }
    private initTableProps() {
        let tableProps: any = {};
        let {schema = { fields: []}} = this.props

        tableProps.fields = this.getFieldProps(schema.fields);
        tableProps.searcher = this.getSearch(schema.fields);

        return tableProps;
    }
    
    public render() {
        return (
            <div style={{padding: '20px'}}>
                <Tabler 
                    multilineEdit={false} 
                    {...this.state.tableProps}
                    reflush={this.state.reflush}
                    dataSource={this.ListRequest}
                    onEdit={this.UpdateRequest}
                    onRemove={this.DeleteRequest}
                    onAdd={this.CreateRequest}
                />
            </div>
        )
    }
}