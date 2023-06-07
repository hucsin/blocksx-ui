/*
 * @Author: your name
 * @Date: 2021-10-27 08:54:01
 * @LastEditTime: 2021-10-27 10:03:32
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /designer/Users/iceet/work/hucsin/blocksx/packages/design-components/src/utils/datasource.ts
 */

import { Request } from '@blocksx/swap';
import { utils } from '@blocksx/core';


class Datasource {
  getSource(datasource: any, params: any) {
    // 如果是数组直接返回
    if (utils.isArray(datasource)) {
      return new Promise((resolve, reject) => {
        resolve(datasource);
      })
    }

    // 如果datasource是字符串
    if (utils.isString(datasource)) {
      return Request.auto(datasource, params)
    } else {
      
      // 如果是函数
      if (utils.isFunction(datasource)) {
        let source: any  = datasource(params);
        
        if (utils.isArray(source)) {
          return this.getSource(source, params)
        } else {
          if (utils.isPromise(source)) {
            return source;
          }
        }

      } else {

        // TODO 

      }

    }
  }
}


export default new Datasource();