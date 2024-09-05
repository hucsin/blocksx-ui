/**
 * thinking node manager
 */
import { utils } from '@blocksx/core';
import SmartRequest from '../../utils/SmartRequest';
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
    /**
     * 获取节点输出数据的描述
     * @param key 
     */
    public static getOutputSchema(key: string, nodeId: string, schema?: any) {
        
        if (this.has(key)) {
            if (schema = this.get(key)?.getOutputSchema(nodeId)) {
                return Promise.resolve(schema);
            }
        }

        return this.fetchHelper({page: key});
    }
    public static getDefaultOutput() {
        return {
            type: 'Object',
            properties: {}
        }
    }
}