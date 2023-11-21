/*
 * @Descripttion: 验证,简单版本，后面优化
 * @Version: 1.0.0
 * @Author: uoeye
 * @Date: 2020-12-12 10:53:11
 */
import { IFormerValidation } from './typings';
import { utils } from '@blocksx/core';
import i18n from '@blocksx/i18n';

class Validation {
  private regexpCache: any;
  public constructor() {
    this.regexpCache = {};
  }
  public valid(value: any, validation: IFormerValidation, callback: Function, data?: any) {
    let valided: any = '';

    if (validation.required) {
      // 验证必填
      if (!utils.isValidValue(value)) {
        return callback(i18n.t('This field must be filled in'))
      }
    }
    // 简单验证类型
    switch (validation.type) {
      case 'string':
        valided = this.validString(value, validation);
        break;
      case 'array':
        valided = this.validArray(value, validation);
      case 'number':
      case 'integer':
        valided = this.validNumber(value, validation);
        break;
      default:
        break;
    }
    // 验证枚举
    if (!valided && validation.enum && utils.isArray(validation.enum)) {
      if (validation.enum.indexOf(value) > -1) {
        return callback(i18n.t('The field value is not within the allowed range'))
      }
    }
    // 正则
    if (!valided && validation.pattern) {
      valided = this.validRegexp(value, validation);
    }
    // 如果有错，先执行回调
    if (valided) {
      return callback(valided)
    }
    // 验证校验函数
    if (utils.isFunction(validation.validation)) {

      let valid:any = (validation.validation as Function)(value, data)
      
      if (utils.isPromise(valid)) {
        return valid.then((valid: any) => {
          callback(valid ? utils.isString(valid) ? valid : i18n.t('The format of this field is incorrect') : '')
        })
      } else {
        return callback(valid ? utils.isString(valid) ? valid : i18n.t('The format of this field is incorrect')  : '')
      }
    }

    callback();
  }
  private createRegexp(pattern: string) {

    if (this.regexpCache[pattern]) {
      return this.regexpCache[pattern];
    }

    let regstr = pattern;
    let split = 'igm';
    let regmatch = pattern.match(/^\/?(.*)(?:\/([igm]{1,3})?)$/);

    if (regmatch) {
      regstr = regmatch[1];
      if (regmatch[2]) {
        split = regmatch[2];
      }
    }

    return this.regexpCache[pattern] = new RegExp(pattern, split);
  }
  private validRegexp(value: any, validation: IFormerValidation) {
    try {
      let regexp = this.createRegexp(validation.pattern as any);

      if (!(value + '').match(regexp)) {
        return i18n.t('The format of this field is incorrect')
      }

    } catch (e) {
      console.log(e);
      return ''
    }
  }
  private validNumber(value: any, validation: IFormerValidation) {
    if (!utils.isNumeric(value)) {
      return i18n.t('This field must be a valid number');
    }

    // 能不能整除
    if (validation.multipleOf) {
      if (value % validation.multipleOf !== 0) {
        return i18n.t(`The field value must be divisible by {multipleOf}`, {multipleOf:validation.multipleOf});
      }
    }

    let minimum = validation.minimum || 0;
    let maximum = validation.maximum || 1e10;

    if (validation.maximum) {
      if (value < minimum || value > maximum) {
        return i18n.t(`The field value must be between {minimum} and {maximum}`, {
          minimum,
          maximum
        });
      }
    }
  }
  private validArray(value: any, validation: IFormerValidation) {
    if (!utils.isArray(value)) {
      return i18n.t('This field needs to be a valid array')
    }
    let minItems = validation.minItems || 0;
    let maxItems = validation.maxItems || 1e10;

    if (value.length < minItems || value.length > maxItems) {
      return i18n.t(`The array must have {minItems}  to {maxItems} items`, {minItems,maxItems});
    }
  }
  private validString(value: any, validation: IFormerValidation) {
    if (!utils.isString(value)) {
      return i18n.t('This field must be a string')
    }
    let minLength = validation.minLength || 0;
    let maxLength = validation.maxLength || 1e10;
    // 验证字符串长度
    if (value.length < minLength || value.length > maxLength) {
      return i18n.t(`Field length needs to be between {minLength} and {maxLength}`, {minLength, maxLength});
    }
  }
}

export default new Validation()