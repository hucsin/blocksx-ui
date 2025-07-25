import React from 'react';
import classnames from 'classnames';
import i18n from '@blocksx/i18n';
import { StructuralSchemaFields } from '@blocksx/structural';
import { utils } from '@blocksx/core';
import { Space, Button } from 'antd';

import Former from './index';


import RelationshipExtendEnum from '@blocksx/bulk/src/constant/RelationshipExtendEnum';
import TablerUtils from '../utils/tool';
import SmartRequest from '../utils/SmartRequest';



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
    size?: string;
    title?: any;
    formerSchema?: any;
    action?: any;
    password?: boolean;
    fields?: any;
    value: any;
    pageMeta?: any;
    onChangeValue: Function;
    onClose?: Function;
    onSave?: Function;
    onView?: Function;
    okText?: string;
    viewer?: boolean;
    readonly?: boolean;
    titleContainerRef?: any;
    hideButtons?:boolean;
    defaultFirstTitle?: string;
    onGetRequestParams?: Function;
    iconType?: string;
    width?: number;
    reflush?: any;
    mandatoryValidation?: boolean;
    onInit?: Function;
    valueCleaning?: boolean;
}
export interface SFormerType {
    visible: boolean;
    value?: any;
    originValue?: any;
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
    iconType?: string;
    readonly?: boolean;
    reflush?: any;
    mandatoryValidation?: boolean;
}

export default class StepFormer extends React.Component<IFormerType, SFormerType>  {
    public static defaultProps = {
        formerType: 'default',
        size: 'default',
        valueCleaning: true
    }
    private former: any;
    private nextDyamicRequest: any;
    
    public constructor(props: IFormerType) {
        super(props);
        let fields: any = props.fields || props.schema && props.schema.fields;
        let columnKeys:any = TablerUtils.getFieldKeysByColumnOnly(fields);
        let isStepOne: boolean = !this.isFistMustValue(this.splitStepField(fields, true), props.value);
        
        let isStepMode: boolean = this.isStepFormer(fields);
        this.state = {
            visible: !!props.action,
            schema: this.getSchema(fields),
            columnKeys: columnKeys ,
            action: props.action,
            value: props.valueCleaning ? utils.omit(props.value || {}, columnKeys) : props.value,
            originValue: props.value,
            fields: fields,
            viewer: props.viewer,
            isStepOne: isStepOne,//props.value ? false: true,
            isStepMode:isStepMode ,
            setpOneValue: props.value,
            loading: false,
            id: 0,
            reflush: props.reflush || 'default' ,
            iconType:  (isStepMode ?  isStepOne ? 'avatar' : 'icon' : props.iconType || 'avatar'),
            readonly: props.readonly,
            mandatoryValidation: props.mandatoryValidation
        }


        
        if (this.isStepDynamicFormer()) {
            
            
            this.nextDyamicRequest = SmartRequest.makePostRequest(this.getStepDynamicFormer())
        }
    }

    /**
     * 判断第一步是否有完整的值
     */
    private isFistMustValue (fistFields: any, _value: any) {

        let value: any = _value ||  {};
        
        for(let i=0, l=fistFields.length;i<l;i++) {
            let field: any = fistFields[i];
            

            if (!utils.isValidValue(value[field.fieldKey]) && field.isRequired) {
               //alert(3333)
                return false;
            }
        }
        return true;
    }
    private isFistValueRequired(value: any) {
        let firstFields: any = this.splitStepField(this.state.fields, true);

        return this.isFistMustValue(firstFields, value)
    }
    public componentDidMount(): void {

      
    }
    private getStepDynamicFormer() {
        
        let { pageMeta = {}}  = this.props;
        let stepnext: any = pageMeta &&( pageMeta.stepnext || (pageMeta.props && pageMeta.props.stepnext) );
        
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
            
            let trueSchema:any = utils.copy(schema.other ? schema.other : schema);
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

        let { pageMeta = {}}  = this.props;
        // 如果依赖值有变化，则不请
        if (pageMeta.stepnextrelyValue) {
            let relyKeys: any = Object.keys(pageMeta.stepnextrelyValue);
            
            let existKeys: any = relyKeys.filter(it => {
                return utils.isValidValue(value[it])
            })

            if (existKeys.length == relyKeys.length) {
                return this.setStepOne(false)
            }
            
        }
        
        this.setState({loading: true})

        let params: any = {
            ...value,
            ...this.props.onGetRequestParams && this.props.onGetRequestParams(value, 'next')
        };

        
        this.nextDyamicRequest(params).then((result) => {
            let trueValue: any =  {
                ...this.state.setpOneValue,
                ...result.value
            };

            if (result.schema) {
                
                this.setState({
                    loading:false,
                    dynamicSchema: this.getDynamicSchema(result.schema),
                    setpOneValue: utils.copy(trueValue),
                    value: trueValue,
                    id: this.state.id + 1,
                    isStepOne: false,
                    iconType: 'icon'
                })
                
            } else {
                this.setState({
                    loading:false,
                    //setpOneValue: utils.copy(trueValue),
                    value: trueValue,
                    isStepOne: false,
                    iconType: 'avatar'
                })
            }
            this.former.resetSafeValue(trueValue, 'man', (value) => {
                this.former.stepFormer.setStepOne(false);
            })
            this.former.setLoading(false);
            
            //this.former.resetSafeValue(trueValue, 'man')
        }).catch(e => {
            this.setState({
                loading: false
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

        if (newProps.action !== this.state.action ) {
            let columnKeys: any = TablerUtils.getFieldKeysByColumnOnly(newProps.fields || this.state.fields);
            
            this.setState({
                action: newProps.action,
                name: newProps.name,
                originValue: newProps.value,
                schema: this.getSchema(fields || this.state.fields),
                columnKeys: columnKeys,
                visible: !!newProps.action,
                value: newProps.valueCleaning ? utils.omit(newProps.value || {}, columnKeys) : newProps.value,
                fields: fields,
                isStepOne: newProps.value ? false : true,
                iconType:  newProps.value? 'icon': 'avatar',
                isStepMode: this.isStepFormer(fields),
                setpOneValue: utils.copy(newProps.value || {})
            })

            if (newProps.value && this.isStepDynamicFormer()) {
                this.onDynamicStepChange(newProps.value)
            }


            if (!!newProps.action) {
                //this.resetValue()
            }
        }

        if (!newProps.valueCleaning) {
            if (newProps.value !== this.state.value) {
                this.setState({
                    value: newProps.value
                })
            }
        }

        if (!utils.isUndefined(newProps.reflush) && newProps.reflush !== this.state.reflush) {
            this.setState({
                value: newProps.value,
                reflush: newProps.reflush
            })
        }
        
        if (newProps.viewer != this.state.viewer) {
            this.setState({
                viewer: newProps.viewer,
                schema: this.getSchema(fields || this.state.fields)
            })
        }

        if (newProps.readonly != this.state.readonly) {
            this.setState({
                readonly: newProps.readonly
            })
        }
        if (newProps.mandatoryValidation != this.state.mandatoryValidation) {
            this.setState({
                mandatoryValidation: newProps.mandatoryValidation
            })
        }
    }
    
    public resetValue() {
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
                other: TablerUtils.getDefaultSchema([...this.splitStepField(fields), ...this.converHidenFields(firstFields)])
            }

        } else {
       
            return TablerUtils.getDefaultSchema(fields);
        }
    }
    private converHidenFields(fields) {
        
        return utils.copy(fields).map(it =>{
            return {
                ...it,
                uiType: 'hidden',
                'ui-type': 'hidden',
                group: 9,
                hidden: true
            }
        })
    }
    private splitStepField(fields: any ,isFirst?: boolean) {

        return fields.filter(field => {
            return  isFirst 
                ? field.step : (!field.step || field.step == 'all')
        })
    }
    private getDefaultId() {
        let value: any = this.state.value;
        
        return value ? value.id || this.state.id : this.state.id;
    }
    private getDefaultNotice() {
        let { pageMeta = {}} = this.props;
        let { notice, noticeIcon } = pageMeta;
        if (notice ) {
            if (utils.isString(notice)) {
                notice = {
                    notice
                }
            }
            
            return {
                ...notice,
                icon: noticeIcon || notice.icon ||  pageMeta.icon
            }
        }
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
        let { pageMeta = {} } = this.props;
        
        let fistName: string = utils.upperFirst(firstField.name);
        let pageinfo: any = pageMeta.page || {};
        let defaultTitle: string = pageinfo.title || this.props.defaultFirstTitle || (fistName);
        
        if (this.state.setpOneValue && !this.state.isStepOne) {
            
            let item: any = this.getFirstItem(firstField);
            let isDeny: any = this.isDenyBack();
            
            return (
                <span className={classnames({
                    'ui-choose': true,
                    'ui-disabeld': isDeny
                })} onClick={()=> {
                    if (!isDeny) {
                        this.setStepOne(true)
                    }
                }}>
                    {item ? item.label : defaultTitle}
                </span>
            )
        } 

        return defaultTitle;
        
        
    }
    private setStepOne(isStepOne: boolean) {
        this.setState({
            isStepOne: isStepOne,
            iconType: !isStepOne ? 'icon' : 'avatar'
        })
    }
    private stepActionMap: any = {
        'setting': '',
        'create': '',
        'edit': 'Edit',
        'view': 'View'
    }
    private getStepTitle(type?: string) {
        
        let { pageMeta = {} } = this.props;
        let { schema, value, isStepOne } = this.state;
        let { firstFields } = schema;
        let hasfirtready: boolean = !!isStepOne &&  this.isFistMustValue(firstFields, value);

        return (
            <div className='ui-header'>
                <Space>
                    <span className='ui-stepone'>{this.getStepFistTitle()}</span>
                    <span style={{color:'#ccc',opacity: .3}}>/</span>
                    <span className={classnames({
                            'ui-steptwo': true,
                            'ui-choose': hasfirtready,
                            'ui-disabeld': !hasfirtready && this.state.isStepOne
                        })}
                        onClick={()=> {
                            if (this.isFistMustValue(this.splitStepField(this.state.fields, true), value)) {
                                if (this.isStepDynamicFormer()) {
                                    this.onDynamicStepChange(this.state.setpOneValue)
                                } else {
                                    hasfirtready && this.setStepOne(false)
                                }
                            }
                        }}
                    ><span style={{color:'#ccc'}}></span>{this.stepActionMap[type as any] ||  ''} {(pageMeta.title ||'record')} {hasfirtready && <Button  size='small'>Next</Button>}</span >
                </Space>
            </div>
        )
    }
    private renderDefaultTitle() {
        
        if (this.state.isStepMode ) {
             
            return this.getStepTitle(this.state.action);

        } else {
            let { pageMeta = {} } = this.props;
            
            switch (this.state.action) {
                case 'add': 
                case 'create':
                    return i18n.t(['Create', 'new', this.props.pageType || pageMeta.title].join(' '));
                default: 
                    let name: string = this.state.name || this.state.action || '' ;
                    return this.props.title || `${utils.upperFirst(name)} ${this.props.pageType || pageMeta.title}`
            }
        }
    }
    
    private getDefaultIcon() {
        let { pageMeta = {} } = this.props;
        
        return !this.state.isStepOne && this.state.isStepMode 
            ? 'LeftCircleDirectivityOutlined': pageMeta.icon;
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
                return utils.upperFirst(this.state.name || this.state.action);
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
    public validationValue() {
        let validator: any = new StructuralSchemaFields([]);
        return validator.validateOne(
            this.props.schema.fields,
            this.state.value
        )
    }
    private onChangeValue(value: any, type?: string) {
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
        
        
        this.setState({
            value: value
        })
        if (this.props.onChangeValue) {
            this.props.onChangeValue(this.cleanLabelValueToValue(value),type);
        }
    }
    private hide(value?: any) {
        
        this.setState({visible: false});
        
        if (this.props.onClose) {
            this.props.onClose(value || this.cleanLabelValueToValue(this.state.value));
        }
    }
    private onSave(value: any) {
        let saveback: Function  = this.props.onSave || this.props.onChangeValue;
        let truevalue: any = this.cleanLabelValueToValue(value);
        
        if (saveback) {
            let msg: any = saveback(truevalue);

            if (utils.isPromise(msg)) {
                return new Promise((resolve, reject)=> {
                    msg.then(((result) => {
                        this.hide(truevalue);
                        resolve(true)
                    })).catch(reject)
                })
            } else {
                this.hide(truevalue);
            }
        }
    }

    public goNext() {
        this.former.validationValue((value: any)=> {
            
            if (this.isStepDynamicFormer()) {
                this.onDynamicStepChange(this.state.value);
            } else {    
                this.setStepOne(false)
            }
        })

    }
    private isFistValueHasChanged(newValue: any) {
        let { schema, value } = this.state;
        let { firstFields } = schema;
        let majorFieldKeys: any = [];
        let firstFieldKeys: any = firstFields.map(it=> {
            if (it.major) {
                majorFieldKeys.push(it.fieldKey)
            }
            return it.fieldKey;
        });
        

        let pickKeys: any = majorFieldKeys.length > 0 ? majorFieldKeys : firstFieldKeys;
        
        let ofirstvalue: any = utils.pick(value, pickKeys);
        let nfirstvalue: any = utils.pick(newValue, pickKeys);
        let allkeys: any = [...Object.keys(ofirstvalue), ...Object.keys(nfirstvalue)]
        
        return allkeys.some(it => {
            if (!utils.isValidValue(ofirstvalue[it]) && !utils.isValidValue(nfirstvalue[it])) {
                return false;
            }
            if (!utils.isValidValue(nfirstvalue[it])) {
                return false;
            }
            return ofirstvalue[it] !== nfirstvalue[it]
        })
    } 
    public render() {
        
        let { schema, dynamicSchema, visible, isStepMode, isStepOne, viewer } = this.state;
        let { pageMeta = {}} = this.props;
        let groupType: any = pageMeta.groupType || pageMeta.props && pageMeta.props.groupType;
        let groupMeta: any = null;

        if (utils.isPlainObject(groupType)) {
            groupMeta = groupType;   
            groupType = groupType.type;
             
        } else {
            groupMeta = pageMeta.groupMeta;
        }
        
        
        let notice: any = this.getDefaultNotice();
        
        let pageSchema: any = isStepMode 
            ? isStepOne 
                ?  schema.firstStep
                : dynamicSchema ||  schema.other
            : dynamicSchema || schema;
            
        
        if (!visible && this.props.formerType!=='default') {
            // 如果return 当为popover这种模式的时候没办法显示了
           // return null;
        }
        
        return (
            <Former
                password={this.props.password}
                groupType ={groupType}
                groupMeta={groupMeta}
                title={ this.renderDefaultTitle()}
                titleContainerRef={this.props.titleContainerRef}
                icon={this.getDefaultIcon()}
                iconType={this.state.iconType || (this.state.isStepOne ? 'avatar' : 'icon')}
                size={this.props.size}
                notice={notice}
                loading={this.state.loading}
                mandatoryValidation={this.state.mandatoryValidation}
                className="ui-tabler-former"
                rowKey={this.props.rowKey}
                onVisible={(visible)=> {
                    this.setState({
                        visible
                    })
                }}
                id={this.getDefaultId()}
                key ={this.state.reflush}
                type={this.props.formerType}
                schema={pageSchema}
                hideButtons={this.props.hideButtons}
                visible={this.state.visible}
                okText={this.getDefaultOkText()}
                cancelText={this.getDefaultCancelText()}
                onSave={(value: any, former: any) => {
                    
                    return this.onSave(value)
                }}
                
                onBeforeSave= {() => {
                    
                    if (this.state.isStepMode && this.state.isStepOne) {
                        this.setStepOne(false)
                        return false;
                    }
                }}
                onChangeValue={(value, type)=> {
                    console.log(value, type,222222000191919)
                    if (this.state.isStepMode 
                            && this.state.isStepOne ) 
                    {
                        

                        //let currentField: any = schema.firstField;
                        //let setpOneValue: any = this.state.setpOneValue || {};
                        //let newValue: any = value[currentField.key];
                        //if (newValue && ( newValue != setpOneValue[currentField.key])) {
                        // 检查
                        //return;
                        this.setState({
                            setpOneValue: {
                                ...this.state.setpOneValue,
                                ...utils.copy(value)
                            },
                        })
                        
                        if (this.isFistValueHasChanged(value) ) {
                            if (this.isFistValueRequired(value) && type !=='init') {
                             
                           // if (this.isFistValueHasChanged(this.state.setpOneValue)) {
                                if (this.isStepDynamicFormer()) {
                                    
                                    this.onDynamicStepChange(value);
                                } else {    
                                    
                                    this.setStepOne(false)
                                }
                            //}
                            }
                        }
                       // }
                    }


                    this.onChangeValue({
                        ...this.state.value,
                        ...value
                    }, type)
                }}
                
                disabled = {this.state.isStepMode && !this.state.setpOneValue}
                value = {{...this.state.value}}
                viewer = {this.state.viewer}
                readonly = {this.state.readonly}
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

                    this.former.stepFormer = this;

                    this.props.onInit && this.props.onInit(former);
                }}
                autoclose = {false}
                column = {utils.isMobileDevice() ? 'one' : this.props.column ? this.props.column as any : 'two'}
                width = {utils.isMobileDevice() ? 900 : this.props.width || (this.props.column =='one' ? 500 : 700)}
                onClose={(isInitiate?: any) => {
                    if (isInitiate) {
                        if (this.cancelDoback()) {
                            return this.setStepOne(true), false;
                        }
                    } 
                    // 关闭
                    this.setState({
                        visible: false
                    })
                    
                    this.props.onClose && this.props.onClose(this.state.value);
                
                }}
            >{this.props.children}</Former>
            
        )
    }
}