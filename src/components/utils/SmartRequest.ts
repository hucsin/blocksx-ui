import { Request } from '@blocksx/swap';
import { utils } from '@blocksx/core';
import { Encode, Decode} from '@blocksx/encrypt';
import Session  from '../core/Session';
import { message as MessageFor } from 'antd';



class SmartRequest {
    
    public globalParams:any;
    
    public constructor() {
        //Request.axios.defaults.headers.common['x-eos-encrypt'] = true;
        this.globalParams = {};
    }
    private getValidParmas(params: any) {
        let value: any = {}
        for (let prop in params) {
            if (typeof params[prop] !== 'undefined') {
                value[prop] = params[prop]
            }
        }

        Object.keys(this.globalParams).forEach(it => {
            value[it] = this.globalParams[it]
        })

        return value;
    }
    
    private getEncodeWrapper(params: any) {
        let validParams: any = this.getValidParmas(params)
        
        return JSON.stringify(validParams);
    }
    private forceGetMethod = [
        'list',
        'dict',
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
        return  fields ? utils.pick(inputParams, fields) : inputParams;
    }


    private getUserZone() {
        
        if (Session.hasLogin()) {
            let { zone } = Session.getUserInfo();
            return zone.split('_')
        } else {
            // 跳转到登陆页
            if (!utils.isMobileDevice()) {
                window.location.href= "/login"
            }
        }
    }
    public getRequestURI(url: string) {

        let host: string = location.hostname.replace(/^(www|console)\./,'');


        if (url.match(/^https:\/\//)) {
            return url;
        } else {
            if(url.match(/^\/api/)) {
                let zone: string[] = this.getUserZone();
                return `https://${zone[0]}.${host}/${zone[1]}${url}`
            } else {
                return `https://uc.${host}${url}`;
            }
        }
    }

    public makePostRequestByMotion(motion: string, path: string, fields?: any) {
        let truePath: string = motion.indexOf('/') > -1 ? motion : [path, motion].join('/');

        return this.isForceGetRequst(truePath) 
            ? this.makeGetRequest(truePath, fields) 
            : this.makePostRequest(truePath, fields)
    }
    public dealHeader(response: any, match?:any) {
        if (response && response.headers) {
            let contentType: string = response.headers['content-type'];
            if (contentType) {
                // token
                if (match = contentType.match(/;tn\/([^;]+)/)) {
                    localStorage.setItem('__token', match[1])
                }

                // zone
                if (match =  contentType.match(/;ze\/([^;]+)/)) {
                    localStorage.setItem('__zone', match[1])
                }
            }
        }
    }
    public setGlobalParmas(key:string, value: string) {
        this.globalParams[key] = value;
    }
    /**
     * 创建request请求
     */
    public getHeaders() {
       
        return {
            'Accept': 'application/json, text/plain, */*',
        }
    }
    public makePostRequest(url: string, fields?: any) {

        if (this.isForceGetRequst(url)) {
            return this.makeGetRequest(url, fields)
        }

        return (request: any) => {
            let params = this.getRequestParams(request, fields);

            return new Promise((resolve, reject) => {

                Request.post(this.getRequestURI(url)
                    , this.getEncodeWrapper(params)
                    , this.getHeaders()
                    , this.dealHeader
                ).then(({code, message, result}) => {

                    // 正常响应
                    if (code == 200) {
                       // call && call(inputParams, result);
                        resolve(result)
                    } else {
                        // 302 跳转
                        if (!utils.isMobileDevice()) {
                            if (code == 302) {
                                window.location.href = result.url;
                            } else if (code == 401) {
                                window.location.href= '/login'
                            } else {
                                if (message) {
                                    MessageFor.error(message)
                                }
                                reject(message)
                            }
                        } else {
                            reject(message)
                        }
                    }
                }).catch((e: any,) => {
                    let message: string = this.getTrueMessage(e.message || e || 'system error');
                    MessageFor.error(message);
                    reject(message)
                })
            })
        }
    }

    public getTrueMessage(message: any) {

        if (utils.isPlainObject(message)) {
            return message.message || message.error_description ;
        }
        return String(message);
    }

    public makeGetRequest(url: string,  fields?: any) {
        return (request: any) => {
            let params = this.getRequestParams(request, fields);
            let query: any = this.getValidParmas(params);
            console.log(request, params, 23333)

            return new Promise((resolve, reject) => {
                Request.get(this.getRequestURI(url)
                // @ts-ignore
                    , (location as any).href.match(/__debug__/ig) ?{...query, __debug__: true } : {
                        _: Encode.encode(JSON.stringify(query))
                    }
                    , this.getHeaders() 
                    , this.dealHeader
                ).then(({code, message, result}) => {
                    
                    // 正常响应
                    if (code == 200) {
                        resolve(result)
                    } else {
                        // 302 跳转
                        if (!utils.isMobileDevice()) {
                            if (code == 302) {
                                window.location.href = result.url;
                            }  else if (code == 401) {
                                window.location.href= '/login'
                            } else {
                                if (message) {
                                    MessageFor.error(message)
                                }
                                reject(message)
                            }
                        } else {
                            reject(message)
                        }
                    }
                }).catch((e: any,) => {
                    let message: string = this.getTrueMessage(e.message || e || 'system error');
                    !utils.isMobileDevice() &&  MessageFor.error(message);
                    reject(message)
                })
            })
        }
    }



    public createAutoEnumsRequest(autoEnums: any, defaultParams?: any) {

        let helper: any = this.makeGetRequest(autoEnums.type == 'findPanelView' ? '/api/thinking/findPanelView' : autoEnums.request);
                
        return (params: any) => {
            return helper({
                ...autoEnums.params,
                ...params,
                view: autoEnums.view,
                ...(defaultParams && (typeof defaultParams == 'function' ? defaultParams() : defaultParams))
            }).then((res: any) => {
                
                let response: any  = Array.isArray(res) ? res : Array.isArray(res.data) ? res.data : [];

                return response.map((it: any) => {
                    return {
                        label: it[autoEnums.selectNameKey || autoEnums.labelKey] + (autoEnums.valueLabel ? `(${it[autoEnums.selectKey || autoEnums.valueKey]})` : ''),
                        value: it[autoEnums.selectKey || autoEnums.valueKey]
                    }
                });
            })
        };
    }
}

export default new SmartRequest();