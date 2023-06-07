/*
 * @Author: your name
 * @Date: 2022-02-28 16:31:20
 * @LastEditTime: 2022-02-28 20:50:43
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: /packages/design-components/src/former/editor/types/blank/schema/validation.ts
 */

export default {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      title: '类型',
      'x-type': 'select',
      'x-type-props': {
        dataSource: [
          {
            // 'null' | 'boolean' | 'object' | 'array' | 'arrayObject' | 'number' | 'string' | 'integer' | 'money'
            value: 'null',
            label: '空值(null)'
          },
          {
            value: 'boolean',
            label: '布尔(boolean)'
          },
          {
            value: 'object',
            label: '对象(object)'
          },
          {
            value: 'array',
            label: '数组(array)'
          },
          {
            value: 'arrayObject',
            label: '对象数组(arrayObject)'
          },
          {
            value: 'number',
            label: '数字(number)'
          },
          {
            value: 'string',
            label: '字符串(string)'
          }

        ]
      },
      'x-index': 1,
      'x-control': [
        
        {
          when: ['string'],
          show: ['./minLength', './maxLength', './pattern']
        },
        {
          when: ['array', 'arrayObject'],
          show: ['./minItems', './maxItems', './uniqueItems']
        },
        {
          when: ['number'],
          show: ['./multipleOf', './decimal', './maximum', './minimum', './exclusiveMaximum', './exclusiveMinimum']
        }
      ]
    },
    required: {
      type: 'boolean',
      title: "是否必填",
      'x-type': 'switch',
      defaultValue: false,
      'x-index': 2
    },
    multipleOf: {
      type: 'number',
      title: '整除于',
      'x-type': 'number',
      'x-index': 3
    },
    decimal: {
      type: 'number',
      title: '小数位数',
      'x-type': 'number',
      'x-index': 4
    },
    maximum: {
      
      type: 'number',
      title: '最大值(包含自己)',
      'x-type': 'number',
      'x-index': 5
    },
    minimum: {

      type: 'number',
      title: '最小值(包含自己)',
      'x-type': 'number',
      'x-index': 6
    },

    exclusiveMaximum: {
      
      type: 'number',
      title: '最大值(排除自己)',
      'x-type': 'number',
      'x-index': 7
    },
    exclusiveMinimum: {

      type: 'number',
      title: '最小值(排除自己)',
      'x-type': 'number',
      'x-index': 8
    },
    minLength: {
      type: 'number',
      title: '最小长度(包含自己)',
      'x-type': 'number',
      'x-index': 9
    },
    maxLength: {
      type: 'number',
      title: '最大长度(包含自己)',
      'x-type': 'number',
      'x-index': 10
    },
    pattern: {
      type: 'string',
      title: '正则表达式',
      'x-type': 'input',
      'c-colspan': 2,
      'x-index': 11
    },
    
    minItems: {
      type: 'number',
      title: '最小项数量（包含自己）',
      'x-type': 'number',
      'x-index': 12
    },
    maxItems: {
      type: 'number',
      title: '最大项数量（保含自己）',
      'x-type': 'number',
      'x-index': 13
    },
    uniqueItems: {
      type: 'boolean',
      title: '验证是否唯一',
      'x-type': 'switch',
      'x-index': 14
    }
  }
}