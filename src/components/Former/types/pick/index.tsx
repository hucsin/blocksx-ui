import React from 'react';
import Tabler from '../../../Tabler';
import { IFormerBase } from '../../typings';
// TODO 移动这个组建到utils里面
import CleanseSchema from '../../../SmartPage/core/CleanseSchema';
import SmartRequest from '../../../utils/SmartRequest';

import "./style.scss";

interface FormerPickProps extends IFormerBase {
    fields?: any[];
    props?: any;
    extendsFor?: any;
    value?: any;
    meta?: any;
    onlyview: any;
}

interface FormerPickState {
    value: any;
}

export default class FormerPick extends React.Component<FormerPickProps, FormerPickState> {
    private requestHelper: any;
    public constructor(props: FormerPickProps) {
        super(props);
        this.state = {
            value: props.value
        }

        this.initHelper();
    }
    private initHelper() {

        let { meta = {}, extendsFor = {}} = this.props;
        let path: string = extendsFor.path;

        if (meta.props && meta.props.path) {
            path = meta.props.path;
        }

        this.requestHelper =  SmartRequest.makeGetRequest(path +'/list');
    }
    private onChange =(value: any) => {
        this.setState({
            value: value
        })

        if (this.props.onChangeValue) {
            this.props.onChangeValue(value)
        }
    }
    private getSchema() {
        let searcher: any = {};
        let trueFields: any = this.props.fields || []
        
        let fields: any = (trueFields).map(it => {
            let field: any =  CleanseSchema.makeField(it)

            if (field.classify && field.quick) {

                field.column = false;
                field.meta.column = false;
                searcher = {
                    quick: {
                        ...CleanseSchema.getSearchQuick(field, this.getDefaultParams())
                    },
                    placeholder: 'Filter and select record',
                    direction: 'right'
                };
            }
            return field;
        })

        return {
            fields,
            searcher
        }
    }
    private getDefaultParams() {
        let { meta } = this.props;
        if (meta && meta.props) {
            return meta.props.params || {};
        }
    }
    private getDefaultPageSize() {
        let { meta } = this.props;
        if (meta && meta.props) {
            return meta.props.pageSize || 7;
        }
        return 7;
    }
    private getDefaultRowKey() {
        let { meta } = this.props;
        if (meta && meta.props && meta.props.rowKey) {
            return meta.props.rowKey
        }
        return 'id';
    }
    public render() {
        
        let schema: any = this.getSchema();
        let pageSize: number = this.getDefaultPageSize();
        let defaultParams: any = this.getDefaultParams();
        let { props = {}} = this.props;
        return (
            <div className='ui-pick-wrapper'>
                <Tabler
                    key={2}
                    rowKey={this.getDefaultRowKey()}
                    multilineEdit={false} 
                    fields={schema.fields}
                    searcher={schema.searcher}
                    dataSource={(params: any)=> {
                        return this.requestHelper([params, defaultParams])
                    }}
                    pageSize = {pageSize}
                    size='small'
                    selectedRowKeys={this.state.value ? [this.state.value]: []}
                    mode="pickone"
                    onlyview={props.onlyview}
                    onChangeValue={(rowKeys: any, row: any)=> {
                        //this.onSelected(row[0])
                       this.onChange(rowKeys[0])
                    }}
                    noOperater={true}
                />
            </div>
        )
    }
}