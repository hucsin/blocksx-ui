/*
 * @Author: your name
 * @Date: 2022-03-01 10:56:58
 * @LastEditTime: 2022-03-01 11:33:28
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: /packages/design-components/src/former/editor/types/blank/schema/rely.ts
 */
export default {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      when: {
        type: 'array',
        title: '条件值',
        description: "当字段满足条件的时候执行后续的显示&隐藏",
        'x-index':1,
        items: {
          type: 'string',
          'x-type': 'input',
          'x-type-props': {
            placeholder: '请输入条件值'
          }
        }
      },
      show: {
        type: 'array',
        title: '显示节点（条件满足才显示）',
        'x-index':2,
        description: "当满足条件值的时候执行显示逻辑",
        items: {
          type: 'string',
          'x-type': 'input',
          'x-type-props': {
            placeholder: '请输入节点keypath路径'
          }
        }
      },
      hide: {
        type: 'array',
        title: '隐藏节点（条件满足才隐藏）',
        description: "当满足条件值的时候执行隐藏逻辑",
        'x-model-switch': true,
        'x-index':3,
        items: {
          type: 'string',
          'x-type': 'input',
          'x-type-props': {
            placeholder: '请输入节点keypath路径'
          }
        }
      }
    }
  }
}