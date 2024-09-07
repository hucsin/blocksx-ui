import React from 'react';
import { GlobalScope, Icons, FormerTypes} from '@blocksx/ui';
import ScopeTooltip from './panel/tooltip';
import { upperFirst } from 'lodash';

interface FormerScopeProps {
    type: string;
    value: any;
    source?: any;
    dataType?: string;
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
                let node: any = this.miniFlow.getNodeByName(this.props.source || keypath[1])
                
                if (node) {
                    return {
                        scope: 'Workflow Nodes',
                        icon: node.icon,
                        color: node.color,
                        serial: node.serial,
                        subtitle: node.props.method,
                        title: node.props.program,
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
        let truepath: string = keypath.slice(1, keypath.length).join('.') 
        let IconView: any = Icons[props.icon] || Icons.FlowUtilityOutlined; 
        let displayvalue: string = [truepath,(this.props.value ||'').replace(/outputs\./, '')].join('.')
        
        return (
            <ScopeTooltip {...props} icon={<IconView style={{color:props.color}}/>} other={[
                
                {
                    name: 'SCOPE',
                    subname: props.scope,
                    description: <>{truepath} {this.props.source &&<span className='ui-empty'> ⇐ {this.props.source}</span>}</>
                },
                {
                    name: 'KEYPATH',
                    subname: 'Returns values ' +(this.props.dataType ? '<'+ upperFirst(this.props.dataType) + '>': '' ),
                    description: this.props.value
                }
            ]} >
                <span className='ui-scope-scope'><IconView />{displayvalue}</span>
            </ScopeTooltip>
        )
    }
}