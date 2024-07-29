/**
 * thinking node manager
 */
import { utils } from '@blocksx/core';
import IThinkingNode from "../interface/IThinkingNode";

export default class ThinkingNodeManager {
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
    public static getOutputSchema(key: string, nodeId: string) {
        
        if (this.has(key)) {

            let schema: any = this.get(key)?.getOutputSchema(nodeId);
            if (schema === true || utils.isPromise(schema)) {
                return schema;
            } else {
                return Promise.resolve(schema)
            }
        }
        // 没有的时候也是返回true
        return true;
    }
}