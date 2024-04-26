import { pluginManager } from '../../core/manager/index';
import CoderPanelPlugin from './CoderPanel';


pluginManager.register(['WORKSPACE', 'PANEL', 'CODER'], new CoderPanelPlugin())