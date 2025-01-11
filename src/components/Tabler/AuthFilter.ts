/*
 * @Descripttion: 
 * @Version: 1.0.0
 * @Author: uoeye
 * @Date: 2020-12-15 15:20:29
 */
import { RowOperate, RowOperateControl } from './typings';
import { utils } from '@blocksx/core';

export default class AuthFilter {
    private tabler: any;
    public constructor(tabler: any) {
        this.tabler = tabler;
    }
    private matchValue (data: any, item: any): boolean {
        let { key, value, reverse = false } = item;
        let _value = data[key];
        if (!utils.isUndefined(value)) {
            if (utils.isArray(value)) {
                return (value.includes(_value) === !reverse);
            } else {
                return (value === _value) === !reverse;
            }
        }
        
        return (!!_value) === !reverse;
    }
    public filterAuth (listItem:RowOperate, rowData: any) {
        
        if (listItem && listItem.control) {
            let control:any = utils.isArray(listItem.control) ? listItem.control : [listItem.control];
            let { props, state } = this.tabler;

            return !control.some((it:RowOperateControl) => {
                
                // 不满足的时候返回
                switch(it.type) {
                    case 'state':
                        return !this.matchValue(state, it);
                    case 'auth':
                        let auth:any = props.auth || {};
                        if (!utils.isObject(auth[it.key])) {
                            return this.matchValue(auth, {
                                ...it,
                                value: false
                            });
                        } else {
                            it = auth[it.key];
                        }
                    case 'rowValue':
                    default:
                        return !this.matchValue(rowData || {}, it)
                }
            })
        }
        return true;
    }
}
