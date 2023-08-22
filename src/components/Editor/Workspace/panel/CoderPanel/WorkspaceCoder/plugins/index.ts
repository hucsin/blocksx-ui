import { pluginManager } from '@blocksx-ui/Editor/core/manager/index';
import CodeRun from './CodeRun';
import CodeModify from './CodeModify';

//import Test from './test';
import Test2 from './test3';


pluginManager.register('WORKSPACE.CODER.TOOLBAR', new CodeRun());
pluginManager.register('WORKSPACE.CODER.TOOLBAR', new CodeModify());

pluginManager.register(['WORKSPACE', 'CODER', 'TOOLBAR'], new Test2())