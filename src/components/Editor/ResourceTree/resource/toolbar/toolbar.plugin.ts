import PluginBase from '@blocksx-ui/Editor/core/Plugin';

import Test from './test';

export default class Toolbar extends PluginBase {
    public constructor() {
        super();
        console.log(3333)
        this.registerWidget('toolbar', new Test())
    }
}