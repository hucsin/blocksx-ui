import GlobalScope from "../GlobalScope";

export default abstract class IThinkingNode {
    // 获取
    public abstract getOutputSchema(nodeId: string): boolean | Promise<any> | Record<string, any>;

    
    
    public getCurrentThinkingFlow() {
        return GlobalScope.getContext(GlobalScope.TYPES.CURRENTFLOW_CONTEXT)
    }

}