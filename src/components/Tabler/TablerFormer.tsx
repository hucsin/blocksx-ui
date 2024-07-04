import React from 'react';
import classnames from 'classnames';
import i18n from '@blocksx/i18n';
import { RightOutlined } from '@ant-design/icons'
import { Spin } from 'antd';
import Former from '../Former';

import { utils } from '@blocksx/core';
import RelationshipExtendEnum from '@blocksx/bulk/lib/constant/RelationshipExtendEnum';
import TablerUtils from '../utils/tool';
import SmartRequest from '../utils/SmartRequest';

import {  upperFirst, omit } from 'lodash'

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
    children?: any;
    pageType?: string;
    formerType: any;
    rowKey?: string;
    name?: string;
    column?: string;
    formerSchema?: any;
    action?: any;
    fields?: any;
    value: any;
    pageMeta?: any;
    onChangeValue: Function;
    onClose: Function;
    onView?: Function;

    viewer?: boolean;
}
export interface SFormerType {
    visible: boolean;
    value?: any;
    schema?: any;
    columnKeys?: any;
    dynamicSchema?: any;
    id?: any;
    action?: any;
    name?: string;
    fields?: any;
    viewer?: boolean;
    isStepMode?: boolean;
    isStepOne?: boolean;
    setpOneValue?: any;
    loading?: boolean;
}

export default class TablerFormer extends React.Component<IFormerType, SFormerType>  {
    private former: any;
    private nextDyamicRequest: any;
    public constructor(props: IFormerType) {
        super(props);
        let columnKeys:any = TablerUtils.getFieldKeysByColumnOnly(props.fields);
        this.state = {
            visible: !!props.action,
            schema: this.getSchema(props.fields),
            columnKeys: columnKeys ,
            action: props.action,
            value: omit(props.value, columnKeys),
            fields: props.fields,
            viewer: props.viewer,
            isStepOne: props.value ? false: true,
            isStepMode: this.isStepFormer(props.fields),
            setpOneValue: props.value,
            loading: false,
            id: 0
        }
        
        if (this.isStepDynamicFormer()) {
            
            this.nextDyamicRequest = SmartRequest.createPOST(this.getStepDynamicFormer())
        }
    }
    public componentDidMount(): void {

      
    }
    private getStepDynamicFormer() {
        
        let { pageMeta = {}}  = this.props;
        let stepnext: any = pageMeta && pageMeta.props && pageMeta.props.stepnext;

        if (stepnext) {

            return pageMeta.path ? pageMeta.path + '/' + stepnext : stepnext;
        }
    }
    private getStepDynamicNextKey () {
        let { pageMeta = {}}  = this.props;
        return pageMeta && pageMeta.props && pageMeta.props.nextKey;

    }
    private isStepDynamicFormer () {
        return !!this.getStepDynamicFormer();
    }
    private getDynamicSchema(dyschema: any) {
        let { schema = {}}  = this.state;
        let nextKey: any = this.getStepDynamicNextKey();

        // 在原来的schema上加上新的
        if (schema) {
            let trueSchema:any = utils.clone(schema.other ? schema.other : schema);
            
            if (trueSchema) {
                if (nextKey) {
                    
                    trueSchema.properties[nextKey] = Object.assign({}, dyschema, {
                        uiType: 'object',
                        'x-colspan': 2,
                        'x-index': 10,
                        'x-group': nextKey,
                        fieldKey: nextKey,
                        title: ''
                    })
                    trueSchema.title = nextKey;
                   
                } else {    
                    // 把dyschema的属性复制到原来的schema

                    if (dyschema && dyschema.properties) {
                        Object.assign(trueSchema.properties, dyschema.properties)
                    }
                }
                
                return trueSchema;
            }
        }


        return schema;

    }
    private onDynamicStepChange(value: any) {
        this.setState({loading: true})
        this.nextDyamicRequest(value).then((result) => {
            
            let trueValue: any =  {
                ...this.state.setpOneValue,
                ...result.value
            };
            this.setState({
                loading:false,
                dynamicSchema: this.getDynamicSchema(result.schema),
                setpOneValue: utils.clone(trueValue),
                value: trueValue,
                id: this.state.id + 1,
                isStepOne: false
            })
        })
    }
    private isStepFormer(fields: any) {
        return !!fields.filter(field => {
            return field.step
        }).length;
    }

    public UNSAFE_componentWillReceiveProps(newProps: IFormerType) {

        if (newProps.action !== this.state.action) {
            let columnKeys: any = TablerUtils.getFieldKeysByColumnOnly(newProps.fields || this.state.fields);
            
            this.setState({
                action: newProps.action,
                name: newProps.name,
                schema: this.getSchema(newProps.fields || this.state.fields),
                columnKeys: columnKeys,
                visible: !!newProps.action,
                value: omit(newProps.value, columnKeys),
                fields: newProps.fields,
                isStepOne: newProps.value ? false : true,
                isStepMode: this.isStepFormer(newProps.fields),
                setpOneValue: utils.clone(newProps.value)
            })

            if (newProps.value && this.isStepDynamicFormer()) {
                this.onDynamicStepChange(newProps.value)
            }

            
            
            if (!!newProps.action) {
                //this.resetValue()
            }
        }
        
        if (newProps.viewer != this.state.viewer) {
            this.setState({
                viewer: newProps.viewer,
                schema: this.getSchema(newProps.fields || this.state.fields)
            })
        }
    }
    
    private resetValue() {
        let former: any = this.former;

        if (this.props.onView && this.state.value) {
            former && former.setState({
                fetching: true,
                disabled: true
            })
            this.props.onView(this.state.value).then((result) => {
                console.log(333322, result)
                this.setState({
                    value: result
                })
                former && former.setState({disabled: false, fetching: false})
            })
        }
    }


    private getSchema(fields?: any) {
        let { formerSchema, action = 'edit' } = this.props;
       // let hviewer: any = typeof viewer !== 'undefined' ? viewer : this.state.viewer;

        if (formerSchema && formerSchema[action]) {
            return formerSchema[action]
        }
        // 如果是step模型
       
        if ( this.isStepFormer(fields)) {

            let firstFields: any = this.splitStepField(fields, true)

            return {
                firstFields,
                fields,
                firstField: firstFields[0] || {},
                firstStep: TablerUtils.getDefaultSchema(firstFields),
                other: TablerUtils.getDefaultSchema(this.splitStepField(fields))
            }

        } else {
       
            return TablerUtils.getDefaultSchema(fields);
        }
    }
    private splitStepField(fields: any ,isFirst?: boolean) {
        return fields.filter(field => {
            return  isFirst ? field.step : !field.step
        })
    }
    private getDefaultId() {
        let value: any = this.state.value;
        
        return value ? value.id || this.state.id : this.state.id;
    }
    private getDefaultNotice() {
        let { schema={}} = this.state;
        if (schema.firstField && !this.state.isStepOne) {
            let firstItem: any = this.getFirstItem(schema.firstField);

            return firstItem && firstItem;
        }
    }
    private slotMap:any ={
        summary: 'description'
    }
    private getSlotTitleIcon(fields: any) {
        let { value = {} } = this.state;
        let slot: any = {};
        if (value) {
            fields.forEach(it => {
                if (it.meta ){
                    let slotType:string = it.meta.slot;
                    if (slotType) {   
                        slot[this.slotMap[slotType]|| slotType] = value[it.fieldKey] 
                    }
                }
            })
        }
        return slot;
    }
    private getFirstItem(firstField:any) {
        let { schema, setpOneValue, value } = this.state;
        
        if (this.isStepDynamicFormer() && schema.fields) {
            let slot: any = this.getSlotTitleIcon(schema.fields)
            if (slot.title) {
                return {
                    label: slot.title,
                    icon: slot.icon,
                    color: slot.color,
                    description: slot.description
                }
            }
        }
        if (value && setpOneValue) {
            let dict: any = firstField.dict || [];
            let keyValue: any = this.state.setpOneValue[firstField.key];
            let value: any = utils.isPlainObject(keyValue) ? keyValue.value : keyValue;
            return dict.find(it => it.value === value);
        }

    } 
    private isDenyBack() {
        let firstField: any = this.state.schema.firstField;
        let stateValue: any = this.state.value || {};
        return firstField.modify == 'deny' && stateValue[this.props.rowKey || 'id'];
           
    }
    private getStepFistTitle() {
        let firstField: any = this.state.schema.firstField;
        let fistName: string = ['Choose the ', firstField.name.toLowerCase()].join('');

        if (this.state.setpOneValue) {

            let item: any = this.getFirstItem(firstField);
            let isDeny: any = this.isDenyBack();
           
            
            if (item) {
                return (
                    <span className={classnames({
                        'ui-choose': true,
                        'ui-disabeld': isDeny
                    })} onClick={()=> {
                        if (!isDeny) {
                            this.setState({
                                isStepOne: true
                            })
                        }
                    }}>
                        {item.label}
                        {item && TablerUtils.renderIconComponent(item)}
                    </span>
                )
            }

        } 
        return '1. ' + fistName;
        
        
    }
    private stepActionMap: any = {
        'create': 'Complete',
        'edit': 'Edit',
        'view': 'View'
    }
    private getStepTitle(type?: string) {
        
        let { pageMeta = {} } = this.props;
        
         
        return (
            <div className='ui-header'>
                <span className='ui-stepone'>{this.getStepFistTitle()}</span>
                <RightOutlined/>
                <span className={
                    classnames({
                        'ui-steptwo': true,
                        'ui-disabeld': this.state.isStepOne
                    })
                }>2. {this.stepActionMap[type as any] ||  'Complete'} the {(pageMeta.title ||'record').toLowerCase()} </span >
            </div>
        )
    }
    private getDefaultTitle() {

        if (this.state.isStepMode ) {
             
            return this.getStepTitle(this.state.action);

        } else {

            switch (this.state.action) {
                case 'add': 
                case 'create':
                    return i18n.t(['Create', 'the', 'new', this.props.pageType].join(' '));
                default: 
                    let name: string = this.state.name || this.state.action ;
                    return `${upperFirst(name)} the ${this.props.pageType}`
            }
        }
    }
    private getDefaultIcon() {
        let { pageMeta = {} } = this.props;

        return pageMeta.icon 
    }
    private getDefaultOkText() {
        if (this.state.isStepMode && this.state.isStepOne) {
            return 'Next';
        }
        switch (this.state.action) {
            case 'add':
                return 'Create';
            default:
                return upperFirst(this.state.name || this.state.action);
        }
    }
    private cancelDoback() {
        if (!this.state.isStepOne && this.state.isStepMode) {
            return !this.isDenyBack();
        }
        return false;
    }
    private getDefaultCancelText() {
        if (this.state.isStepMode) {
            if ( this.cancelDoback()) {
                return 'Previous'
            }
        }
        return 'Cancel'
    }
    private cleanLabelValueToValue(value: any, fields?: any) {

        let fieldsList: any = fields || this.state.fields;

        fieldsList.forEach(field => {
            let key: string = field.key || '';
            
            if (key.indexOf('.') == -1) {
                // 集联
                if (field.fields) {
                    if (utils.isPlainObject(value[key])) {
                        
                        value[key] = this.cleanLabelValueToValue(value[key], field.fields)
                    } else if (utils.isArray(value[key])) {
                        value[key] = value[key].map(value => {
                            return this.cleanLabelValueToValue(value, field.fields);
                        })
                    }
                } else {
                    if (field.dict || field.dataSource) {
                        if (utils.isLabelValue(value[key])) {
                            value[key] = value[key].value;
                        }
                    }
                }
            }
        })
        return value;
    }
    private onChangeValue(value: any, former: any) {
        // 清洗下labelvalue
        if (this.state.isStepMode && this.state.isStepOne) {
          //  return this.setState({
           //     setpOneValue: value,
           //     value: {
            //        ...this.state.value,
            //        ...value
            //    }
           // })
        }

        return new Promise((resolve, reject)=> {

            this.props.onChangeValue(this.cleanLabelValueToValue(value)).then(() => {
                this.setState({visible: false});
                this.props.onClose();
                resolve(true)
            }).catch(e => {
                reject(e)
                //former.setState({loading: false})
            });
        })
    }
    public render() {
        
        let { schema, dynamicSchema, visible, isStepMode, isStepOne, viewer } = this.state;
        let notice: any = this.getDefaultNotice();
        
        let pageSchema: any = isStepMode 
            ? isStepOne 
                ?  schema.firstStep
                : dynamicSchema ||  schema.other
            : dynamicSchema || schema;

            
        if (!visible) {
            return null;
        }
        return (
            <Former
                title={this.getDefaultTitle()}
                icon={this.getDefaultIcon()}
                size={'default'}
                notice={notice}
                loading={this.state.loading}
                className="ui-tabler-former"
                rowKey={this.props.rowKey}
                id={this.getDefaultId()}
                type={this.props.formerType}
                schema={pageSchema}
                visible={this.state.visible}
                okText={this.getDefaultOkText()}
                cancelText={this.getDefaultCancelText()}
                onSave={(value: any, former: any) => {
                    
                    return this.onChangeValue(value, former)
                }}
                
                onBeforeSave= {() => {
                    
                    if (this.state.isStepMode && this.state.isStepOne) {
                        this.setState({
                            isStepOne: false
                        })
                        return false;
                    }
                }}
                onChangeValue={(value)=> {

                    //return ;
                    if (this.state.isStepMode && this.state.isStepOne && schema.firstFields.length == 1) {

                        let currentField: any = schema.firstField;
                        let setpOneValue: any = this.state.setpOneValue || {};
                        let newValue: any = value[currentField.key];
                        if (newValue && ( newValue != setpOneValue[currentField.key])) {

                            if (this.isStepDynamicFormer()) {

                                this.onDynamicStepChange(value);
                            } else {
                            
                                this.setState({
                                    setpOneValue: utils.clone(value),
                                    value: value,
                                    isStepOne: false
                                })
                            }
                        }
                    }
                }}
                
                disabled = {this.state.isStepMode && !this.state.setpOneValue}
                value = {this.state.value}
                viewer = {this.state.viewer}
                canmodify = {this.state.value && this.state.value.id}
                onGetDependentParameters = {(value: any)=> {
                    return this.state.value ? {
                        [RelationshipExtendEnum.MASTERID]: this.state.value.id
                    } : {}
                }}
                onInit = {(former: any) => {
                    this.former = former;
                    
                }}
                autoclose = {false}
                column = {this.props.column ? this.props.column as any : 'two'}
                width = {(this.props.column =='one' ? 500 : 700)}
                onClose={(isInitiate?: any) => {
                    
                    if (isInitiate) {
                        if (this.cancelDoback()) {
                            return this.setState({
                                isStepOne: true
                            });
                        }
                    } 

                    // 关闭
                    this.setState({
                        visible: false
                    })
                    this.props.onClose();
                
                }}
            >{this.props.children}</Former>
            
        )
    }
}