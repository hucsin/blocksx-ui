import React from 'react';
import Former from '../Former';

import { utils } from '@blocksx/core';
import RelationshipExtendEnum from '@blocksx/bulk/lib/constant/RelationshipExtendEnum';
/*
 * @Author: your name
 * @Date: 2020-12-21 21:55:35
 * @LastEditTime: 2022-03-02 19:35:53
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /designer/Users/iceet/work/hucsin/blocksx/packages/design-components/src/tabler/TablerFormer.tsx
 */
/**
 * 支持如下模式
 * 1、tab选项卡模式，两种：左边、顶部
 * 2、step步骤条模式
 * 3、手风琴模式
 */

export interface IFormerType {
    formerType: any;
    name?: string;
    formerSchema?: any;
    action?: any;
    fields?: any;
    value: any;
    createText?: string;

    onChangeValue: Function;
    onClose: Function;
    onView?: Function;

    viewer?: boolean;
}
export interface SFormerType {
    visible: boolean;
    value?: any;
    schema?: any;
    action?: any;
    name?: string;
    fields?: any;
    viewer?: boolean;
}

export default class TablerFormer extends React.Component<IFormerType, SFormerType>  {
    private former: any;
    public constructor(props: IFormerType) {
        super(props);
        this.state = {
            visible: !!props.action,
            schema: this.getSchema(props.fields),
            action: props.action,
            value: props.value,
            fields: props.fields,
            viewer: props.viewer
        }
    }


    public UNSAFE_componentWillReceiveProps(newProps: IFormerType) {

        if (newProps.action !== this.state.action) {
            
            this.setState({
                action: newProps.action,
                name: newProps.name,
                schema: this.getSchema(newProps.fields || this.state.fields),
                visible: !!newProps.action,
                value: newProps.value,
                fields: newProps.fields
            })
            if (!!newProps.action) {
                this.resetValue()
            }
        }

        if (newProps.viewer != this.state.viewer) {
            this.setState({
                viewer: newProps.viewer
            })
        }
    }
    
    private resetValue() {
        let former: any = this.former;

        if (this.props.onView && this.state.value) {
            former.setState({
                fetching: true,
                disabled: true
            })
            this.props.onView(this.state.value).then((result) => {
                this.setState({
                    value: result
                })
                former.setState({disabled: false, fetching: false})
            })
        }
    }

    private getDefaultPropsByItem(it: any) {
        let defaultProps: any = {};

        if (it.dict) {
            defaultProps.dataSource = it.dict;
        }

        if (it.dataSource) {
            defaultProps.dataSource = it.dataSource;
        }

        return defaultProps;
    }

    private getValidationValue(it: any) {

        if (it.validation) {
            return {
                type: it.type || 'string',
                ...it.validation
            }
        }

        if (utils.isValidValue(it.required)) {
            return {
                type: it.type || 'string',
                required: it.required
            }
        }
    }


    private getDefaultSchemaProperties(fields?: any) {
        let fieldsObject: any = {};
        let _fields: any = fields || this.state.fields;

        _fields.forEach((it: any, index: number) => {
            
            fieldsObject[it.key] = {
                type: it.type || 'string', // 统一当string处理
                defaultValue: it.defaultValue,
                title: it.name,
                'x-modify': it.modify || it['x-modify'],
                'x-group': it.group,
                'x-half-width': false,
                'x-type-props': it.props,
                'x-type': it.uiType || 'input',
                'x-colspan': it.colspan,
                column: it.column,
                'x-index': index,
                'x-control': it.control,
                'x-validation': this.getValidationValue(it),
                properties: it.fields ? this.getDefaultSchemaProperties(it.fields) : null,
                ... this.getDefaultPropsByItem(it)
            }
        });



        return fieldsObject;
    }
    private getDefaultSchema(fields?: any) {
        return {
            type: 'object',
            "title": "xxx",
            properties: this.getDefaultSchemaProperties(fields)
        }
    }

    private getSchema(fields?: any) {
        let { formerSchema, action = 'edit' } = this.props;

        if (formerSchema && formerSchema[action]) {
            return formerSchema[action]
        }

        return this.getDefaultSchema(fields);
    }
    private getDefaultId() {
        let value: any = this.state.value;

        return value ? value.id : 0;
    }
    private getDefaultTitle() {
        switch (this.state.action) {
            case 'add': 
            case 'Create':
                return this.props.createText;
            default: 
                let name: string = this.state.name || this.state.action ;
                return `${name} the records`
        }
    }
    private getDefaultOkText() {
        switch (this.state.action) {
            case 'add':
                return 'Create';
            default:
                return this.state.name || this.state.action;
        }
    }
    public render() {
        let fields: any = this.state.fields || [];

        if (!this.state.visible) {
            return null;
        }

        return (
            <Former
                title={this.getDefaultTitle()}
                id={this.getDefaultId()}
                type={this.props.formerType}
                schema={this.state.schema}
                visible={this.state.visible}
                okText={this.getDefaultOkText()}
                onSave={(value: any, former: any) => {
                    return this.props.onChangeValue(value).then(() => {
                        this.setState({visible: false});
                        this.props.onClose();
                        former.setState({loading: false})
                    }).catch(e => {
                        former.setState({loading: false})
                    });
                }}
                value={this.state.value}
                viewer={this.state.viewer}
                onGetDependentParameters={(value: any)=> {
                    return this.state.value ? {
                        [RelationshipExtendEnum.MASTERID]: this.state.value.id
                    } : {}
                }}
                onInit={(former: any) => {
                    this.former = former;
                    
                }}
                autoclose={false}
                column={fields.length > 4 ? 'two' : 'one'}
                width={fields.length > 4 ? 600 : 400}
                onClose={() => {
                    this.setState({
                        visible: false
                    })
                    this.props.onClose();
                }}
            ></Former>
        )
    }
}