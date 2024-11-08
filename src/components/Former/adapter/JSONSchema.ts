/**
 * 将json schema 转换为 former schema
{
    type: 'object',
    properties: {
        userName: {
            type: 'string',
            description: 'Please select one xx below.',
            
        },
        whereEvent: {
            type: 'string',
            description: 'Please select one xx below.',
            enum: ["userName", "classType"]
        },
        place: {
            type: 'string',
            description: 'Please select one xx below.',
            maxLength: 255
        },
        number: {
            type: 'number',
            description: 'Please input one xx below.',
            minimum: 1,
            maximum: 100
        },
        boolean: {
            type: 'boolean',
            description: 'Please select one xx below.',
        },
        date: {
            type: 'string',
            description: 'Please select one xx below.',
            format: 'date'
        },
        datetime: {
            type: 'string',
            description: 'Please select one xx below.',
            format: 'date-time'
        },
        time: {
            type: 'string',
            description: 'Please select one xx below.',
            format: 'time'
        }
    },
    required: ['userName', 'whereEvent', 'date', 'datetime', 'time']
}
 */
import { utils } from '@blocksx/core';
export default class JSONSchema2FormerSchema {

    public static convert(input: any) {
        let schema = utils.copy(input);
        if (schema.default) {
            schema.defaultValue = schema.default;
        }

        switch (schema.type.toLowerCase()) {
            case 'object':
                return this.convertObject(schema);
            case 'boolean':
                schema['x-type'] = 'switch';
                break;
            case 'number':
                return this.convertNumber(schema);
                
            case 'array':
                return this.convertArray(schema);   
            case 'string':
                return this.convertString(schema);
        }     
          
        return schema;
    }
    public static convertNumber(schema: any) {
        schema['x-type'] = 'number';
        schema['x-type-props'] = {
            min: schema.minimum,
            max: schema.maximum
        }
        return schema;
    }
    public static convertArray(schema: any) {
        if (!schema.items) {
            schema['x-type'] = 'tags';
        }
        
        return schema;
    }   
    private static isUseRadio({enum: enums}:any) {
        
        if (enums.length< 5) {
            return true;
        }
        
        if(enums.reduce((sum, item) => sum + item.length, 0) < 30) {
            return true;
        }

        return false;
    }
    public static convertString(schema: any) {
        // 处理枚举
        if (Array.isArray(schema.enum)) {
            if (this.isUseRadio(schema)) {
                schema['x-type'] = 'radio';
            } else {
                schema['x-type'] = 'select';
            }
            schema.dataSource= schema.enum.map((item: any) => ({
                label: utils.labelName(item),
                value: item
            }))
        } else {
            // 处理日期
            if (schema.format) {
                switch (schema.format) {
                    case 'date':
                        schema['x-type'] = 'date';
                        break;
                    case 'date-time':
                        schema['x-type'] = 'datetime';
                        break;
                    case 'time':
                        schema['x-type'] = 'time';
                        break;
                    default:
                        schema['x-type'] = 'input';
                        break;
                }
                delete schema.format;
            } else {
                if (!schema.maxLength || schema.maxLength < 100) {
                    schema['x-type'] = 'input';
                } else {
                    schema['x-type'] = 'textarea';
                }

                
            }
        }
        return schema;
    }
    public static convertObject(schema: any) {
        let required: string[] = schema.required || [];
        Object.keys(schema.properties).forEach((key) => {
            
            schema.properties[key] = {
                ...this.convert(schema.properties[key]),
                title: utils.labelName(schema.properties[key].title || key),
                description: '',
                tooltip: schema.properties[key].description,
                ['x-index']: schema['x-order'] ? schema['x-order'].indexOf(key) : undefined,
                ['x-validation']: {
                    ...schema.properties[key],
                    required: required.includes(key)
                }
            }
        });
        return schema;
    }
}
