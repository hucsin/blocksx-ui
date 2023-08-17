import { pluginManager } from '../../../../../core/manager/index';

import Test from './test';
import Test1 from './test2';
import Test2 from './test3';


pluginManager.register(['WORKSPACE', 'CODER', 'TOOLBAR'], new Test())
pluginManager.register(['WORKSPACE', 'CODER', 'TOOLBAR'], new Test1())
pluginManager.register(['WORKSPACE', 'CODER', 'TOOLBAR'], new Test2())