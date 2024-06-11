/**
 * 动态former显示
 */

 import React from 'react';
 import ReactDOM from 'react-dom';
 import classnames from 'classnames';
 import { RightOutlined } from '@ant-design/icons';
 import { utils } from '@blocksx/core'

 import SmartRequst from '../../../utils/SmartRequest';
 import * as Icons from '../../../Icons'
 import { Space, Spin } from 'antd';
 import { routerParams } from '../../../utils/withRouter';
 import  Former  from '../../../Former'
 import Manger from '../../core/SmartPageManger';

 
 import SchemaUtils from '../../../utils/tool';

 export interface SmartPageFormerProps {
    schema: any,
    viewer: boolean;
    pageMeta: any,
    title: any;
    path: string;
    value: any;
    valueMode?: string;
    reflush: any,
    okText: string;
    okIcon?: string;
    onGetRequestParams?: Function;
    onSave?: Function;
    onCancel?: Function;
    noOperater?: boolean;
    mode?: string;
    operateContainerRef?: any;
    titleContainerRef?: any;
    router: routerParams;
    onShow?: Function;

    toolbarRef?: any;

    noTitle?: boolean;
}

interface SmartPageFormerState {
    value: any;
    fields: any;
    pageMeta: any;
    title: string;
    schema: any;
    okText: string;
    isStepOne: boolean,
    isStepMode: boolean,
    setpOneValue: any
    viewer: boolean;
    loading: boolean;
}

export default class SmartPageFormer extends React.Component<SmartPageFormerProps, SmartPageFormerState> {
        public static defaultProps = {
            viewer: false,
            okText: 'Ok',
            reflush: 1,
            valueMode: 'remote'
        }
        private UpdateRequest: any;
        private ViewRequest: any;
        public constructor(props: SmartPageFormerProps) {
            super(props);
            this.state = {
                title: props.title,
                schema: this.getSchema(props.schema),
                fields: props.schema.fields,
                viewer: props.viewer,
                okText: props.okText,
                value: props.value || null,
                isStepOne: props.value ? false: true,
                isStepMode: this.isStepFormer(props.schema),
                setpOneValue: props.value,
                pageMeta: props.pageMeta,
                loading: props.valueMode == 'remote'
            }


            this.UpdateRequest = SmartRequst.createPOST(this.props.path + '/upsert', true);
            this.ViewRequest = SmartRequst.createPOST(this.props.path + '/view', true);
            
        }
        public componentDidMount(): void {
            
            this.ViewRequest(this.getDefaultParams()).then((result) => {
                
                this.setState({
                    value: result,
                    loading: false
                })
            })
        }
        private isStepFormer(schema: any) {
            let { fields = []} = schema ||{};
            return !!fields.filter(field => {
                return field.step
            }).length;
        }
    
        public UNSAFE_componentWillReceiveProps(newProps: SmartPageFormerProps) {
            
            if (newProps.title !== this.state.title) {
                
                this.setState({
                    schema: this.getSchema(newProps.schema),
                    fields: newProps.schema.fields,
                   // value: newProps.value,
                    pageMeta: newProps.pageMeta,
                    title: newProps.title,
                    okText: newProps.okText || 'Ok',
                    isStepOne: newProps.value ? false : true,
                    isStepMode: this.isStepFormer(newProps.schema),
                    setpOneValue: utils.clone(newProps.value)
                })
            }

            if (this.props.valueMode!== 'remote' && newProps.value !== this.state.value) {
                this.setState({
                    value: newProps.value
                })
            }
    
            if (newProps.viewer != this.state.viewer) {
                this.setState({
                    viewer: newProps.viewer
                })
            }
        }
        
    
        private getSchema(schema: any) {
            if (schema) {
                let fields: any = schema.fields;
        
                // 如果是step模型
                if (this.isStepFormer(schema)) {
        
                    return {
                        firstField: this.splitStepField(fields, true)[0] || {},
                        firstStep: SchemaUtils.getDefaultSchema(this.splitStepField(fields, true)),
                        other: SchemaUtils.getDefaultSchema(this.splitStepField(fields))
                    }
        
                } else {
                    return SchemaUtils.getDefaultSchema(fields);
                }
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
                
                let dict: any = firstField.dict;
                let keyValue: any = this.state.setpOneValue[firstField.key];
                let value: any = utils.isPlainObject(keyValue) ? keyValue.value : keyValue;
                let item: any = dict.find(it => it.value === value);
                
                if (item) {
                    return (
                        <span className='ui-choose' onClick={()=> {
                            
                            this.setState({
                                setpOneValue: null,
                                isStepOne: true
                            })
                        }}>
                            {item && SchemaUtils.renderIconComponent(item)}
                            {item.label}
                        </span>
                    )
                }
    
            } 
            return '1. ' + fistName;
            
            
        }
        private getStepTitle(IconsView) {
            console.log(this.state.setpOneValue, 777)
            return (
                <div className={classnames({
                    'ui-header': true
                })}>
                    {IconsView && <IconsView/>}
                    <span className='ui-stepone'>{this.getStepFistTitle()}</span>
                    <RightOutlined/>
                    <span className={
                        classnames({
                            'ui-steptwo': true,
                            'ui-disabeld': !this.state.setpOneValue
                        })
                    }>2. {this.state.title}</span >
                </div>
            )
        }
        private getDefaultTitleView() {
            let pageMeta: any = this.state.pageMeta;
            let IconsView: any = Icons[pageMeta.icon]
            
            if (this.state.isStepMode && !this.state.viewer) {
                 
                return this.getStepTitle(IconsView);
    
            } else {
                return (
                    <Space>
                        {IconsView && <IconsView/>}
                        {this.state.title}
                    </Space>
                )
            }
        }
        private getDefaultTitle() {
            
            if (this.props.noTitle) {
                return null;
            }

            if (this.props.titleContainerRef) {
                if (this.props.titleContainerRef.current){
                    return ReactDOM.createPortal(this.getDefaultTitleView(), this.props.titleContainerRef.current)
                }
            }
            
            return this.getDefaultTitleView();
        }
        private getDefaultOkText() {
            if (this.state.isStepMode && this.state.isStepOne) {
                return 'Next';
            }
            
            return this.state.okText
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
        private getDefaultParams() {
            return {
                ...(this.props.onGetRequestParams && this.props.onGetRequestParams()),
                ...(this.props.pageMeta ? this.props.pageMeta.params || {} : {})
            }
        }
        private onChangeValue(value: any, former: any) {

            value = {
                ...value,
                ...this.getDefaultParams()
            }
            
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
            
            if (this.props.onSave) {
                let result: any = this.props.onSave(this.cleanLabelValueToValue(value))
                
                if (utils.isPromise(result)) {
                    return result.then(() => {
                        former.setState({loading: false})
                    }).catch(e => {
                        former.setState({loading: false})
                    });
                } else {
                    former.setState({loading: false})
                }
            } else {
                return this.UpdateRequest(value)
            }
        }
        
        public render() {
            
            let { schema, isStepMode, isStepOne, pageMeta } = this.state;
            let pageSchema: any = isStepMode 
                ? isStepOne 
                    ?  schema.firstStep
                    :  schema.other
                : schema;

            return (
                <>
                    {this.getDefaultTitle()}
                    <Spin spinning={this.state.loading}>
                        {this.state.value && <Former
                            autoclose={false}
                            id={this.getDefaultId()}
                            schema={pageSchema}
                            okText={this.getDefaultOkText()}
                            okIcon={this.props.okIcon}
                            operateContainerRef={this.props.operateContainerRef}
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
                                if (this.state.isStepMode && this.state.isStepOne) {
                                    let currentField: any = schema.firstField;
                                    let setpOneValue: any = this.state.setpOneValue || {};
                                    let newValue: any = value[currentField.key];
                                    
                                    if (newValue && ( newValue != setpOneValue[currentField.key])) {
                                        this.setState({
                                            setpOneValue: utils.clone(value),
                                            value: value,
                                            isStepOne: false
                                        })
                                    }
                                }
                            }}
                            
                            disabled = {this.state.isStepMode && !this.state.setpOneValue}
                            value = {this.state.value}
                            viewer = {this.state.viewer}
                            onClose= {()=> {
                                this.props.onCancel && this.props.onCancel();
                            }}
                            column = {pageMeta.column ? pageMeta.column as any : 'two'}
                            
                        />}
                    </Spin>
                </>
            )
        }
    }

    Manger.registoryComponent('former', SmartPageFormer)