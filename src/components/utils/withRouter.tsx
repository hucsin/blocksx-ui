import React from 'react';
import { useNavigate,NavigateFunction,Location, useParams, useLocation } from "react-router-dom"




export interface routerParams {
    utils: RouterUtils,
    naviagte: NavigateFunction,
    params: any;
    history?: any;
    query: any;
    location: Location,
    routerKey: string
}

let routerData: routerParams = {} as routerParams;


class RouterUtils {
    private router: any;
    private history: any;
    public constructor(router: any) {
        this.router = router;
    }
    public createPath(path: string, data: any) {
        return path.replace(/\:([0-9a-z]+)/ig, (_, $1)  => {
            return data[$1] || ''
        })
    }
    public getQueryString(query?: any) {
        let queryString: string[] = [];
        if( query) {
            if (typeof query == 'string') {
                queryString.push(query);
            } else {
                for(let p in query) {
                    if (query[p]) {
                        queryString.push([p, encodeURIComponent(query[p])].join('='))
                    }
                }
            }
        }

        return queryString.join('&')
    }
    public go(path:string, query?: any) {
        let querystring: string = this.getQueryString(query);
        Object.assign(this.router.query, query);
        this.router.naviagte([path, querystring].filter(Boolean).join(path.indexOf('?')>-1 ? '&' : '?'))
    }
    public goPath(path:string, params?: any) {
        Object.assign(this.router.params, params);
        this.router.naviagte(this.createPath(path, params))
    
    }
    public getHistory() {
        console.log(this.history)
    }
    public goQuery(query?: any) {
        Object.assign(this.router.query, query);
        
        this.go(this.router.location.pathname, {
            ...this.router.query,
            ...query
        })
    }
    public getQueryMap(search:string) {
        let queryMap: any = {};
        let map: any = search.replace(/^\?/, '').split('&');

        map.forEach(it => {
            let itMatch: any = it.split('=');
            
            if (itMatch && itMatch.length == 2) {
                queryMap[itMatch[0]] = decodeURIComponent(itMatch[1])
            }
        })
        return queryMap
    }
} 
export default function withRouter(WrapperComponent: any) {
    
    let defaultProps: any = WrapperComponent.defaultProps;
    const AcB: any = function (props = {}) {
        
        const naviagte = useNavigate();

        const params = useParams();
        let trueProps: any = Object.assign({}, props);

        
        const location = useLocation();
        routerData.utils = new RouterUtils(routerData);
        window['RouterUtils'] = routerData.utils;
        routerData.naviagte = naviagte;
        routerData.params = params || {};
        routerData.location = location;
        routerData.query = routerData.utils.getQueryMap(location.search)
        routerData.routerKey = location.pathname + location.search;
        


        for (let pr in defaultProps) {
            if (typeof trueProps[pr] == 'undefined') {
                trueProps[pr] = defaultProps[pr];
            }
        }

        return <WrapperComponent {...trueProps} router={routerData} />
    }
    //  hooks static 
    
    for (let prop in WrapperComponent) {
        
        if (prop !== 'defaultProps') {
            AcB[prop] = WrapperComponent[prop]
        }
    }

    return AcB;
}