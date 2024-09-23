/**
 * thinking node manager
 */
import { utils, keypath } from '@blocksx/core';
import SmartRequest from '../../utils/SmartRequest';
import GlobalScope from '../../core/GlobalScope';

import IThinkingNode from "../interface/IThinkingNode";


export default class ThinkingNodeManager {
    public static fetchHelper: any = SmartRequest.makeGetRequest('/api/thinking/findOutput');

    public static map: Map<string, IThinkingNode> = new Map();

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
    /**
     * 获取节点输出数据的描述
     * @param key 
     */
    public static getOutputSchema(key: string, nodeId: string, schema?: any) {
        console.log(schema,nodeId,key, 333)
        if (this.has(key)) {
            if (schema = this.get(key)?.getOutputSchema(nodeId)) {
                return Promise.resolve(schema);
            }
        }

        let node: any = this.getNodeByName(nodeId);
        let storage: any = keypath.get(node, 'props.input.$storage')
        

        return this.fetchHelper({page: key, storage}).then(result => {
            
            if (Array.isArray(result)) {
                return result.map(it => {
                    return {
                        ...it,
                        source: nodeId,
                        sourceType: key
                    }
                })
            }
            
            return {
                ...result,
                source: nodeId,
                sourceType: key
            };
        });
    }
    public static getDefaultOutput() {
        return {
            type: 'Object',
            properties: {}
        }
    }
}