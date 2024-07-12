import React from 'react';
import classnames from 'classnames';
import i18n from '@blocksx/i18n';
import { Space} from 'antd';
import { RightOutlined } from '@ant-design/icons'

import Former from '../Former';
import { utils } from '@blocksx/core';

import RelationshipExtendEnum from '@blocksx/bulk/lib/constant/RelationshipExtendEnum';
import TablerUtils from '../utils/tool';
import SmartRequest from '../utils/SmartRequest';

import {  upperFirst, omit } from 'lodash';


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
    schema?: any;
    path?: any;
    mode?: any;
    title?: any;
    formerSchema?: any;
    action?: any;
    fields?: any;
    value: any;
    pageMeta?: any;
    onChangeValue: Function;
    onClose: Function;
    onView?: Function;
    okText?: string;
    viewer?: boolean;
    titleContainerRef?: any;

    defaultFirstTitle?: string;
    onGetRequestParams?: Function;
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
    public static defaultProps = {
        formerType: 'default'
    }
    private former: any;
    private nextDyamicRequest: any;
    
    public constructor(props: IFormerType) {
        super(props);
        let fields: any = props.fields || props.schema && props.schema.fields;
        let columnKeys:any = TablerUtils.getFieldKeysByColumnOnly(fields);

        this.state = {
            visible: !!props.action,
            schema: this.getSchema(fields),
            columnKeys: columnKeys ,
            action: props.action,
            value: omit(props.value, columnKeys),
            fields: fields,
            viewer: props.viewer,
            isStepOne: !this.isFistMustValue(fields, props.value),//props.value ? false: true,
            isStepMode: this.isStepFormer(fields),
            setpOneValue: props.value,
            loading: false,
            id: 0
        }
        
        if (this.isStepDynamicFormer()) {
            
            this.nextDyamicRequest = SmartRequest.createPOST(this.getStepDynamicFormer())
        }
    }

    /**
     * 判断第一步是否有完整的值
     */
    private isFistMustValue (_fields: any, _value: any) {
        let fields: any = _fields ||  [];
        let value: any = _value ||  {};
        let fistFields: any = this.splitStepField(fields, true);
        
        for(let i=0, l=fistFields.length;i<l;i++) {
            let field: any = fistFields[i];
            
            if (utils.isUndefined(value[field.fieldKey]) && field.isRequired) {
               //alert(3333)
                return false;
            }
        }

        return true;
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
            let hasdyschema: any =  dyschema.properties && Object.keys(dyschema.properties).length > 0;
            if (trueSchema) {
                if (nextKey) {
                    if (hasdyschema) {
                        trueSchema.properties[nextKey] = Object.assign({}, dyschema, {
                            uiType: 'object',
                            'x-colspan': 2,
                            'x-index': 10,
                            'x-group': nextKey,
                            fieldKey: nextKey,
                            title: ''
                        })
                        trueSchema.title = nextKey;
                    }
                   
                } else {    
                    // 把dyschema的属性复制到原来的schema

                    if (dyschema && dyschema.properties && hasdyschema) {
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
        let fields: any = newProps.fields ||  newProps.schema && newProps.schema.fields

        if (newProps.action !== this.state.action) {
            let columnKeys: any = TablerUtils.getFieldKeysByColumnOnly(newProps.fields || this.state.fields);
            
            this.setState({
                action: newProps.action,
                name: newProps.name,
                schema: this.getSchema(fields || this.state.fields),
                columnKeys: columnKeys,
                visible: !!newProps.action,
                value: omit(newProps.value, columnKeys),
                fields: fields,
                isStepOne: newProps.value ? false : true,
                isStepMode: this.isStepFormer(fields),
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
                schema: this.getSchema(fields || this.state.fields)
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
                
                this.setState({
                    value: result
                })
                former && former.setState({disabled: false, fetching: false})
            })
        }
    }


    private getSchema(_fields?: any) {
        let { formerSchema, schema = {}, action = 'edit' } = this.props;
        let fields: any = _fields || schema.fields;
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
        return  this.props.defaultFirstTitle || ('1. ' + fistName);
        
        
    }
    private stepActionMap: any = {
        'setting': 'Setting',
        'create': 'Complete',
        'edit': 'Edit',
        'view': 'View'
    }
    private getStepTitle(type?: string) {
        
        let { pageMeta = {} } = this.props;
        
         
        return (
            <div className='ui-header'>
                <Space>
                <span className='ui-stepone'>{this.getStepFistTitle()}</span>
                <span style={{color:'#ccc'}}>/</span>
                <span className={
                    classnames({
                        'ui-steptwo': true,
                        'ui-disabeld': this.state.isStepOne
                    })
                }><span style={{color:'#ccc'}}>2. </span>{this.stepActionMap[type as any] ||  'Complete'} {(pageMeta.title ||'record').toLowerCase()} </span >
                </Space>
            </div>
        )
    }
    private renderDefaultTitle() {
        
        if (this.state.isStepMode ) {
             
            return this.getStepTitle(this.state.action);

        } else {

            switch (this.state.action) {
                case 'add': 
                case 'create':
                    return i18n.t(['Create', 'new', this.props.pageType].join(' '));
                default: 
                    let name: string = this.state.name || this.state.action ;
                    return `${upperFirst(name)} ${this.props.pageType}`
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
        if (this.props.okText) {
            return this.props.okText;
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

            this.props.onChangeValue(this.cleanLabelValueToValue(value)).then((result) => {
                
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
        let { pageMeta = {}} = this.props;
        let groupType: any = pageMeta.groupType || pageMeta.props && pageMeta.props.groupType;
        let notice: any = this.getDefaultNotice();
        
        let pageSchema: any = isStepMode 
            ? isStepOne 
                ?  schema.firstStep
                : dynamicSchema ||  schema.other
            : dynamicSchema || schema;

        
        if (!visible && this.props.formerType!=='default') {
            return null;
        }

    
        
        return (
            <Former
                groupType ={groupType}
                title={this.renderDefaultTitle()}
                titleContainerRef={this.props.titleContainerRef}
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
                    
                    if (this.state.isStepMode 
                            && this.state.isStepOne
                            && this.isFistMustValue(this.state.fields, value)) 
                    {

                        //let currentField: any = schema.firstField;
                        //let setpOneValue: any = this.state.setpOneValue || {};
                        //let newValue: any = value[currentField.key];
                        //if (newValue && ( newValue != setpOneValue[currentField.key])) {
                        
                        if (this.isStepDynamicFormer()) {

                            this.onDynamicStepChange(value);
                        } else {
                        
                            this.setState({
                                setpOneValue: utils.clone(value),
                                value: value,
                                isStepOne: false
                            })
                        }
                       // }
                    }
                }}
                
                disabled = {this.state.isStepMode && !this.state.setpOneValue}
                value = {this.state.value}
                viewer = {this.state.viewer}
                canmodify = {this.state.value && this.state.value.id}
                onGetDependentParameters = {(value: any)=> {
                    if (this.props.onGetRequestParams) {
                        return this.props.onGetRequestParams(this.state.value) || {}
                    }
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