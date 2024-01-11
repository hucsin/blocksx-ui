/*
 * @Descripttion: 定义 
 * @Version: 1.0.0
 * @Author: uoeye
 * @Date: 2020-09-01 14:52:50
 */
import { ReactNode } from 'react';
import { ValidatorRule } from '@blocksx/validator';



/**
 * 一个case
 * 
 * // 定义 
 * 
 * {
 *     type: "object",
 *     title: "",
 *     properties: {
 *          key1: {
 *               type: "array",
 *               title: "dd",
 *               description: "",
 *               "items": {
 *                  type: "object",
 *               },
 *               value: '',
 *               "x-group": "",
 *               "x-label-hidden": true,
 *               
 *               "x-label-align": "transverse", // portrait 默认值
*               
 *               "x-label-indent": true, 
 *               "x-content-indent": true,
 *               "x-indent": true,
 *              
 *               "x-model-switch": true,
 *               "x-model-collapse": true,
 * 
 *               "x-index": 0,
 *               "x-type": "array",  
 *               "x-type-props": {
 *                  
 *               },
 *               "x-control": [
 *                    {
 *                       "when": [],
 *                       "show": []
 *                    }
 *               ]
 *          },
 *          key1: {
 *              type: 'oneOf',
 *              title: '',
 *              items: [
 *                  {
 *                      type: 'boolean',
 *                      title: '是否启用',
 *                      key: 'x',
 *                      value: false,
 *                      
 *                  },
 *                  {
 *                      type: 'object',
 *                      title: '配置对象',
 *                      key: 'xx',
 *                      properties: {
 *                          
 *                          
 *                      }
 *                      
 *                  },
 *              ]
 *          },
 *          key2: {
 *              
 *          }
 *     }
 *     x-type: "object"
 * }
 * 
 * // 系统
 * 
 */

export interface IFormerBase {
    type: string, // 数据类型
    title?: string, // 数据项名称
    description?: string, // 数据项描述
    tooltip?: string,// 数据项 描述
    defaultValue?: any, // 默认值
    value?:any,
    runtimeValue?: any;
    viewer?: boolean;

    disabled?: boolean,
    path?: any,
    parentPath?: any,

    oneOf?: ReactNode,
    onChangeValue?: Function,
    onGetDependentParameters?: Function;

    // 依赖项
    relyon?: {
      [prop: string]: any
    }

    "x-type"?: string, // 组件类型
    "x-relyon"?: boolean, // 是否启用依赖数据
    "x-type-props"?: { // 组件属性
        [props: string]: any
    }
}
export interface IFormerValidation extends ValidatorRule {
    
    control?: IFormerControl // 控制生效逻辑
}
export interface IFormerControl {
    [index: number]: {
        when: string[],
        show?: string[],
        hide?: string[],
        // 需要支持动态调整部分组件必填非必填的控制
        
        validation?: IFormerValidation | boolean
    }
    forEach: Function;
}

export interface IFormerObjectItem extends IFormerBase {
    value?: any[],
    "x-index"?: number, // 排序
    "x-group"?: string, // 分组
    "x-classify"?: string, // 分类信息
    //"x-half-width"?: boolean, // 是否半宽
    "x-colspan"?: string;
    "x-label-hidden"?: boolean, // 是否显示label区域，对object有效

    "x-label-align"?: string, // label对齐方式 "transverse", portrait 默认值

    "x-label-indent"?: boolean, // label 启用缩进
    "x-content-indent"?: boolean, // content 启用缩进
    "x-indent"?: boolean, // 启用缩进

    "x-model-collapse"?: boolean, // 是否启用折叠
    "x-model-switch"?: boolean, // 该值标识switch展示与否，是否折叠
    "x-model-oneOf"?: boolean,
    "x-validation"?: IFormerValidation,
    "x-control"?: IFormerControl
}

export interface IFormerObject extends IFormerBase {
    type: 'object',
    title?: string,
    value?: any,
    properties: {
        [props: string]: IFormerObjectItem
    }
}

export interface IFormerArray extends IFormerBase {
    type: 'array',
    value?: any[],
    title?: string,
    items: IFormerBase
}

export interface IFormerOneOf extends IFormerBase {
    type: 'oneOf',
    items: IFormerBase[]
}