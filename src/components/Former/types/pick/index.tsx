import React from 'react';
import Tabler from '../../../Tabler';
import { IFormerBase } from '../../typings';
// TODO 移动这个组建到utils里面
import CleanseSchema from '../../../SmartPage/core/CleanseSchema';
import SmartRequest from '../../../utils/SmartRequest';

import "./style.scss";

interface FormerPickProps extends IFormerBase {
    fields?: any[];
    extendsFor?: any;
    value?: any;
}

interface FormerPickState {
    value: any;
}

export default class FormerPick extends React.Component<FormerPickProps, FormerPickState> {
    private requestHelper: any;
    public constructor(props: FormerPickProps) {
        super(props);
        this.state = {
            value: props.value || 'mysql'
        }
        let { extendsFor } = props;
        console.log(props, 33333)
        this.requestHelper =  SmartRequest.createPOST(extendsFor.path +'/list')
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
                        ...CleanseSchema.getSearchQuick(field)
                        
                    },
                    placeholder: this.state.value ? 'current:' + this.state.value: null,
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
    public render() {
        let value:any = {};
        let schema: any = this.getSchema()
        
        return (
            <div className='ui-pick-wrapper'>
                <Tabler
                    key={2}
                    multilineEdit={false} 
                    fields={schema.fields}
                    searcher={schema.searcher}
                    dataSource={this.requestHelper}
                    size='small'
                    selectedRowKeys={value? [value.id]: []}
                    mode="pickone"
                    onChangeValue={(rowKeys: any, row: any)=> {
                        //this.onSelected(row[0])
                        console.log(row, rowKeys)
                    }}
                    noOperater={true}
                />
            </div>
        )
    }
}