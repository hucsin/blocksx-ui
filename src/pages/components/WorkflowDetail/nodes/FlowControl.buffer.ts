import { StructuralMiniFlow } from '@blocksx/structural';
import { IThinkingNode, ThinkingNodeManager, MiniFlow } from "@blocksx/ui";

class FlowControlBufferNode extends IThinkingNode {
    
    public getOutputSchema(nodeId: string) {
        let currentFlow: MiniFlow = this.getCurrentThinkingFlow();
        
        if (currentFlow) {
            let node: any = currentFlow.getSourceNodeByName(nodeId);
            return ThinkingNodeManager.getOutputSchema(StructuralMiniFlow.getComponentName(node), node.name)
        }
        
        return ThinkingNodeManager.getDefaultOutput();
    }
}


ThinkingNodeManager.register('FlowControl.buffer', new FlowControlBufferNode())