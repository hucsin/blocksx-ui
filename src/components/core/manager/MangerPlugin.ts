import { keypath, utils } from '@blocksx/core';
import { ContextMenuItem } from '@blocksx/ui'
import EditorContextMenuManger from './MangerContextMenu';

import WidgetUtils from './WidgetUtils';

type NamespaceType = string | string[];

class PluginManager {

    public pluginMap: any;
    public mountMap: any;
    public constructor() {
        this.pluginMap = {};
        this.mountMap = {}
    }
    private isValidNamespace(namespace: string) {
        return utils.isString(namespace) && namespace.split('.').length <= 3
    }
    /**
     * 
     * @param namespace 
     */
    public has(namespace: NamespaceType) {
        return !!this.pluginMap[this.toCaseInsensitive(namespace)]
    }

    /**
     * 挂载组件
     * @param namespace 
     * @param context 
     */
    public mount(namespace: NamespaceType, context: any) {
        let nameid: string = this.getNamespaceId(namespace);
        let truenamespace: string = this.toCaseInsensitive(namespace);
        let plugins: any = this.find(truenamespace);
        
        if (plugins) {
            plugins.forEach(({name, plugins})  => {
                if (!this.mountMap[name]) {
                    this.mountMap[name] = {}
                }
                this.mountMap[name][nameid] = plugins.map(Plugin => new Plugin(namespace, context));
            })
        }
    }
    // 加载
    public loadon(namespace: NamespaceType) {

        let mountPlugin: any[] = this.findMount(namespace);

        return mountPlugin.forEach(plugin => {
            if (utils.isFunction(plugin.didMount)) {
                plugin.didMount()
            }
        })
    }

    public findMount(namespace: NamespaceType) {

        let nameid: string = this.getNamespaceId(namespace);
        let truenamespace: string = this.toCaseInsensitive(namespace);
        let loadplugin: any[] = Object.keys(this.mountMap);

        return loadplugin.filter(plugin => {
            if (plugin.indexOf(truenamespace) == 0) {
                if(this.mountMap[plugin][nameid]) {
                    return true;
                }
            }
        }).map(it=> {
            return this.mountMap[it][nameid]
        }).flat()
    }

    /**
     * 取消挂载
     * @param namespace 
     */
    public unmount(namespace: NamespaceType) {
        this.walk(namespace, (plugin:any) => {
            plugin.destory && plugin.destory();
        })
    }

    /**
     * 
     * @param namespace eg. resource.layout.icon
     * @param plugin 
     */
    public register(namespace: NamespaceType, plugin: any) {
        namespace = this.toCaseInsensitive(namespace);

        if (!this.isValidNamespace(namespace)) {
            return console.error('The plugin namespace only supports up to 3 levels. eg. a.b.c, a.b, a')
        }

        if (this.has(namespace)) {
            this.pluginMap[namespace].push(plugin);

        } else {
            this.pluginMap[namespace] = [plugin];
        }
        

       
        this.registerPluginWidgetContextMenu(namespace, plugin);
    }

    public registerPluginWidgetContextMenu(namespace: string, plugin: any) {
        if (!plugin.$$contextmenu) {
            // 写入contextMenuMap 
            if (utils.isPlainObject(plugin.contextMenuMap)) {
                for (let name in plugin.contextMenuMap) {
                    this.registerContextMenu(name, plugin.contextMenuMap[name])
                }
            } else {
                if (utils.isArray(plugin.contextMenuMap)) {
                    this.registerContextMenu(namespace, plugin.contextMenuMap)
                }
            }
            plugin.$$contextmenu =  true;
        }
    }
    /**
     * 数据管道,调用命名空间内所有的插件的pipeline方法,如果有
     * @param namespace 
     * @param value 
     * @param context 
     */
    public pipeline(namespace:NamespaceType, value: any, context?: any) {
        
        this.walk(namespace, (plugin: any) => {

            if (plugin &&  plugin.hasPipeLine()) {
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
    public getContextMenu(namespace: NamespaceType, playload?: any) {
        return EditorContextMenuManger.filter(this.toCaseInsensitive(namespace, true), playload)
    }
    public registerContextMenu(namespace: NamespaceType,  menu:ContextMenuItem[]) {
        return EditorContextMenuManger.registorMenu(this.toCaseInsensitive(namespace, true), menu);
    }
    public doContextMenuAction(context: any, namespace: NamespaceType, type: string, playload: any) {
        return EditorContextMenuManger.doAction(context, this.toCaseInsensitive(namespace), type, playload);
    }
    public registorContextMenuAction(name: string, action: Function) {
        return EditorContextMenuManger.registorAction(name, action);
    }
    public findContextMenu(namespace: NamespaceType, key?: string) {
        return EditorContextMenuManger.findContextMenu(this.toCaseInsensitive(namespace), key);
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
    public getWidgetByDirection(namespace: NamespaceType, type: string, direction: string[]) {
        let widgets: any[] = [];
        this.walk(namespace, (plugin: any) => {
            
            let allWidgets: any[] = plugin.findWidget(type);
            let match: any = [];

            allWidgets && allWidgets.forEach(it=> {
                if (direction.indexOf(it.direction) > -1) {
                    match.push({
                        widget: it,
                        plugin: plugin
                    });
                }
            });

            if (widgets.length > 0 && match.length > 0) {
                widgets.push(null)
            }

            if (match.length) {
                widgets = widgets.concat(match)
            }
        });
        return widgets;
    }

    public renderWidget(namespace: any, widgets: any[], noSplit?: boolean) {
        return WidgetUtils.renderWidget(namespace, widgets, noSplit)
    }

    /**
     * 渲染指定位置的widget
     * @param namespace 
     * @param direction 
     * @returns 
     */
    public renderWidgetByDirection(namespace: NamespaceType, type: string, direction: string[]) {
        return this.renderWidget(namespace, this.getWidgetByDirection(namespace, type, direction))
    }

    /**
     * 遍历插件
     * @param namespace 
     * @param fn 
     */
    public walk(namespace: NamespaceType, fn: Function) {

        let nameid: string = this.getNamespaceId(namespace);
        let truenamespace: string = this.toCaseInsensitive(namespace);
        
        if (this.mountMap[truenamespace]) {
            let pipePlugins: any[] = this.mountMap[truenamespace][nameid] 
            
            if (utils.isArray(pipePlugins)) {
                pipePlugins.forEach((it) => {
                    fn(it);
                });
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
            return this.pluginMap[namespace]
        }
    }

    /**
     * 匹配两个点分支付串是否一致
     */
    public levelMatch(target:string, source: string) {
        return source.indexOf(target) == 0;
    }

    /**
     * a.b.c
     * a.b
     * 
     * a
     * => a.b.c a.b
     *  
     * 
     * 
     * @param namespace 
     * @returns 
     */
    public find(namespace: NamespaceType) {
        let truenamespace:string = this.toCaseInsensitive(namespace);
        let namespaceKeys: string[] = Object.keys(this.pluginMap);


        return namespaceKeys.filter(namespace => {
            return this.levelMatch(truenamespace, namespace)
        }).map(namespace => {
            return {
                name: namespace,
                plugins: this.pluginMap[namespace]
            }
        }).flat();
    }
    public toCaseInsensitive(namespace:NamespaceType, hasNamespceId?:boolean) {

        if (Array.isArray(namespace)) {
            namespace = namespace.join('.');
        }
        // 需要删除 namespace里面的id
        // 
        if (!hasNamespceId) {
            namespace = namespace.replace(/\:[^.]+/,'');
        }
        return namespace.toUpperCase();
    }
    public getNamespaceId(namespace: NamespaceType) {
        
        if (Array.isArray(namespace)) {
            namespace = namespace.join('.');
        }

        let match: any = namespace.match(/\:([^.]+)/);

        if (match) {
            return match[1]
        }
    }
}

export default new PluginManager();