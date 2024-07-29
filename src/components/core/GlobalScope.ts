export default class GlobalScope {
    public static TYPES = {
        CURRENTFLOW_NODE: '#CurrentFLowNode', // 当前选中节点
        CURRENTFLOW_CONTEXT: '#CurrentFlowContext' // 当前流程实例
    }
    private static scope: Record<string, any>  = {};
    private static context: Record<string, any> = {}


    public static  setScope(scopeName: string, scopeValue: any) {
        return this.scope[scopeName] = scopeValue;
    }
    public static  getScope(scopeName: string) {
        return this.scope[scopeName]
    }

    public static  setContext(contextName: string, context: any) {
        this.context[contextName] = context;
    }
    public static getContext(contextName: string) {
        return this.context[contextName];
    }
}


 