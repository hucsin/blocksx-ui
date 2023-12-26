import React from 'react';
import Former from '../Former';

import { utils } from '@blocksx/core';
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
    formerSchema?: any;
    action?: any;
    fields?: any;
    value: any;
    createText?: string;

    onChangeValue: Function;
    onClose: Function;

    viewer?: boolean;
}
export interface SFormerType {
    visible: boolean;
    value?: any;
    schema?: any;
    action?: any;
    fields?: any;
    viewer?: boolean;
}

export default class TablerFormer extends React.Component<IFormerType, SFormerType>  {
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
                schema: this.getSchema(newProps.fields || this.state.fields),
                visible: !!newProps.action,
                value: newProps.value,
                fields: newProps.fields
            })
        }

        if (newProps.viewer != this.state.viewer) {
            this.setState({
                viewer: newProps.viewer
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
            return it.validation;
        }

        if (utils.isValidValue(it.required)) {
            return {
                required: it.required
            }
        }
    }

    private getDefaultSchemaProperties(fields?: any) {
        let fieldsObject: any = {};
        let _fields: any = fields || this.state.fields;

        _fields.forEach((it: any, index: number) => {
            fieldsObject[it.key] = {
                type: 'string', // 统一当string处理
                defaultValue: it.defaultValue,
                title: it.name,
                'x-modify': it.modify || it['x-modify'],
                'x-group': it.group,
                'x-half-width': utils.isValidValue(it.half) ? it.half : (_fields.length > 8 ? true : false),
                'x-type-props': it.props,
                'x-type': it.type,
                'x-colspan': it.colspan,
                'x-index': index,
                'x-control': it.control,
                'x-validation': this.getValidationValue(it),
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
                return this.props.createText;
            case 'edit':
                return 'Edit the records';
            case 'view':
                return 'View the records'
        }
    }
    private getDefaultOkText() {
        switch (this.state.action) {
            case 'add':
                return 'Create';
            case 'edit':
                return 'Edit';
            default:
                return 'Submit'
        }
    }
    public render() {
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
                autoclose={false}
                column={'two'}
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