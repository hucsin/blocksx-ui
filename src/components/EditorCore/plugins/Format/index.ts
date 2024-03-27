import { PluginBase, PluginManager } from '../../../core/index';

import RunerWidget from './widget';

class Format extends PluginBase {
    public constructor(namespace: string,context: any) {
        super(namespace, context);
        
        this.registerWidget('toolbar', RunerWidget);
    }
}

export default PluginManager.register('EDITOR.TOOLBAR',  Format)
