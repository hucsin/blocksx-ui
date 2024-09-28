import { utils } from '@blocksx/core';
import CoreScope from '@blocksx/scope';

import { StructuralMiniFlow, StructuralJSON } from '@blocksx/structural';
import { IThinkingNode, ThinkingNodeManager, MiniFlow } from "@blocksx/ui";

import FlowUtils from '../utils';

class FlowControlIteratorNode extends IThinkingNode {
    
    public getOutputSchema(nodeId: string) {
        let currentFlow: MiniFlow = this.getCurrentThinkingFlow();
        let currentNode: any = currentFlow.getNodeByName(nodeId);
        let target: any = null;

        if (currentFlow && currentNode) {
            let { props = {}} = currentNode;
            

            if (props.input && utils.isValidArray(props.input.target)) {

                return new Promise((resolve, reject) => {
                    let output: any = ThinkingNodeManager.getOutputSchemas(this.getNodeInScope(props.input.target));
                    
                    output.then(data=> {
                        let input: any = CoreScope.getValue('connector', {
                            getScopeValue(name: string) {
                                return StructuralJSON.toValues(data[name]);
                            }
                        }, props.input.target[0]);
                        resolve(StructuralJSON.toSchema(input))
                    })

                })
                
            }

            let node: any = currentFlow.getSourceNodeByName(nodeId);
            
            return ThinkingNodeManager.getOutputSchema(StructuralMiniFlow.getComponentName(node), node.name).then(data => {
                let schema: any=  data.map(it => {

                    if(it.type =='array') {
                        // 过滤
                        if (target) {
                            if (target.value.includes('$iterator') ? !it.iterator : it.iterator) {
                                return false
                            }
                            // 剪切
                            it = FlowUtils.getJSONByKeypath(it, target.value)
                        }
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