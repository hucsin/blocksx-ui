import React from 'react';
import classnames from 'classnames';

import i18n from '@blocksx/i18n'
import { Tooltip, Popconfirm, Typography, Button, Popover, Dropdown } from 'antd';
import { 
    DiagramsTableObject, 
    DiagramsTableField 
} from './typing';

import { 
    Table, 
    Key,
    History, 
    Version, 
    Action, 
    Up, 
    Record, 
    Indexs, 
    Related, 
    RelyRelated, 
    Remove, 
    EditOutlined,
    PlusCircleOutlined 
} from '../Icons';

import Former from '../Former';
import FormerSchema from './schema';

import './style.scss';

interface DiagramsTableState {
    fields: any;
    more: boolean;
    showColor: boolean;
    left?: number;
    top?: number;
    color: any;
    changeType?: string;
    changeValue?: any;

    objectKey: string;
    objectName?: string;


    isRecorded?: any;
    geography?: any;
    subject?: string;

    isVersioned?: any;
    isHistoryed?: any;

    fieldType?: 'CommonField' | 'RelatedField' | 'TableInfo' | 'TableRecored' | '';
    fieldValue?: any;
    fieldIndex?: number;
    formerErrorTips?: string;
}

export default class DiagramsTable extends React.Component<DiagramsTableObject, DiagramsTableState> {
    private formerInsntance:any ;
    private fieldTypeMap: any = {
        field: 'CommonField',
        relation: 'RelatedField'
    };
    private colorList: any[] = [
        '#FA5151',
        '#4338CA',
        '#CD0074',
        '#00C322',
        '#6A0AAB',
        '#A6A300',
        '#388E3C',
        '#FF6F00',
        '#4E342E',
        '#F44336',
        '#7B1FA2',
        '#673AB7',
        '#3F51B5',
        '#827717'
    ];
    private defaultFiledMap: any[] = [
        'guid',
        'createdBy',
        'createdAt',
        'updatedBy',
        'updatedAt',
        'deletedBy',
        'deletedAt',
        'version'
    ]
    private defaultFieldList: any = [
        {
            key: 'createdBy',
            name: i18n.translate('创建者')
        },
        {
            key: 'createdAt',
            name: i18n.translate('创建时间')
        },
        {
            key: 'updatedBy',
            name: i18n.translate('更新者')
        },
        {
            key: 'updatedAt',
            name: i18n.translate('更新时间')
        },
        {
            key: 'deletedBy',
            name: i18n.translate('删除者')
        },
        {
            key: 'deletedAt',
            name: i18n.translate('删除时间')
        },
        {
            key: 'version',
            name: i18n.translate('数据版本号')
        }
    ];
    public constructor(props: DiagramsTableObject) {
        super(props);

        this.state = {
            fields: props.fields,
            more: false,
            showColor: false,
            isVersioned: props.isVersioned,
            isHistoryed: props.isHistoryed,
            isRecorded: props.isRecorded,
            color: props.color,
            fieldType: '',
            objectKey: props.objectKey,
            objectName: props.objectName,
            left: props.left,
            top: props.top
        }
    }
    public UNSAFE_componentWillReceiveProps(newProps: any) {
        
        if (newProps.style ) {
            
        }
    }
    private resetValue(obj: any ) {
        this.setState(obj)
    }

    private isRelyRelated (type: string) {
        return type && type.indexOf('rely_') > -1;
    }
    private renderTools() {
        
        return (
            <span 
                className='hoofs-diagrams-tools-icons'
                
            >
                <Tooltip 
                    placement="top" 
                    title={this.state.isRecorded ? i18n.translate('关闭记录表功能') : i18n.translate('打开记录表功能')}
                >
                    <Record 
                        {...{
                            className: this.state.isRecorded ? 'hoofs-selected' : '',
                            onClick: () => {
                                if(!this.state.isRecorded) {
                                    this.setState({
                                        fieldType: 'TableRecored',
                                        fieldValue: {
                                            geography: this.state.geography,
                                            subject: this.state.subject
                                        }
                                    })
                                } else {
                                    this.resetValue({
                                        isRecorded: !this.state.isRecorded
                                    })
                                }
                            }
                        }}
                    />
                </Tooltip>

                <Tooltip 
                    placement="top" 
                    title={this.state.isVersioned ? i18n.translate('关闭数据版本') : i18n.translate('打开数据版本')}
                >
                    <Version 
                        {...{
                            className: this.state.isVersioned ? 'hoofs-selected' : '',
                            onClick: () => {
                                this.resetValue({
                                    isVersioned: !this.state.isVersioned
                                })
                            }
                        }}
                    />
                </Tooltip>

                <Tooltip 
                    placement="top" 
                    title={this.state.isHistoryed ? i18n.translate('关闭历史记录') : i18n.translate('打开历史记录')}
                >
                    <History 
                        {...{
                            className: this.state.isHistoryed ? 'hoofs-selected' : '',
                            onClick: () => {
                                this.resetValue({
                                    isHistoryed: !this.state.isHistoryed
                                })
                            }
                        }}
                    />
                </Tooltip>
            </span>
        )
    }
    private renderFieldAction(index: number) {
        let fields: any = this.state.fields;
        let field: any = fields[index];
        return (
            <div className='hoofs-diagrams-field-action'>
                <EditOutlined onClick={()=> {
                    this.setState({
                        fieldType: this.fieldTypeMap[field.type],
                        fieldValue: field,
                        fieldIndex: index
                    })
                }}/>
                <Popconfirm 
                    overlayClassName="hoofs-diagrams-popconfirm"
                    placement="right"
                    title={i18n.translate('你确认删除字段《{key}》么?', {key: field.fieldKey})}
                    okText={i18n.translate('删除')}
                    cancelText={i18n.translate('取消')}
                    onConfirm={()=> {
                        let field: any = this.state.fields;
                        this.resetValue({
                            field: field.splice(index, 1)
                        })
                    }}
                >
                    <Remove/>
                </Popconfirm>
            </div>
        )
    }
    private saveUpdateField(value: any, defaultType:string) {

        let fields: any = this.state.fields;
        
        // update
        if (this.state.fieldValue) {
            fields[this.state.fieldIndex as number] = value;
        } else {
            value.type = defaultType;
            fields.push(value)
        }

        this.onChange({
            changeType: defaultType,
            changeValue: value,
            fields: fields,
            fieldIndex: undefined,
            fieldValue: undefined,
            fieldType: undefined
        })

    
    }
    private onChange(value: any ) {
        this.setState(value, () => {
            if (this.props.onChange) {
                this.props.onChange(this.state, value);
            }
        });
    }
    private isVerifyField(value:any, cb: Function) {
        let fieldKey: any = value.fieldKey;
        let currentFieldValue: any = this.state.fieldValue || {};
        let currentFieldKey: any = currentFieldValue.fieldKey;

        if (currentFieldKey == fieldKey) {
            return cb();
        }

        let same: any = this.state.fields.find((it) => {
            return it.fieldKey == value.fieldKey;
        });

        if (!same) {
            
            if (!(this.defaultFiledMap.indexOf(fieldKey) > -1)) {
                return cb()
            }
        }

        this.setState({
            formerErrorTips: i18n.translate('不能存在重复的字段名:{fieldKey}', {fieldKey})
        });

        setTimeout(()=> {
            this.setState({
                formerErrorTips: undefined
            })
        }, 2000)
    }
    private onSaveFormer(value: any) {
        
        // 
        switch(this.state.fieldType) {
            case 'CommonField':
                this.isVerifyField(value, ()=> {
                    this.saveUpdateField(value, 'field')
                })
                break;
            case 'RelatedField':
                this.isVerifyField(value, ()=> {
                    this.saveUpdateField(value, 'related')
                })
                break;
            case 'TableInfo':
                this.isVerifyField(value, ()=> {
                    this.onChange({
                        objectKey: value.objectKey,
                        objectName: value.objectName,
                        fieldType: '',
                        changeType: 'TableInfo'
                    })
                })
                break;
            case 'TableRecored':
                this.isVerifyField(value, ()=> {
                    this.onChange({
                        geography: value.geography,
                        subject: value.subject,
                        fieldType: '',
                        isRecorded: true,
                        changeType: 'TableRecored'
                    })
                })
                break;
        }

    }
    public render() {
        let { color = '#D9D9D9' } = this.state;
        let defaultFieldList:any = this.defaultFieldList;
        let schema:any = this.state.fieldType ?  FormerSchema[this.state.fieldType as string](this.props, this.state) : {};

        return (
            <div 
                id={this.state.objectKey}
                style={{
                    left: this.state.left,
                    top: this.state.top
                }}
                data-objectkey = {this.state.objectKey}
                className={
                    classnames({
                        'hoofs-diagrams': true,
                        'hoofs-diagrams-open-former': this.state.fieldType
                    })
                }
            >
                <div className='hoofs-diagrams-header' data-draggable style={{borderTopColor: color}}>
                    <h3 data-draggable><Table data-draggable /> {this.state.objectKey}</h3>
                    {this.state.objectName && <p data-draggable>{this.state.objectName}</p>}

                    {this.state.showColor && <div data-draggable className='hoofs-diagrams-colorList'>
                        {this.colorList.map((it,i) => {
                            return (<div key={i} onClick={() => {
                                this.resetValue({
                                    color:it
                                })
                                this.setState({
                                    showColor: false
                                })
                            }} style={{backgroundColor: it}}></div>)
                        })}
                        
                    </div>}

                    <div  className='hoofs-diagrams-tools'>
                        
                        {this.renderTools()}
                        <span className='hoofs-diagrams-hr'></span>
                        <span className='hoofs-diagrams-color' onClick={()=> {
                            this.setState({
                                showColor: true
                            })
                        }} style={{backgroundColor:color}}></span>
                        <Dropdown 
                            menu={{
                                items:[
                                    {
                                        key: 'edit',
                                        label:  (<span 
                                            onClick={()=>{
                                                this.setState({
                                                    fieldType: 'TableInfo',
                                                    fieldValue: {
                                                        objectKey: this.state.objectKey,
                                                        objectName: this.state.objectName
                                                    }
                                                })
                                            }}>编辑表信息</span>)
                                    }
                                ] as any}
                            }
                            overlayClassName="hoofs-diagrams-former-select"
                            placement="bottomRight"
                        >
                            <Action {...{className: 'hoofs-diagrams-actions'}}/>
                        </Dropdown>
                    </div>
                </div>
                <div className='hoofs-diagrams-fields'>
                    <ul jtk-scrollable-list="true">
                        <li className='hoofs-diagrams-default'><Key/> guid<span>{i18n.translate('数据主键')}</span></li>
                        {this.state.fields.map((it: DiagramsTableField, index:number)=> {
                            let key: string = this.state.objectKey + '.' + it.fieldKey;
                            // 字段
                            if (it.type == 'field') {
                                return (
                                    <li id={key} key={key} data-fieldkey={it.fieldKey}>
                                        {it.isIndexed && <Indexs/>} 
                                        {it.fieldKey}<span>{it.fieldName}</span>
                                        <div className='hoofs-diagrams-type'>
                                            {it.fieldType}({it.fieldLength})
                                        </div>
                                        {this.renderFieldAction(index)}
                                    </li>
                                )
                            } else {
                                // 关系字段
                                if (it.type = 'relation') {
                                    return (
                                        <li  id={key} key={key} className='hoofs-diagrams-relation'>
                                            
                                            {it.fieldKey}<span className='title'>{it.fieldName}</span>
                                            {this.isRelyRelated(it.fieldType) ? <RelyRelated/> : <Related/>}

                                            {this.renderFieldAction(index)}
                                        </li>
                                    )
                                }
                            }
                        })}

                        {(!this.state.more && this.state.fields.length > 4)
                            ? <li  key="-1" className='hoofs-diagrams-more' onClick={()=> {this.setState({more: !this.state.more})}}>{i18n.translate('展开默认6个字段')}</li>
                            : defaultFieldList.map((it, i) => {
                                return <li key={'d'+i} className='hoofs-diagrams-default'>{it.key}<span>{it.name}</span></li>
                            })
                        }
                    </ul>
                </div>
                <div className='hoofs-diagrams-former'  style={{borderTopColor: color}}>
                    
                    {this.state.fieldType && <Former 
                        key={this.state.fieldType}
                        size="small" 
                        column="two" 
                        schema={schema} 
                        value={this.state.fieldValue}
                        onInit={(former)=> {
                            this.formerInsntance = former;
                        }}
                        onSave={(value: any) => {
                            this.onSaveFormer(value)
                        }}
                    />}
                    <Typography.Title level={5} >{i18n.translate(this.state.fieldValue ? '编辑' : '新建') + schema.title}</Typography.Title>
                    <div className='hoofs-inner'>
                        <Button size='small' onClick={() => {
                            this.setState({
                                fieldType: '',
                                fieldIndex: undefined,
                                fieldValue: undefined
                            })
                        }}>取消</Button>
                        <Popover 
                            content={this.state.formerErrorTips}
                            open={!!this.state.formerErrorTips}
                        >
                            <Button size='small' type="primary" onClick={()=> {
                                
                                this.formerInsntance.onSave();
                            }}>确认</Button>
                        </Popover>
                    </div>
                </div>
                <div className='hoofs-diagrams-footer'>
                    <span><PlusCircleOutlined/> {i18n.translate('新增字段')}</span>
                    <div>
                        <div onClick={()=>this.setState({fieldType: 'RelatedField'})}>
                            <span><Up/></span>
                            {i18n.translate('关联字段')}
                        </div>
                        <div onClick={()=>this.setState({fieldType: 'CommonField'})}>
                            <span><Up/></span>
                            {i18n.translate('普通字段')}
                        </div>
                        
                        <div data-disabled>
                            <span><Up/></span>
                            {i18n.translate('虚拟字段')}
                        </div>
                        <div data-disabled >
                            <span><Up/></span>
                            {i18n.translate('联合字段')}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}