import { pluginManager } from '@blocksx/ui/Editor/core/manager/index';
import CoderRun from './CoderRun';
import CoderModify from './CoderModify';

//import Test from './test';
import CoderSetting from './CoderSetting';
import CoderRouter from './CoderRouter';


pluginManager.register('WORKSPACE.CODER.TOOLBAR', new CoderRun());
pluginManager.register('WORKSPACE.CODER.TOOLBAR', new CoderModify());

pluginManager.register('WORKSPACE.CODER.TOOLBAR', new CoderRouter());
pluginManager.register('WORKSPACE.CODER.TOOLBAR', new CoderSetting());