import React from 'react';
import { GlobalScope, Icons} from '@blocksx/ui';
import ScopeTooltip from './panel/tooltip';

interface FormerScopeProps {
    type: string;
    value: any;
    keypath: string;
}

interface FormerScopeState {
    keypath: string[];
    
}

export default class FormerScope extends React.Component<FormerScopeProps, FormerScopeState> {
    private miniFlow: any;
    public constructor(props: FormerScopeProps) {
        super(props);
        this.miniFlow = GlobalScope.getContext(GlobalScope.TYPES.CURRENTFLOW_CONTEXT);
        
        this.state = {
            keypath:  props.keypath.split('.')
        }
    }
    public getDefaultProps() {
        let keypath: string[] = this.state.keypath;

        switch(keypath[0]) {
            case '$flow':

                let node: any = this.miniFlow.getNodeByName(keypath[1])
                
                if (node) {
                    return {
                        scope: 'Thinking workflow',
                        icon: node.icon,
                        color: node.color,
                        serial: node.serial,
                        name: node.props.method,
                        description: node.props.description
                    };
                }
                break;
        }

        return 'FlowUtilityOutlined'
    }
    public render() {
        let props: any = this.getDefaultProps();
        let keypath: any = this.state.keypath || [];
        let IconView: any = Icons[props.icon] || Icons.FlowUtilityOutlined; 
        let displayvalue: string = (this.props.value ||'').replace(/^returns\./, '')
        
        return (
            <ScopeTooltip {...props} icon={<IconView/>} other={[
                {
                    name: 'SERIAL',
                    description: props.serial
                },
                {
                    name: 'SCOPE',
                    subname: props.scope,
                    description: keypath.slice(1, keypath.length).join('.')
                },
                {
                    name: 'KEYPATH',
                    subname: 'Returns values',
                    description: this.props.value
                }
            ]} >
                <span className='ui-scope-scope'><IconView />{displayvalue}{props.serial && <span className='number'>{props.serial}</span>}</span>
            </ScopeTooltip>
        )
    }
}