import React from 'react';
import { Tabs, Table } from 'antd';
import { StateX, StateComponent } from '@blocksx/ui/StateX/index';
import Former from '@blocksx/ui/Former';
import { pluginManager  } from '@blocksx/ui/Editor/core/manager';
import { utils } from '@blocksx/core';
import { EditorFormerState } from '@blocksx/ui/Editor/states';

import './style.scss';


export interface FormerState {

}

export default class EditorFormerContainer extends StateComponent<FormerState> {
    private formerState: any = StateX.findModel(EditorFormerState);
    public constructor(props: FormerState) {
        super(props)
    }

    private getProps(schema: any) {
        return Object.assign({
            type: 'drawer',
            groupType: 'more',
            column: 'two',
            width: 500,
            title: schema.title
        }, schema.props)
    }



    public render() {
        let schema:any = this.formerState.getSchema();
        let props: any = this.getProps(schema || {})
        
        if (schema) {
            return (
                <div className='editor-former'>
                    <Former 
                        onSave={(value: any,former: any)=>{
                            if (schema.props && utils.isFunction(schema.props.doSave)) {
                                schema.props.doSave(value, former);
                            }
                        }}
                        autoclose={false}
                        extra={schema.props as any}
                        value={this.formerState.getValue()}
                        visible={this.formerState.getVisible()}
                        {...props} schema={schema}
                        okText="保存"
                        onClose={()=>{this.formerState.hide()}}
                    />
                </div>
            )
        }
    }
}