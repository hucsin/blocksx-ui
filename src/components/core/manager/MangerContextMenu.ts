import { utils } from '@blocksx/core';

export interface MenuItemPayload {
    [key:string]: any
}
export interface MenuItem {
    type?: string;
    key: string,
    label?: string,
    icon?: string,
    action?: Function | string,
    control?: any;
    payload?: MenuItemPayload
}
export interface MenuActionMap {
    [action: string]: Function
}
class EditorContextMenuManger {
    private contextMenu: any;
    private cache: any;
    private actionMap: any;

    public constructor() {
        this.contextMenu = {};
        this.actionMap = {};
        this.cache = {};
    }

    public has(namespace: string) {
        return !!this.contextMenu[namespace]
    }

    public doAction(context: any, namespace: string, key: string, playload: any) {
        
        if (this.hasCacheKey(namespace, key)) {
            let menuItem: MenuItem = this.cache[this.getCacheKey(namespace,key)];
            
            if (utils.isFunction(menuItem.action)) {
                //@ts-ignore
                menuItem.action(context, menuItem, playload)
            } else {
                // 字符串的场景
                if (utils.isString(menuItem.action)) {
                    if (utils.isFunction(this.actionMap[menuItem.action as string])) {
                        this.actionMap[menuItem.action as string](context, menuItem, playload)
                    }   
                }
            }
        }
    }

    public registorAction(name: string, action: Function) {
        this.actionMap[name] = action;
    }

    public find(namespace: string) {

        return this.contextMenu[namespace];
    }
    public filter(menu: any,  namespace: any, payload?: any) {

        if (utils.isString(menu)) {
            payload = namespace;
            namespace = menu;
            menu = null;
        }

        let menus: any = menu || this.find(namespace) || [];
        return menus.filter((it: MenuItem ) => {
            
            if (it.control && payload) {
                return this.match(it.control, payload)
            }
            return true;
        })
    }
    public findContextMenu(namespace: string, key?: string) {
        let menu: any = this.find(namespace) || [];

        menu = utils.isString(key)  ? menu.filter((item: MenuItem) => {
            return item.key.indexOf(key as string) == 0;
        }) : menu;

        return menu.map(it => {
            return {
                ...it,
                namespace: namespace
            }
        })
    }
    private match(control:any, payload: any) {
        /**
         * 支持control函数,和control对象
         */
        if (utils.isFunction(control)) {

            return control(payload)

        } else {
            for(let p in payload) {
                if (utils.isArray(control[p])) {
                    if (control[p].indexOf(payload[p]) > -1) {
                        return true;
                    }
                } else {
                    if (control[p] == payload[p]) {
                        return true;
                    }
                }
            }
        }
    }

    // 只支持两级菜单
    public registorMenu(namespace: string, menu:MenuItem[]) {

        if (!this.has(namespace)) {
            this.contextMenu[namespace] = [];
        }

        menu.forEach((item: any) => {

            if (this.isValid(item)) {
                //有子菜单,
                if (this.hasSubmenu(item.key)) {

                    let [parent, _]  = item.key.split('.');
                    // 没有parent缓存就忽略
                    // 必须保证父级菜单先写入
                    if (this.hasCacheKey(namespace, parent)) {
                        let parentKey: string = this.getCacheKey(namespace, parent);

                        if (!this.cache[parentKey].children) {
                            this.cache[parentKey].children = [];
                        }

                        this.cache[parentKey].children.push(
                            this.cache[this.getCacheKey(namespace, item.key)] = {
                                ...item,
                                namespace: namespace
                            }
                        )
                    }
                } else {

                    this.contextMenu[namespace].push(this.cache[this.getCacheKey(namespace,item.key)] = {
                        namespace: namespace,
                        ...item
                    })
                }
            }
        })
    }
    private hasCacheKey(namespace: string, key: string) {
        return this.cache[this.getCacheKey(namespace, key)]
    }
    private getCacheKey(namespace: string, key: string) {
        return [namespace, key].join('.')
    }
    private isValid(menu: MenuItem) {
        return utils.isString(menu.key) 
          //  && utils.isString(menu.name);
    }
    private hasSubmenu(key: string) {
        return key.split('.').length == 2;
    }
}

export default new EditorContextMenuManger();