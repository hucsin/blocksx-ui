export default  {
    // 通用字段
    CommonField: (_, info: any) => {
        return {
            type: "object",
            title: "普通字段",
    
            properties: {
                fieldKey: {
                    type: 'string',
                    
                    'x-type': info.fieldValue ? 'label' : 'input',
                    'x-index': 0,
                    'title': '字段名称',
                    'x-validation': {
                        required: true
                    }
                },
                fieldName: {
                    type: 'string',
                    
                    'x-type': 'input',
                    'x-index': 1,
                    'title': '字段注释',
                    'x-validation': {
                        required: true
                    }
                },
                fieldType: {
                    type: 'string',
                    'x-type': 'select',
                    'x-index': 2,
                    'title': '字段类型',
                    'x-validation': {
                        required: true
                    },
                    dataSource: [
                        {
                            value: 'string',
                            label: '字符串'
                        },
                        {
                            value: 'integer',
                            label: '数字'
                        },
                        {
                            value: 'decimal',
                            label: '浮点数'
                        },
                        {
                            value: 'boolean',
                            label: '布尔'
                        },
                        
                        {
                            value: 'json',
                            label: 'JSON'
                        },
                        {
                            value: 'text',
                            label: '文本'
                        },
                        {
                            value: 'clobs',
                            label: '大字段'
                        },
                        
                        {
                            value: 'date',
                            label: '时间'
                        },
                        {
                            value: 'enum',
                            label: '枚举'
                        }
                    ],
                    'x-type-props': {
                        size: 'small',
                        popupClassName: 'hoofs-diagrams-former-select'
                        
                    },
                    'x-control': [{
                        when: ['decimal'],
                        show: ['./fieldDecimal']
                    },{
                        when: ['date', 'json'],
                        hide: ['./fieldLength']
                    }]
                },
                fieldLength: {
                    type: 'string',
                    'x-type': 'number',
                    'x-index': 3,
                    'title': '字段长度',
                    'x-validation': {
                        required: true
                    }
                },
                fieldDecimal: {
                    type: 'string',
                    'x-type': 'number',
                    'x-index': 4,
                    'title': '小数位数',
                    'x-validation': {
                        required: true
                    }
                },
                isRequired: {
    
                    type: 'boolean',
                    'x-type': 'switch',
                    'x-index': 5,
                    'x-group': '扩展',
                    'title': '是否必填',
                    'defaultValue': false,
    
                    'x-label-align': 'inline',
                    'x-validation': {
                        required: true
                    }
                },
                isIndexed: {
                    type: 'boolean',
                    'x-type': 'switch',
                    'x-index': 6,
                    'x-group': '扩展',
                    'title': '是否索引',
                    'defaultValue': false,
    
                    'x-label-align': 'inline',
                    'x-validation': {
                        required: true
                    }
                },
                isUniqued: {
                    type: 'boolean',
                    'x-type': 'switch',
                    'defaultValue': false,
                    'x-index': 7,
                    'x-group': '扩展',
                    'title': '是否唯一',
                    'x-label-align': 'inline',
                    'x-validation': {
                        required: true
                    }
                }
    
    
            }
        };
    },
    // 关联字段
    RelatedField: (props: any, info: any) => {
        return {
            
            type: "object",
            title: "关联关系",
            properties: {

                fieldKey: {
                    type: 'string',
                    
                    'x-type': info.fieldValue ? 'label' : 'input',
                    'x-index': 0,
                    'title': '字段名称',
                    'x-validation': {
                        required: true
                    }
                },
                fieldName: {
                    type: 'string',
                    
                    'x-type': 'input',
                    'x-index': 1,
                    'title': '字段备注',
                    'x-validation': {
                        required: true
                    }
                },
                fieldType: {
                    type: 'string',
                    'x-type': 'select',
                    'x-index': 2,
                    'title': '关联类型',
                    'x-colspan': 2,
                    'x-validation': {
                        required: true
                    },
                    
                    dataSource: [
                        {
                            value: 'rely_one',
                            label: '一对一(级联依赖)'
                        },
                        {
                            value: 'rely_onem',
                            label: '一对多(级联依赖)'
                        },
                        {
                            value: 'one',
                            label: '一对一'
                        },
                        {
                            value: 'onem',
                            label: '一对多'
                        }
                    ],
                    'x-type-props': {
                        size: 'small',
                        popupClassName: 'hoofs-diagrams-former-select'
                        
                    }
                },

                fieldConfig: {
                    type: 'object',
                    name: '目标对象',
                    'x-index': 3,
                    'x-colspan': 2,
                    properties: {
                        objectKey: {
                            'type': 'string',
                            'x-type': 'select',
                            'x-index': 3,
                            'title': '目标表',
                            'x-group': '目标对象',
                            'x-validation': {
                                required: true
                            },
                            'x-type-props': {
                                size: 'small',
                                popupClassName: 'hoofs-diagrams-former-select',
                                popupMatchSelectWidth: 150
                            },
                            dataSource: (params: any) => {
                                if (props.onGetTableList ) {
                                    let result: any = props.onGetTableList(params);
                                    
                                    if (result) {
                                        if (Array.isArray(result)) {
                                            return result.map(it => {
                                                let value: any = it.objectKey || it.value || it.key;
                                                return {
                                                    value: value,
                                                    label: value + '('+(it.objectName || it.label || it.name) +')'
                                                }
                                            }).filter((it)=> {
                                                return it.value !== info.objectKey
                                            })
                                        }
                                        return result;
                                    }
                                }
                                return []
                            }
                        },
                        fieldKey: {
                            'type': 'string',
                            'x-type': 'select',
                            'x-index': 4,
                            'x-group': '目标对象',
                            'title': '目标表字段',
                            'x-validation': {
                                required: true
                            },
                            'x-type-props': {
                                size: 'small',
                                popupClassName: 'hoofs-diagrams-former-select',
                                popupMatchSelectWidth: 150
                            },
                            dataSource: (params: any) => {
                                if (props.onGetTableList && params.fieldConfig) {

                                    let result: any[] = props.onGetTableList(params);
                                    let { objectKey } = params.fieldConfig;
                                    
                                    
                                    if (result) {
                                        if (Array.isArray(result)) {
                                            
                                            let itemFind: any = result.find(it => {

                                                return it.objectKey == objectKey;
                                            });
                                            if (itemFind && Array.isArray(itemFind.fields)) {
                                                return itemFind.fields.map(it => {
                                                    return {
                                                        value: it.fieldKey,
                                                        label: it.fieldKey + '(' + it.fieldName +')'
                                                    }
                                                })
                                            }
                                        }
                                        return [];
                                    }
                                }
                                return []
                            }
                        }
                    }
                }
            }

        }
    },
    TableInfo: (props: any, info: any) => {
        return {
            type: "object",
            title: "表基本信息修改",
            properties: {
                objectKey: {
                    type: 'string',
                    'x-type': info.fieldValue ? 'label' : 'input',
                    'x-index': 0,
                    'title': '表名称',
                    'x-validation': {
                        required: true
                    }
                },
                objectName: {
                    type: 'string',
                    'x-type': 'input',
                    'x-index': 1,
                    'title': '表注释',
                    'x-validation': {
                        required: true
                    }
                }
            }
        }
    },
    TableRecored: (props: any, state: any) => {
        return {
            type: "object",
            title: "普通字段",
            properties: {
                geography: {
                    'type': 'string',
                    'x-type': 'select',
                    'x-index': 3,
                    'title': '地理位置',
                    'x-group': '目标对象',
                    'x-type-props': {
                        size: 'small',
                        popupClassName: 'hoofs-diagrams-former-select',
                        popupMatchSelectWidth: 150
                    },
                    dataSource: []
                },
                subject: {
                    'type': 'string',
                    'x-type': 'select',
                    'x-index': 3,
                    'title': '主题字段',
                    'x-group': '目标对象',
                    'x-type-props': {
                        size: 'small',
                        popupClassName: 'hoofs-diagrams-former-select',
                        popupMatchSelectWidth: 150
                    },
                    dataSource: (params)=> {
                        let field: any = state.fields;
                        
                        return field.filter((it)=> {
                            return it.type == 'field'
                        }).map(it => {
                            return {
                                value: it.fieldKey,
                                label: it.fieldName
                            }
                        })
                    }
                }
            }
        }
    }
}