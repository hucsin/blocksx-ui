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

import {  upperFirst } from 'lodash'

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
    dynamicSchema?: any;
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
        this.state = {
            visible: !!props.action,
            schema: this.getSchema(props.fields, props.viewer),
            action: props.action,
            
            value: props.value,
            fields: props.fields,
            viewer: props.viewer,
            isStepOne: props.value ? false: true,
            isStepMode: this.isStepFormer(props.fields),
            setpOneValue: props.value,
            loading: false
        }

        if (this.isStepDynamicFormer()) {
            
            this.nextDyamicRequest = SmartRequest.createPOST(this.getStepDynamicFormer())
        }
    }
    private getStepDynamicFormer() {
        
        let { pageMeta = {}}  = this.props;
        let stepnext: any = pageMeta && pageMeta.props && pageMeta.props.stepnext;

        if (stepnext) {

            return pageMeta.path ? pageMeta.path + '/' + stepnext : stepnext;
        }
    }
    private isStepDynamicFormer () {
        return !!this.getStepDynamicFormer();
    }
    private onDynamicStepChange(value: any) {
        this.setState({loading: true})
        this.nextDyamicRequest(value).then((result) => {
            let trueValue: any = {
                ...this.state.setpOneValue,
                ...result.value
            }
            this.setState({
                loading:false,
                dynamicSchema: result.schema,
                setpOneValue: utils.clone(trueValue),
                value: trueValue,
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
            
            this.setState({
                action: newProps.action,
                name: newProps.name,
                schema: this.getSchema(newProps.fields || this.state.fields),
                visible: !!newProps.action,
                value: newProps.value,
                fields: newProps.fields,
                isStepOne: newProps.value ? false : true,
                isStepMode: this.isStepFormer(newProps.fields),
                setpOneValue: utils.clone(newProps.value)
            })
            
            if (!!newProps.action) {
                this.resetValue()
            }
        }
        
        if (newProps.viewer != this.state.viewer) {
            this.setState({
                viewer: newProps.viewer,
                schema: this.getSchema(newProps.fields || this.state.fields, newProps.viewer)
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


    private getSchema(fields?: any, viewer?: boolean) {
        let { formerSchema, action = 'edit' } = this.props;
        let hviewer: any = typeof viewer !== 'undefined' ? viewer : this.state.viewer;

        if (formerSchema && formerSchema[action]) {
            return formerSchema[action]
        }
        // 如果是step模型
       
        if (!hviewer && this.isStepFormer(fields)) {

            let firstFields: any = this.splitStepField(fields, true)

            return {
                firstFields,
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

        return value ? value.id : 0;
    }
    private getStepFistTitle() {

        let firstField: any = this.state.schema.firstField;
        let fistName: string = ['Choose the ', firstField.key].join('');

        if (this.state.setpOneValue) {
            let dict: any = firstField.dict || [];
            let keyValue: any = this.state.setpOneValue[firstField.key];
            let value: any = utils.isPlainObject(keyValue) ? keyValue.value : keyValue;
            let item: any = dict.find(it => it.value === value);
            let stateValue: any = this.state.value || {};
            let isDeny: any = firstField.modify == 'deny' && stateValue[this.props.rowKey || 'id'];
           
            
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
                        {item && TablerUtils.renderIconComponent(item)}
                        {item.label}
                    </span>
                )
            }

        } 
        return '1. ' + fistName;
        
        
    }
    private getStepTitle(isEdit?: boolean) {
        
         
        return (
            <div className='ui-header'>
                <span className='ui-stepone'>{this.getStepFistTitle()}</span>
                <RightOutlined/>
                <span className={
                    classnames({
                        'ui-steptwo': true,
                        'ui-disabeld': this.state.isStepOne
                    })
                }>2. {isEdit ? 'Edit' : 'Complete'} the record </span >
            </div>
        )
    }
    private getDefaultTitle() {

        if (this.state.isStepMode && !this.state.viewer) {
             
            return this.getStepTitle(this.state.action == 'edit');

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
                return this.state.name || this.state.action;
        }
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
        
        let { schema,dynamicSchema, visible, isStepMode, isStepOne, viewer } = this.state;
        let pageSchema: any = !viewer && isStepMode 
            ? isStepOne 
                ?  schema.firstStep
                : dynamicSchema ||  schema.other
            : schema;

        if (!visible) {
            return null;
        }

        return (
            <Spin spinning={this.state.loading}>
                <Former
                    title={this.getDefaultTitle()}
                    icon={this.getDefaultIcon()}
                    size={'default'}
                    rowKey={this.props.rowKey}
                    id={this.getDefaultId()}
                    type={this.props.formerType}
                    schema={pageSchema}
                    visible={this.state.visible}
                    okText={this.getDefaultOkText()}
                    onSave={(value: any, former: any) => {
                        console.log('save', value)
                        return this.onChangeValue(value, former)
                    }}
                    
                    onBeforeSave= {() => {
                        console.log('befeorsave')
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
                    onClose={() => {
                        this.setState({
                            visible: false
                        })
                        this.props.onClose();
                    }}
                >{this.props.children}</Former>
            </Spin>
        )
    }
}