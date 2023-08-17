import React from 'react';
import PluginBase, { PluginComponent } from '../../../core/Plugin';
import FeedbackHistoryPanel from './Panel';;

export default class FeedbackHistoryPanelPlugin extends PluginBase implements PluginComponent {
    public render(props: any, namespace: string) {
        return <FeedbackHistoryPanel {...props} namespace={namespace || props.namespace || props.key} />
    }
}