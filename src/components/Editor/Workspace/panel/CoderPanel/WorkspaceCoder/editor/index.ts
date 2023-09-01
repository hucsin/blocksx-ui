import { pluginManager } from '@blocksx/ui/Editor/core/manager/index';

import AutoComplete from './AutoComplete';
import CatchError from './CatchError';

pluginManager.register('WORKSPACE.CODER.EDITOR', new AutoComplete());
pluginManager.register('WORKSPACE.CODER.EDITOR', new CatchError());