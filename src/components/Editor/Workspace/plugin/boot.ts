import { pluginManager } from '../../core/manager/index';
import CoderPanelPlugin from './CoderPanel.plugin';


pluginManager.register(['WORKSPACE', 'PANEL', 'CODER'], new CoderPanelPlugin())