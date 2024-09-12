import React from 'react';
import { Tooltip } from 'antd';
import * as Icons from '../../../../Icons';

interface FormerViewProps {
    value: string;
    icon: string;
    name: string;
    
    description: string;
}

export default class FormerView extends React.Component<FormerViewProps> {
    
    public render() {
        let IconView: any = Icons[this.props.icon];
        return (
            <Tooltip 
                title={this.props.description}
            >
                <span className='ui-scope-vaiable'>
                   {IconView && <IconView/>} {this.props.name}({this.props.value})
                </span>
            </Tooltip>
        )
    }
}