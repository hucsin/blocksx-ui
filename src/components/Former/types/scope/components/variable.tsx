import React from 'react';
import ScopeTooltip from './panel/tooltip';
import * as Icons from '../../../../Icons';

interface FormerVariableProps {
    name: string;
    description: string;
}

export default class FormerVariable extends React.Component<FormerVariableProps> {
    
    public render() {
        return (
            <ScopeTooltip 
                {...this.props}
         
            >
                <span className='ui-scope-vaiable'>
                   <Icons.VariableUtilityOutlined/> {this.props.name}
                </span>
            </ScopeTooltip>
        )
    }
}