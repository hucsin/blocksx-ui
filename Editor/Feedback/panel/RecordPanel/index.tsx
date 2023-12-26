import React from 'react';
import PluginBase, { PluginComponent } from '../../../core/Plugin';
import FeedbackHistoryPanel from './Panel';;

export default class FeedbackHistoryPanelPlugin extends PluginBase implements PluginComponent {
    public render(props: any, namespace: string) {
        let _name: string = namespace || props.namespace || props.key;
        return <FeedbackHistoryPanel {...props} namespace={_name} key={_name} />
    }
}