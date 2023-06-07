import React from 'react';
import i18n from '@blocksx/i18n'
import { Tooltip } from 'antd';
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

import './style.scss';

interface DiagramsTableState {
    fields: any;
    more: boolean;
    showColor: boolean;
    color: any;
    isVersioned?: any;
    isHistoryed?: any;
    isRecorded?: any;
}

export default class DiagramsTable extends React.Component<DiagramsTableObject, DiagramsTableState> {
    private colorList: any = [
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
            color: props.color
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
            <span className='hoofs-diagrams-tools-icons'>
                <Tooltip 
                    placement="top" 
                    title={this.state.isRecorded ? i18n.translate('关闭历史记录') : i18n.translate('打开历史记录')}
                >
                    <Record 
                        {...{
                            className: this.state.isRecorded ? 'hoofs-selected' : '',
                            onClick: () => {
                                this.resetValue({
                                    isRecorded: !this.state.isRecorded
                                })
                            }
                        }}
                    />
                </Tooltip>

                <Tooltip 
                    placement="top" 
                    title={this.state.isVersioned ? i18n.translate('关闭历史记录') : i18n.translate('打开历史记录')}
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
        return (
            <div className='hoofs-diagrams-field-action'>
                <EditOutlined/>
                <Remove 
                    {...{
                        onClick: () => {
                            let field: any = this.state.fields;
                            this.resetValue({
                                field: field.splice(index, 1)
                            })
                        }
                    }}
                />
            </div>
        )
    }
    public render() {
        let { color = '#D9D9D9' } = this.state;
        let defaultFieldList:any = this.defaultFieldList;

        return (
            <div className='hoofs-diagrams'>
                <div className='hoofs-diagrams-header' style={{borderTopColor: color}}>
                    <h3><Table /> {this.props.objectKey}</h3>
                    {this.props.objectName && <p>{this.props.objectName}</p>}

                    {this.state.showColor && <div className='hoofs-diagrams-colorList'>
                        {this.colorList.map(it => {
                            return (<div onClick={() => {
                                this.resetValue({
                                    color:it
                                })
                                this.setState({
                                    showColor: false
                                })
                            }} style={{backgroundColor: it}}></div>)
                        })}
                        
                    </div>}

                    <div className='hoofs-diagrams-tools'>
                        
                        {this.renderTools()}
                        <span className='hoofs-diagrams-hr'></span>
                        <span className='hoofs-diagrams-color' onClick={()=> {
                            this.setState({
                                showColor: true
                            })
                        }} style={{backgroundColor:color}}></span>
                        
                        <Action {...{className: 'hoofs-diagrams-actions'}}/>
                    </div>
                </div>
                <div className='hoofs-diagrams-fields'>
                    <ul>
                        <li className='hoofs-diagrams-default'><Key/> guid<span>{i18n.translate('系统主键')}</span></li>
                        {this.state.fields.map((it: DiagramsTableField, index:number)=> {
                            // 字段
                            if (it.type == 'field') {
                                return (
                                    <li>
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
                                        <li className='hoofs-diagrams-relation'>
                                            
                                            {it.fieldKey}<span className='title'>{it.fieldName}</span>
                                            {this.isRelyRelated(it.fieldType) ? <RelyRelated/> : <Related/>}

                                            {this.renderFieldAction(index)}
                                        </li>
                                    )
                                }
                            }
                        })}

                        {(!this.state.more && this.state.fields.length > 0)
                            ? <li className='hoofs-diagrams-more' onClick={()=> {this.setState({more: !this.state.more})}}>{i18n.translate('展开默认6个字段')}</li>
                            : defaultFieldList.map(it => {
                                return <li className='hoofs-diagrams-default'>{it.key}<span>{it.name}</span></li>
                            })
                        }
                    </ul>
                </div>
                <div className='hoofs-diagrams-footer'>
                    <span><PlusCircleOutlined/> 新增字段</span>
                    <div>
                        <div>
                            <span><Up/></span>
                            普通字段
                        </div>
                        <div>
                            <span><Up/></span>
                            关联字段
                        </div>
                        <div data-disabled>
                            <span><Up/></span>
                            虚拟字段
                        </div>
                        <div data-disabled >
                            <span><Up/></span>
                            联合字段
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}