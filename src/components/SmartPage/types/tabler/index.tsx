import React from 'react';
import ReactDOM from 'react-dom';
import Tabler from '../../../Tabler';
import SmartRequst from '../../../utils/SmartRequest';
import CleanseSchema from '../../core/CleanseSchema';
import Manger from '../../core/SmartPageManger';
import { routerParams } from '../../../utils/withRouter';

import Article from '../article/index'

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
    optionalContainerRef?: any;
    noOperater?: boolean;
    noSearcher?: boolean;
    mode?: string;
    rowSelection?: boolean;

    optional?: any;
    okText?: string;
    okIcon?: string;

    router: routerParams;
    size?: any;
    rowKey?: any;

    onOptionalOpen?: Function;
}
export interface SmartPageTablerState {
    tableProps: any;
    reflush: any;
    rowSelection: any;
    mode?: string;
    optional?: any;

    selectedRow?: any;
}
export default class SmartPageTabler extends React.Component<SmartPageTablerProps, SmartPageTablerState> {
    
    public static defaultProps = {
        rowKey: 'id'
    }

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
            mode: props.mode,
            optional: props.optional
        }

        //this.initTableProps();

        this.initRequset();
    }   
    public UNSAFE_componentWillUpdate(newProps: SmartPageTablerProps) {

        if (newProps.reflush!= this.state.reflush) {
            
            this.setState({
                reflush: newProps.reflush,
                mode: newProps.mode
            })
        }

        if (newProps.optional != this.state.optional) {
            this.setState({
                optional: newProps.optional
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
    private getArticleProps(selectedRow?: any) {
        
        return {
            onRowAction: (operate: any, rowData: any) => {
                
                if (operate.type =='cancel') {
                    this.hideOptionalWrapper();
                }
            }
        }
    }
    private renderOptional() {
        
        if (this.state.selectedRow && this.props.optionalContainerRef && this.props.optionalContainerRef.current) {
            let id: any = this.state.selectedRow[this.props.rowKey as any];
            
            return ReactDOM.createPortal(
                <Article 
                    value={this.state.selectedRow} 
                    key={id} 
                    schema={this.props.schema} 
                    pageMeta={this.props.pageMeta} 
                    path={this.props.path}
                    {...this.getArticleProps(this.state.selectedRow)}

                />,
                this.props.optionalContainerRef.current
            )
        }
    }
    private hideOptionalWrapper =(noHide?: boolean) => {

        if (!noHide) {
            this.props.onOptionalOpen && this.props.onOptionalOpen(true)
            this.setState({
                selectedRow: null
            })
        }
    }
    public render() {
        let { selectedRow } = this.state;
        let pageMeta: any = this.props.pageMeta || { title: '' }
        let selectedRowKeys: any = selectedRow? selectedRow[this.props.rowKey || 'id'] : null;

        return (
            <>
                {this.props.optional && this.renderOptional()}
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
                    size={this.props.size}
                    
                    onGetRequestParams={this.getRequestParams}

                    selectedRowKeys={selectedRowKeys}
                    noSearcher={this.props.noSearcher}
                    searchRef={this.props.searchRef}
                    toolbarRef={this.props.toolbarRef}
                    
                    mode={this.state.mode}
                    noOperater={this.props.noOperater}
                    optional={this.state.optional}
                    onChangeValue={this.onChangeValue}
                    onChangeDatasource = {this.hideOptionalWrapper}
                    
                    onRowAction={(operate:any, rowData: any, _)=>{
                        if (operate.type == 'rowclick') {
                            this.props.onOptionalOpen && this.props.onOptionalOpen();
                        }

                        this.setState({
                            selectedRow: rowData
                        })
                    }}
                    okText={this.props.okText}
                    okIcon={this.props.okIcon}
                    {...pageMeta.props}
                    
                />
            </>
        )
    }
}

Manger.registoryComponent('tabler', SmartPageTabler)