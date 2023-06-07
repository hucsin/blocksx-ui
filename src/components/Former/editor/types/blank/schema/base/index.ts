import validationSchema from './validation';
import controlSchema from './rely';

import { utils } from '@blocksx/core';

const schema: any = {
  type: 'object',
  properties: {
    
    defaultValue: {
      type: 'string',
      title: '默认值',
      'x-type': 'input',
      'x-index': 3,
      'x-type-props': {
        placeholder: '输入默认值'
      }
    },
    'x-type': {
      type: 'string',
      title: '组件类型',
      'x-type': 'select',
      'x-index': 2
    },
    'x-type-props': {
      type: 'object',
      title: '组件属性',
      'x-type': 'map',
      'x-colspan': 2,
      'x-index': 4,
      'x-model-switch': false,

      properties: {
        key: {
            type: 'string',
            'x-type': 'input',
            'x-type-props': {
              placeholder: '属性键名'
            }
        },
        value: {
            type: 'string',
            'x-type': 'input',
            'x-type-props': {
              placeholder: '属性键值'
            }
        }
      }
    },
    'x-classify': {
      type: 'string',
      title: '分类',
      'x-type': 'select',
      'x-index': 5,
      
      'x-group': '高级设置'
    },
    'x-group': {
      type: 'string',
      title: '分组',
      'x-type': 'select',
      'x-index': 6,
      'x-group': '高级设置'
    },
    'x-label-hidden': {
      type: 'boolean',
      title: 'label隐藏',
      'x-type': 'switch',
      'x-group': '高级设置',

      'x-index': 7,
      defaultValue: false,
    },
    'x-label-indent': {
      type: 'boolean',
      title: 'label缩进',
      'x-type': 'switch',

      'x-index': 8,
      'x-group': '高级设置',
      defaultValue: false,
    },
    'x-content-indent': {
      type: 'boolean',
      title: '内容缩进',
      'x-type': 'switch',

      'x-index': 9,
      'x-group': '高级设置',
      defaultValue: false,
    },
    'x-model-collapse': {
      type: 'boolean',
      title: '内容折叠',
      'x-type': 'switch',
      'x-index': 10,
      'x-group': '高级设置',

      'x-model-switch': false,
      
      defaultValue: false,
    },
    'x-model-switch': {
      type: 'boolean',
      title: '启用多态',
      'x-type': 'switch',
      'x-index': 10,
      'x-group': '高级设置',
      description: '让属性配置支持有无的模型配置',
      'x-model-switch': false,
      defaultValue: false,
    },
    description: {
      type: 'string',
      title: '描述提示',
      'x-type': 'input',
      'x-index': 12,

      'x-group': '高级设置',
      'x-colspan': 2,
      'x-model-switch': false,
      'x-type-props': {
        placeholder: '请输入该字段的描述信息'
      }
    },
    'x-validation': {
      type: 'value',
      title: '验证内容',
      'x-type': 'more',
      'x-index': 11,
      'x-group': '高级设置',
      'x-model-switch': false,
      'x-type-props': {
        icon: 'Validation',
        text: '设置',
        colspan: 1,
        title: '编辑验证对象',
        schema: validationSchema
      }
    },
    'x-control': {
      type: 'value',
      title: '控制逻辑',
      'x-type': 'more',
      'x-index': 11,
      'x-group': '高级设置',
      'x-model-switch': false,
      'x-type-props': {
        icon: 'Control',
        text: '设置',
        colspan: 1,
        title: '编辑控制逻辑',
        schema: controlSchema
      }
    }
  }
}

export default {
  getSchema() {
    return utils.copy(schema);
  }
}