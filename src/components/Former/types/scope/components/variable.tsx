import React from 'react';
import ScopeTooltip from './panel/tooltip';

import { ScopeManger as FunctionManger } from '@blocksx/scope';
import * as Icons from '../../../../Icons';

interface FormerVariableProps {
    value: string;
    
    description: string;
}

export default class FormerVariable extends React.Component<FormerVariableProps> {
    
    public render() {
        let schema: any = FunctionManger.get(this.props.value);
        let truename: string[] = (this.props.value||'').split('.')
        return (
            <ScopeTooltip 
                name={this.props.value}
                title={truename[0]}
                subtitle={this.props.value}
                description={schema.description}
            >
                <span className='ui-scope-vaiable'>
                   <Icons.VariableUtilityOutlined/> {this.props.value}
                </span>
            </ScopeTooltip>
        )
    }
}