import { pluginManager } from '@blocksx/ui/Editor/core/manager/index';
import TreeItemWashPlugin from './TreeItemWash';

// 组册插件
pluginManager.register('RESOURCETREE.RESOURCE.WASH', new TreeItemWashPlugin());