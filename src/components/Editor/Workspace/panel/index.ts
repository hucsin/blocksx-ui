import { pluginManager } from '../../core/manager/index';
import CoderPanelPlugin from './CoderPanel';

console.log(333333322)
pluginManager.register(['WORKSPACE', 'PANEL', 'CODER'], new CoderPanelPlugin())