import { PluginBase, PluginManager } from '../../../core/index';

import RunerWidget from './widget';

class Format extends PluginBase {
    public constructor(context: any) {
        super(context);
        
        this.registerWidget('toolbar', RunerWidget)
    }
}

export default PluginManager.register('EDITOR.TOOLBAR',  Format)
