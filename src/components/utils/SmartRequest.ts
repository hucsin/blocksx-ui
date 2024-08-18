import { Request } from '@blocksx/swap';
//import Encode from '@blocksx/encrypt/lib/encode';
import { message } from 'antd';
import { pick } from 'lodash';


class SmartRequest {
    

    public constructor() {
        //Request.axios.defaults.headers.common['x-eos-encrypt'] = true;
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
    private forceGetMethod = [
        'list',
        'view',
        'find',
        'all'
    ]
    public isForceGetRequst(path: string) {
        if (path) {
            let splitPath: string[] = path.split('/');
            let method: any = splitPath.pop();

            if (this.forceGetMethod.includes(method) || method.startsWith('find')) {
                return true;
            }
        }
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
    private getRequestParams(request: any, fields?: any) {
        let inputParams: any = Array.isArray(request) ?  this.combineParamsList(request): request;
        return  fields ? pick(inputParams, fields) : inputParams;
    }


    private getUserZone() {
        // TODO 需要修改成从cookie中获取
        return 'wf01_02'.split('_')
    }
    private getRequestURI(url: string) {
        
        if(url.match(/^\/api/)) {
            let zone: string[] = this.getUserZone();
            return `https://${zone[0]}.anyhubs.com/${zone[1]}${url}`
        } else {
            return `https://uc.anyhubs.com${url}`;
        }
    }

    public makePostRequestByMotion(motion: string, path: string, fields?: any) {
        let truePath: string = motion.indexOf('/') > -1 ? motion : [path, motion].join('/');

        return this.isForceGetRequst(truePath) 
            ? this.makeGetRequest(truePath, fields) 
            : this.makePostRequest(truePath, fields)
    }
    /**
     * 创建request请求
     */
    public makePostRequest(url: string, fields?: any) {

        if (this.isForceGetRequst(url)) {
            return this.makeGetRequest(url, fields)
        }

        return (request: any) => {
            let params = this.getRequestParams(request, fields);

            return new Promise((resolve, reject) => {
                Request.post(this.getRequestURI(url), this.getEncodeWrapper(params)).then(({code, result}) => {
                    // 正常响应
                    if (code == 200) {
                       // call && call(inputParams, result);
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


    public makeGetRequest(url: string,  fields?: any) {
        return (request: any) => {
            let params = this.getRequestParams(request, fields);

            return new Promise((resolve, reject) => {
                Request.get(this.getRequestURI(url), this.getValidParmas(params)).then(({code, result}) => {
                    // 正常响应
                    console.log(code, 3333)
                    if (code == 200) {
                       // call && call(inputParams, result);
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
}

export default new SmartRequest();