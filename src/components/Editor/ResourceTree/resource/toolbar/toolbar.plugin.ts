import PluginBase from '@blocksx/ui/Editor/core/Plugin';

import Test from './test';

export default class Toolbar extends PluginBase {
    public constructor() {
        super();
        this.registerWidget('toolbar', new Test())
    }
}