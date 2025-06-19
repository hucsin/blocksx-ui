import { Request } from '@blocksx/swap';
import { utils } from '@blocksx/core';
import { Encode, Decode} from '@blocksx/encrypt';
import Session  from '../core/Session';
import { notification, message as MessageFor } from 'antd';



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
               // window.location.href= "/login?nozone=1"
            }
        }
    }
    public getRequestURI(url: string) {

        let host: string = location.hostname.replace(/^(www|console|dev_www|dev_console)\./,'');
        let devPrex: string = location.hostname.includes('dev_') ? 'dev_' : '';

        if (url.match(/^https:\/\//)) {
            return url;
        } else {
            if(url.match(/^\/api/)) {
                let zone: string[] = this.getUserZone();
                return `https://${devPrex}${zone[0]}.${host}/${zone[1]}${url}`
            } else {
                return `https://${devPrex}uc.${host}${url}`;
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
                ).then(({code, message,title, result}) => {
                    Session.resetSession();
                    // 正常响应
                    if (code == 200) {
                       // call && call(inputParams, result);
                        resolve(result)
                    } else {
                        // 302 跳转
                        if (!utils.isMobileDevice()) {
                            if (code == 302) {
                               return window.location.href = result.url;
                            } else if (code == 401) {
                               return window.location.href= '/login'
                            }
                        } 
                        
                        this.dealErrorMessage({
                            code,
                            message,
                            title
                        }, reject)
                    }
                }).catch((e: any,) => {
                    
                    this.dealErrorMessage({
                        code: 500,
                        message: this.getTrueMessage(e.message || e || 'system error')
                    }, reject)
                })
            })
        }
    }

    private dealErrorMessage(e: any, reject) {
       if ([401,402].includes(e.code)) {
            notification.info({
                description: e.message,
                message: e.title
            })
            reject('')
       } else {
            !utils.isMobileDevice() && MessageFor.error(e.message);
            reject(e.message)
       }   
    } 

    public getTrueMessage(message: any) {

        if (utils.isPlainObject(message)) {
            message =  message.message || message.error_description || message.error || message.errorMessage;
        }

        message = String(message);

        // D1_ERROR: UNIQUE constraint failed: Thinking.tenantID, Thinking.title: SQLITE_CONSTRAINT

        // 特殊处理D1 错误
        if (message.includes('D1_ERROR')) {
            console.log(message)

            if (message.includes('UNIQUE constraint')) {
                // UNIUE 错误
                let match : any = message.match(/failed\:\s*([a-z0-9A-Z\.\s\,]+)\:/);
                if (match && match[1]) {
                    let unique: any = match[1].split(/\s*,\s*/).map(it => {
                        let val: any = it.split('.');
                        return val[1]
                    }).filter(it => it !=='tenantID')

                    if (unique.length) {
                        message = `The field ${unique.join(',')} must be unique. Please modify and try again.`
                    }
                    
                }
            }

        }


        return message;
    }

    public makeGetRequest(url: string,  fields?: any) {
        return (request: any) => {
            let params = this.getRequestParams(request, fields);
            let query: any = this.getValidParmas(params);
            

            return new Promise((resolve, reject) => {
                Request.get(this.getRequestURI(url)
                // @ts-ignore
                    , (location as any).href.match(/__debug__/ig) ?{...query, __debug__: true } : {
                        _: Encode.encode(JSON.stringify(query))
                    }
                    , this.getHeaders() 
                    , this.dealHeader
                ).then(({code, message, title, result}) => {
                    Session.resetSession();
                    // 正常响应
                    if (code == 200) {
                        resolve(result)
                    } else {
                        // 302 跳转
                        if (!utils.isMobileDevice()) {
                            if (code == 302) {
                                return window.location.href = result.url;
                            }  else if (code == 401) {
                                return window.location.href= '/login'
                            }
                        }

                        this.dealErrorMessage({
                            code,
                            message,
                            title
                        }, reject)
                    }
                }).catch((e: any,) => {

                    this.dealErrorMessage({
                        code: 500,
                        message: this.getTrueMessage(e.message || e || 'system error')
                    }, reject)
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