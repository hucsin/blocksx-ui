import { StructuralJSON } from '@blocksx/structural';
import { IThinkingNode, ThinkingNodeManager, MiniFlow } from "@blocksx/ui";

class ThinkingStartNode extends IThinkingNode {
    
    public getOutputSchema(nodeId: string) {
        
        let currentFlow: MiniFlow = this.getCurrentThinkingFlow();

        if (currentFlow) {
            let node: any = currentFlow.getNodeByName(nodeId);
            if (node && node.props) {
                let { input = {} } = node.props;
                let inputs: any = input.inputs;

                if (Array.isArray(inputs)) {
                    return StructuralJSON.toSchemaByFields(inputs)
                }
            }
            
            return {
                type: 'object',
                properties: {}
            }
        }
        return true;
    }
}


ThinkingNodeManager.register('Thinking.start', new ThinkingStartNode())