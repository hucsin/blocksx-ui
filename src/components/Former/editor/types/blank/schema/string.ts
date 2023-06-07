/*
 * @Author: your name
 * @Date: 2022-02-25 11:04:08
 * @LastEditTime: 2022-03-01 20:17:09
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: /packages/design-components/src/former/editor/types/blank/schema/string.ts
 */
import BaseSchema from './base/index';

const stringSchema: any = BaseSchema.getSchema();

Object.assign(stringSchema.properties, {
  defaultValue: {
    type: 'string',
    title: '默认值',
    'x-type': 'input',
    'x-index': 3,
    'x-type-props': {
      placeholder: '输入默认值'
    }
  },
})

export default stringSchema