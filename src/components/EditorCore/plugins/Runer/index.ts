import { PluginBase, PluginManager } from '../../../core/index';

import RunerWidget from './widget';

class Runer extends PluginBase {
    public constructor(context: any) {
        super(context);
        
        this.registerWidget('toolbar', RunerWidget)
    }

    public destory() {
        /** */
    }
}

export default PluginManager.register('EDITOR.TOOLBAR', Runer)
