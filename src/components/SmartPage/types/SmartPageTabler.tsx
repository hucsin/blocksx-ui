import React from 'react';
import Tabler from '../../Tabler';
import SmartRequst from '../../utils/SmartRequest';
import CleanseSchema from '../core/CleanseSchema';

import { routerParams } from '../../utils/withRouter'

export interface SmartPageTablerProps {
    schema: any,
    pageMeta: any,
    path: string;
    triggerMap: any,
    reflush: any,
    onGetRequestParams?: Function;
    onChangeValue?: Function;
    searchRef?: any;
    toolbarRef?: any;
    operateContainerRef?: any;
    noOperater?: boolean;
    mode?: string;
    rowSelection?: boolean;

    router: routerParams;
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
        this.DeleteRequest = SmartRequst.createPOST(this.props.path + '/delete', true);
        this.CreateRequest = SmartRequst.createPOST(this.props.path + '/create', true);
        this.ViewRequest = SmartRequst.createPOST(this.props.path + '/view', ['id'], true)
    }

    private initTableProps() {
        let tableProps: any = {};
        let {schema = { fields: []}, pageMeta, path} = this.props

        
        tableProps.fields = schema.fields;
        tableProps.searcher = CleanseSchema.getSearch(schema.fields);

        tableProps.type = pageMeta.type;

        tableProps.formerColumn = pageMeta.column;
        tableProps.rowOperate = CleanseSchema.getRowoperate(path, schema);
        tableProps.batchOpertate = CleanseSchema.getBatchoperate(schema);
        
        return tableProps;
    }
    private getRequestParams = ()=> {
        let pageMeta: any = this.props.pageMeta || {};
        let params: any = this.props.onGetRequestParams && this.props.onGetRequestParams() || {}

        return Object.assign({}, params, pageMeta.params|| {});
    }
    private onChangeValue = (value)=> {
        if (this.props.onChangeValue) {
            this.props.onChangeValue(value)
        }
    }
    private getPageType() {
        let pageMeta: any = this.props.pageMeta || { title: '' }
        
        return (pageMeta.pageType || pageMeta.title).toLowerCase()

    }
    public render() {

        let pageMeta: any = this.props.pageMeta || { title: '' }
        
        return (
            <Tabler 
                multilineEdit={false} 
                {...this.state.tableProps}
                pageMeta={pageMeta}
                reflush={this.state.reflush}
                dataSource={this.ListRequest}
                pageType={this.getPageType()}
                onEdit={this.UpdateRequest}
                onRemove={this.DeleteRequest}
                onAdd={this.CreateRequest}
                onView={this.ViewRequest}
                router={this.props.router}
                
                onGetRequestParams={this.getRequestParams}
                
                searchRef={this.props.searchRef}
                toolbarRef={this.props.toolbarRef}
                
                mode={this.state.mode}
                noOperater={this.props.noOperater}
                onChangeValue={this.onChangeValue}
                onRowAction={(e, r, v)=>{
                    console.log(e,r,v, 333)
                }}
                {...pageMeta.props}
            />
        )
    }
}