/**
 * 资源管理器,用于管理如
 */

 import { utils } from '@blocksx/core';
 
 type NamespaceType = string | string[];

 class ResourceManager {
    public map: any;
    public constructor() {
        this.map = {};
    }
    private isValidNamespace(namespace: NamespaceType) {
        return utils.isString(namespace) 
    }
    /**
     * 
     * @param namespace 
     */
    public has(namespace: NamespaceType) {
        return !!this.map[this.toCaseInsensitive(namespace)]
    }
    /**
     * 
     * @param namespace eg. resource.layout.icon
     * @param plugin 
     */
    public register(namespace: NamespaceType, plugin: any) {

        namespace = this.toCaseInsensitive(namespace);

        if (!this.isValidNamespace(namespace)) {
            return console.error('The Resource namespace only supports up to 3 levels. eg. a.b.c, a.b, a')
        }

        if (!this.has(namespace)) {
            this.map[namespace] = plugin;
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
            return this.map[namespace]
        }
    }

    /**
     * 
     * @param namespace 
     * @returns 
     */
    public find(namespace: NamespaceType) {

        namespace = this.toCaseInsensitive(namespace);

        // 只支持两级命名空间获取插件,
        if (this.isValidNamespace(namespace) && namespace.split('.').length > 1) {
            if (this.has(namespace)) {
                return this.map[namespace];
            // 
            } else {
                let targetSplit: any = namespace.split('.');

                if (targetSplit.length == 2) {
                    // 如果我set 的时候是 a.b.c = 1, a.b.d = 1;
                    // 那么我get a.b 的时候需要返回 {c:1,d:1}
                    let result: any = {};
                    for(let prop in this.map) {
                        let sourceSplit: any = prop.split('.');
                        if (this.matchLevel2Namespace(targetSplit, sourceSplit)) {
                            result[sourceSplit[2]] = this.find(prop);
                        }
                    }

                    return result;
                }
            }
        } else {
            console.error('Please enter the correct  namespace. eg. a.b a.b.c')
        }
    }
    private matchLevel2Namespace(targetSplit: string[], sourceSplit: string[]) {
        return (targetSplit[0] === sourceSplit[0]) && (targetSplit[1] === sourceSplit[1])
    }

    private toCaseInsensitive(namespace:NamespaceType) {
        if (Array.isArray(namespace)) {
            namespace = namespace.join('.')
        }
        return namespace.toUpperCase();
    }
 }


 export default new ResourceManager();