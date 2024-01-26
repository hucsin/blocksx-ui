import { Request } from '@blocksx/swap';
//import Encode from '@blocksx/encrypt/lib/encode';
import { message } from 'antd';
import { pick } from 'lodash';

class SmartRequest {
    
    private cache: any = {};
    private req: any;

    public constructor() {
        Request.axios.defaults.headers.common['x-eos-encrypt'] = true;
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
        return validParams;
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

            let params: any = fields ? pick(request, fields) : request;

            if (!noCache) {
                let cacheKey: string = this.getCacheParamsKey(params);
                if (this.hasCache(cacheKey)) {
                    return new Promise((resolve)=> {
                        let result: any = this.getCache(cacheKey);
                        call && call(request, result);
                        resolve(result)
                    })
                }
            }
            
            if (this.req) {
                return new Promise((resolve) => {
                    resolve(this.req)
                })
            }

            return new Promise((resolve, reject) => {
                Request.post(url, this.getEncodeWrapper(params)).then((result: any) => {
                    call && call(request, result);
                    resolve(result)
                }).catch((e) => {
                    console.log(e)
                    message.error(e.message || e || 'system error');
                    reject()
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