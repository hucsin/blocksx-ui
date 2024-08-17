import { Request } from '@blocksx/swap';
//import Encode from '@blocksx/encrypt/lib/encode';
import { message } from 'antd';
import { pick } from 'lodash';


class SmartRequest {
    
    private cache: any = {};
    private req: any;

    public constructor() {
        //Request.axios.defaults.headers.common['x-eos-encrypt'] = true;
    }
    private hasCache(key: string) {
        return !!this.cache[key]
    }
    private getCache(key: string) {
        return this.cache[key]
    }
    private getValidParmas(params: any) {
        let value: any = {}
        for (let prop in params) {
            if (typeof params[prop] !== 'undefined') {
                value[prop] = params[prop]
            }
        }
        return value;
    }
    
    private getEncodeWrapper(params: any) {
        let validParams: any = this.getValidParmas(params)
        return JSON.stringify(validParams);
    }
    private getCacheParamsKey(params: any) {
        let keys: string[] = Object.keys(params);

        return keys.sort((a,b )=> a > b ? 1 : -1).map(it => {
            return [it, params[it]].join('-')
        }).join(':')
    }
    public reqcache(req) {
        this.req = req;
    }
    public combineParamsList(paramsList: any) {
        let params: any = {};

        paramsList.forEach(it => {
            for(let prop in it) {
                if (!params[prop]) {
                    params[prop] = it[prop];
                } else {
                    if (!Array.isArray(params[prop])) {
                        params[prop] = [params[prop]]
                    }
                    params[prop].push(it[prop])
                }
            }
        })

        return params;
    }
    /**
     * 创建request请求
     */
    public createPOST(url: string, fields?: any, noCache?: any, call?: Function) {

        if (typeof fields == 'boolean') {
            fields =  null;
            call = noCache;
            noCache = fields;
        }

        return (request: any) => {
            let inputParams: any = Array.isArray(request) ?  this.combineParamsList(request): request;
            let params: any = fields ? pick(inputParams, fields) : inputParams;

            if (!noCache) {
                let cacheKey: string = this.getCacheParamsKey(params);
                if (this.hasCache(cacheKey)) {
                    return new Promise((resolve)=> {
                        let result: any = this.getCache(cacheKey);
                        call && call(inputParams, result);
                        resolve(result)
                    })
                }
            }
            
            if (this.req) {
                return new Promise((resolve) => {
                    resolve(this.req)
                })
            }

            let workernumber: any = 'wf01_02';
            let requestURI: string = '';

            if (url.match(/^\/api/)) {
                workernumber = workernumber.split('_');

                requestURI =`https://${workernumber[0]}.anyhubs.com/${workernumber[1]}${url}`
               // url = `https://wf01.izao.cc/${workernumber[1]}${url}`;
                
            } else {
                requestURI = `https://uc.anyhubs.com${url}`
            }

            return new Promise((resolve, reject) => {
                Request.post(requestURI, this.getEncodeWrapper(params)).then(({code, result}) => {
                    // 正常响应
                    if (code == 200) {
                        call && call(inputParams, result);
                        resolve(result)
                    } else {
                        // 302 跳转
                        if (code == 302) {
                            window.location.href = result.url;
                        }
                    }
                }).catch((e: any,) => {
                    message.error(e.message || e || 'system error');
                    reject(e)
                })
            })
        }
    }

    public createPOSTByMotion(motion: string, path: string, fields?: any, noCache?: any, call?: Function) {
        let truePath: string = motion.indexOf('/') > -1 ? motion : [path, motion].join('/');

        return this.createPOST(truePath, fields, noCache, call)
    }
    public createGET(url: string, noCache?: boolean) {

    }
}

export default new SmartRequest();