import { utils } from '@blocksx/core';
import { StructuralMiniFlow } from '@blocksx/structural';
import { IThinkingNode, ThinkingNodeManager, MiniFlow } from "@blocksx/ui";

class FlowControlIteratorNode extends IThinkingNode {
    
    public getOutputSchema(nodeId: string) {
        let currentFlow: MiniFlow = this.getCurrentThinkingFlow();
        
        if (currentFlow) {
            let node: any = currentFlow.getSourceNodeByName(nodeId);
            return ThinkingNodeManager.getOutputSchema(StructuralMiniFlow.getComponentName(node), node.name).then(data => {
                let schema: any=  data.map(it => {
                    if(it.type =='array') {
                        return {
                            ...utils.omit(it, ['items', 'type']),
                            ...it.items
                        };
                    }
                    return false
                }).filter(Boolean);
                return schema.length > 0 ? schema : ThinkingNodeManager.getDefaultOutput()
            })
        }
        return ThinkingNodeManager.getDefaultOutput();
    }
}


ThinkingNodeManager.register('FlowControl.iterator', new FlowControlIteratorNode())