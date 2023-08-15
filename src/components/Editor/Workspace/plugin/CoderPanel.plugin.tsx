import React from 'react';

import { StateX, StateComponent } from '../../../StateX';
import PluginBase, { PluginComponent } from '../../core/Plugin';


class WorkspaceCoder extends StateComponent<{}>{
    public constructor(props:any) {
        super(props)
    }
    public render () {
        return (
            <div> coder</div>
        )
    }
}


export default class WorkspaceCodePanelrPlugin extends PluginBase implements PluginComponent {
    public render(data) {
        return <WorkspaceCoder {...data} />
    }
}