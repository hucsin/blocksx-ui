/**
 * 动态former显示
 */

 import React from 'react';
 import ReactDOM from 'react-dom';

 import classnames from 'classnames';
 import { RightOutlined } from '@ant-design/icons'
 import * as Icons from '../../Icons'
 import { Space} from 'antd';
 import { routerParams } from '../../utils/withRouter';
 import  Former  from '../../Former'

 import { utils } from '@blocksx/core'
 import SchemaUtils from '../../utils/tool';

 export interface SmartPageFormerProps {
    schema: any,
    viewer: boolean;
    pageMeta: any,
    title: string;
    path: string;
    value: any;
    reflush: any,
    okText: string;
    onGetRequestParams?: Function;
    onChangeValue?: Function;
    noOperater?: boolean;
    mode?: string;
    operateContainerRef?: any;
    titleContainerRef?: any;
    router: routerParams;
    onClose?: Function;
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
}

export default class SmartPageFormer extends React.Component<SmartPageFormerProps, SmartPageFormerState> {
        public static defaultProps = {
            viewer: false,
            okText: 'Ok'
        }
        public constructor(props: SmartPageFormerProps) {
            super(props);
            this.state = {
                title: props.title,
                schema: this.getSchema(props.schema),
                fields: props.schema.fields,
                viewer: props.viewer,
                okText: props.okText,
                value: props.value || {},
                isStepOne: props.value ? false: true,
                isStepMode: this.isStepFormer(props.schema),
                setpOneValue: props.value,
                pageMeta: props.pageMeta,
            }
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
                    value: newProps.value,
                    pageMeta: newProps.pageMeta,
                    title: newProps.title,
                    okText: newProps.okText || 'Ok',
                    isStepOne: newProps.value ? false : true,
                    isStepMode: this.isStepFormer(newProps.schema),
                    setpOneValue: utils.clone(newProps.value)
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
            
             
            return (
                <div className='ui-header'>
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
            if (this.props.onChangeValue) {
                let result: any = this.props.onChangeValue(this.cleanLabelValueToValue(value))
                
                if (utils.isPromise(result)) {
                    return result.then(() => {
                        former.setState({loading: false})
                    }).catch(e => {
                        former.setState({loading: false})
                    });
                } else {
                    former.setState({loading: false})
                }
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
                    <Former
                        
                        id={this.getDefaultId()}
                        schema={pageSchema}
                        okText={this.getDefaultOkText()}
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
                            this.props.onClose && this.props.onClose();
                        }}
                        column = {pageMeta.column ? pageMeta.column as any : 'two'}
                        
                    />
                </>
            )
        }
    }