import React from 'react';
import PluginBase, { PluginComponent } from '../../../core/Plugin';
import WorkspaceCoder from './WorkspaceCoder';;

export default class WorkspaceCodePanelrPlugin extends PluginBase implements PluginComponent {
    public render(props: any, namespace?: string) {
        return <WorkspaceCoder {...props} namespace={namespace || props.namespace || props.key} />
    }
}