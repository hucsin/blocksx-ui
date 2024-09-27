import { StructuralMiniFlow } from '@blocksx/structural';
import GlobalScope from "../GlobalScope";


export default abstract class IThinkingNode {
    // 获取
    public abstract getOutputSchema(nodeId: string): boolean | Promise<any> | Record<string, any>;

    
    
    public getCurrentThinkingFlow() {
        return GlobalScope.getContext(GlobalScope.TYPES.CURRENTFLOW_CONTEXT)
    }
    public getNodeByName(nodeId: any) {
        let currentFlow: any = this.getCurrentThinkingFlow();
        return currentFlow.getNodeByName(nodeId)
    }

    public walkScope(scope: any, walk: Function) {
        if (Array.isArray(scope)) {
            scope.forEach(it => {
                this.walkScope(it, walk)
            })

        } else {
            switch(scope.$type) {
                case 'function':
                    return Array.isArray(scope.parameters) && this.walkScope(scope.parameters, walk);
                default:
                    if (Array.isArray(scope.value)) {
                        return this.walkScope(scope.value, walk)
                    }
                    walk(scope)
            }
        }
    }
    public getNodeInScope(inScope: any) {
        let nodes: any = [];

        this.walkScope(inScope, (scope) => {
            if (scope.$type == 'scope') {
                let nodeId: string = scope.keypath.replace(/\$flow\./,'');
                let currentNode: any = this.getNodeByName(nodeId);
                
                nodes.push({
                    keypath: scope.value,
                    name: StructuralMiniFlow.getComponentName(currentNode),
                    nodeId: nodeId
                })
            }
        })

        return nodes;
    }
}