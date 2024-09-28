/**
 * thinking node manager
 */
import { utils, keypath } from '@blocksx/core';
import SmartRequest from '../../utils/SmartRequest';
import GlobalScope from '../../core/GlobalScope';

import IThinkingNode from "../interface/IThinkingNode";

interface ComponentMap {
    name: string;
    nodeId: string;
}

export default class ThinkingNodeManager {
    public static fetchHelper: any = SmartRequest.makeGetRequest('/api/thinking/findOutput');

    public static map: Map<string, IThinkingNode> = new Map();

    public static cache: Map<string, any> = new Map();

    public static hasCache(key: string) {
        return !!this.cache.has(key)
    }

    public static setCache(key: string, value: any) {
        this.cache.set(key, value)
        return value;
    }

    public static getCache(key: string) {
        return this.cache.get(key);
    }

    public static has(key: string) {
        return !!this.map.has(key)
    }
    public static register(key: string, node: IThinkingNode) {
        this.map.set(key, node);
    }
    public static get(key: string) {
        return this.map.get(key);
    }
    public static getNodeByName(nodeId: string) {
        let flow: any = GlobalScope.getContext(GlobalScope.TYPES.CURRENTFLOW_CONTEXT);
        return flow.getNodeByName(nodeId)
    }

    public static getOutputSchemas(ComponentMaps: ComponentMap[]) {
        let needremote: any = [];
        let cacheMap: any = {};
        let schema:any;

        ComponentMaps.forEach(it => {
            let currentNode: any = this.getNodeByName(it.nodeId);
            let storage: any = keypath.get(currentNode, 'props.input.$storage');
            let storageKey: string = [it.name, it.nodeId, storage].join('.');
            
            if (this.hasCache(storageKey)) {
                return cacheMap[it.nodeId] = this.getCache(storageKey)
            }

            if (this.has(it.name)) {
                if (schema = this.get(it.name)?.getOutputSchema(it.nodeId)) {
                    
                    return cacheMap[it.nodeId] = this.clearResult(it.name, it.nodeId, it.name,schema);
                }
            }
            
            needremote.push({
                componentName: it.name, 
                storageKey,
                nodeId: it.nodeId,
                storage
            })
        })

        // 需要多个
        return this.fetchHelper({pages: needremote}).then(result => {
            
            if (Array.isArray(result)) {
                let nodeMap: any = cacheMap;

                result.map((res: any, index: number) => {
                    let item: any = needremote[index];

                    nodeMap[item.nodeId] = this.clearResult(item.componentName, item.nodeId, item.storageKey, res)
                });
                
                return nodeMap;
            }
        });
    }

    /**
     * 获取节点输出数据的描述
     * @param key 
     */
    public static getOutputSchema(componentName: string, nodeId: string, schema?: any) {
        
        let node: any = this.getNodeByName(nodeId);
        let storage: any = keypath.get(node, 'props.input.$storage')
        let storageKey: string = [componentName, nodeId, storage].join('.');

        // cache
        if(this.hasCache(storageKey)) {
            return Promise.resolve(this.getCache(storageKey))
        }

        if (this.has(componentName)) {
            if (schema = this.get(componentName)?.getOutputSchema(nodeId)) {
                return Promise.resolve(this.setCache(storageKey, schema));
            }
        }


        return this.fetchHelper({page: componentName, storage}).then(result => {
            return this.clearResult(componentName, nodeId, storageKey, result)
        });
    }

    public static clearResult(componentName: string, nodeId: string, storageKey: string, result: any) {
        if (Array.isArray(result)) {
            return this.setCache(storageKey, result.map(it => {
                return {
                    ...it,
                    source: nodeId,
                    sourceType: componentName
                }
            }))
        }
        
        return this.setCache(storageKey, {
            ...result,
            source: nodeId,
            sourceType: componentName
        })
    }
    public static getDefaultOutput() {
        return {
            type: 'Object',
            properties: {}
        }
    }
}