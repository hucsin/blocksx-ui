import React from 'react';
import SmartRequest from '../../utils/SmartRequest';
import CleanseSchema from './CleanseSchema'
import PageManger from '../core/SmartPageManger';
import { PageMeta } from '../interface';

export default class SmartPageUtils {
    
    public static requestHelperMap: any = {};
    
    public static getRequestHelper(url: string) {

        if (this.requestHelperMap[url]) {
            return this.requestHelperMap[url]
        }
        
        return this.requestHelperMap[url] = SmartRequest.makeGetRequest(url);
    }

    public static fetchPageSchema (url:string, name: string, props: any = {}, params: any ={}, filter?: Function) {

        return new Promise ((resolve, reject)=> {
            this.getRequestHelper(url)({ page: name,...params}).then((data:any) => {
                let { schema = {}, uiType, path } = data;
                    let trueUiType: string = props.uiType || uiType;
                    let classifyField: any

                    if (filter) {
                        filter(data)
                    }
                    
                    if (PageManger.has(trueUiType)) {
                        let pageMeta: PageMeta = schema.meta || props.pageMeta || {};
    
                        // 清洗fields
                        if (schema.fields) {
                            schema.fields = CleanseSchema.getFieldProps(path, schema.fields);
                        }
                        resolve({
                            schema: schema,
                            value: data.value,
                            uiType: trueUiType,
                            pageMeta: pageMeta,
                            classifyField: classifyField,
                            path,
                            icon: pageMeta.icon,
                            okText: pageMeta.okText,
                            okIcon: pageMeta.okIcon,
                            optional: !!pageMeta.optional,
                            notice: pageMeta.notice
                        })
                        
    
                    } else {
                        reject(`Component type [${trueUiType}] does not exist!`);
                    }
            }).catch(reject)
        })
    }


    public static renderPageType(uiType: string, props: any) {
        let TypeView: any = PageManger.findComponentByType(uiType);
        
        if (TypeView) {
            return (<TypeView {...props} />)
        }
    }
}