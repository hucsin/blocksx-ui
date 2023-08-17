import Plugin from '../Plugin';
import { keypath, utils } from '@blocksx/core';

type NamespaceType = string | string[];

class PluginManager {
    public cache: any;
    public cacheData: any;
    public map: any;
    public constructor() {
        this.cache = {};
        this.cacheData = {};

        this.map = {};
    }
    private isValidNamespace(namespace: string) {
        return utils.isString(namespace) && namespace.split('.').length <= 3
    }
    /**
     * 
     * @param namespace 
     */
    public has(namespace: NamespaceType) {
        return !!this.cache[this.toCaseInsensitive(namespace)]
    }
    /**
     * 
     * @param namespace eg. resource.layout.icon
     * @param plugin 
     */
    public register(namespace: NamespaceType, plugin: Plugin) {
        namespace = this.toCaseInsensitive(namespace);

        if (!this.isValidNamespace(namespace)) {
            return console.error('The plugin namespace only supports up to 3 levels. eg. a.b.c, a.b, a')
        }

        if (this.has(namespace)) {
            
            let value:any = this.find(namespace);
            let item: any = utils.isArray(value) ? value : [value];
            this.cache[namespace] ++;

            item.push(plugin);
            keypath.setDataByKeypath(this.map, namespace, {
                $$value: item
            });

        } else {
            keypath.setDataByKeypath(this.map, namespace, {
                $$value: plugin
            });
            this.cache[namespace] = 1;
        } 

        this.cacheData[namespace]  = 0;
    }
    /**
     * 数据管道,调用命名空间内所有的插件的pipeline方法,如果有
     * @param namespace 
     * @param value 
     * @param context 
     */
    public pipeline(namespace:NamespaceType, value: any, context?: any) {
        
        this.walk(namespace, (plugin: any) => {

            if (plugin && plugin.hasPipeLine()) {
                let retv: any = plugin.pipeline(value, context);
                // 插件可以修改原值,也可以不修改
                if (retv) {
                    value = retv
                }
            }
        });

        return value;
    }

    /**
     * 获取 菜单
     * @param namespace 
     */
    public getContextMenu(namespace: NamespaceType) {
        let menu: any[] = [];
        this.walk(namespace, (plugin: any) => {
            if (plugin.hasContextMenu()) {
                // 显示指定分组
                if (menu.length>0) {
                    menu.push(null)
                }
                menu = menu.concat(plugin.contextMenu)
            }
        })
        return menu;
    }
    /**
     * 通过widgetName获取widget
     * 
     * @param namespace 
     * @param widgetName 
     * @returns 
     */
    public getWidgetByName(namespace: NamespaceType, widgetName: string) {
        let widgets: any[] = [];
        this.walk(namespace, (plugin: any) => {
            if (plugin.hasWidget(widgetName)) {
                // 显示指定分组
                if (widgets.length>0) {
                    widgets.push(null)
                }
                widgets = widgets.concat(plugin.findWidget(widgetName))
            }
        })
        return widgets;
    }

    /**
     * 通过方向获取widget
     * @param namespace 
     * @param direction 
     * @returns 
     */
    public getWidgetByDirection(namespace: NamespaceType, direction: string[]) {
        let widgets: any[] = [];
        this.walk(namespace, (plugin: any) => {
            let allWidgets: any[] = plugin.getAllWidget();
            let match: any = [];

            allWidgets.forEach(it=> {
                if (direction.indexOf(it.direction) > -1) {
                    match.push(it);
                }
            });

            if (widgets.length > 0 && match.length > 0) {
                widgets.push(null)
            }

            if (match) {
                widgets = widgets.concat(match)
            }
        });
        return widgets;
    }

    /**
     * 遍历插件
     * @param namespace 
     * @param fn 
     */
    public walk(namespace: NamespaceType, fn: Function) {
        let pipePlugins: any[] = this.find(namespace);
        
        if (pipePlugins) {
            if (utils.isArray(pipePlugins)) {
                pipePlugins.forEach((it) => {
                    fn(it);
                });
            } else if (utils.isPlainObject(pipePlugins)) {
                for ( let pkey in pipePlugins) {
                    fn(pipePlugins[pkey])
                }
            } else {
                fn(pipePlugins);
            }
        }
    }

    /**
     * 
     * @param namespace 
     * @returns 
     */
    public get(namespace:NamespaceType) {
        namespace = this.toCaseInsensitive(namespace);

        if (this.has(namespace)) {
            return keypath.getDataByKeypath(this.map, namespace).$$value;
        }
    }

    /**
     * 
     * @param namespace 
     * @returns 
     */
    public find(namespace: NamespaceType) {
        namespace = this.toCaseInsensitive(namespace);
        
        if (this.cacheData[namespace]) {
            return  this.cacheData[namespace];
        }

        // 只支持两级命名空间获取插件,
        if (this.isValidNamespace(namespace) && namespace.split('.').length > 1) {
            if (this.has(namespace)) {
                return  this.cacheData[namespace] = keypath.getDataByKeypath(this.map, namespace).$$value;
            // 
            } else {

                let targetSplit: any = namespace.split('.');

                if (targetSplit.length == 2) {
                    // 如果我set 的时候是 a.b.c = 1, a.b.d = 1;
                    // 那么我get a.b 的时候需要返回 {c:1,d:1}
                    let result: any = {};
                    for(let prop in this.cache) {
                        let sourceSplit: any = prop.split('.');
                        if (this.matchLevel2Namespace(targetSplit, sourceSplit)) {
                            result[sourceSplit[2]] = this.find(prop);
                        }
                    }

                    return  this.cacheData[namespace] = result;
                }
            }
        } else {
            console.error('Only plugins with level 2 or level 3 namespaces can be found. eg. a.b a.b.c')
        }
    }
    private matchLevel2Namespace(targetSplit: string[], sourceSplit: string[]) {
        return (targetSplit[0] === sourceSplit[0]) && (targetSplit[1] === sourceSplit[1])
    }
    private toCaseInsensitive(namespace:NamespaceType) {

        if (Array.isArray(namespace)) {
            namespace = namespace.join('.');
        }

        return namespace.toUpperCase();
    }
}

export default new PluginManager();