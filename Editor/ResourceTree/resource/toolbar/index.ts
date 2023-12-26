import { pluginManager } from '@blocksx/ui/Editor/core/manager/index';
import ReflushResource from './ResourceReflush';
import CreateResource from './ResourceCreate';

pluginManager.register('RESOURCETREE.RESOURCE.TOOLBAR', new CreateResource());
pluginManager.register('RESOURCETREE.RESOURCE.TOOLBAR', new ReflushResource());
