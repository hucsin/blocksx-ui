import { pluginManager } from '@blocksx-ui/Editor/core/manager/index';
import TreeItemWashPlugin from './TreeItemWash.plugin';
import ContextMenusPlugin from './ContextMenu.plugin';
import ToolbarPlugin from './toolbar/toolbar.plugin';



// 组册插件
pluginManager.register('RESOURCETREE.RESOURCE.WASH', new TreeItemWashPlugin());
pluginManager.register('RESOURCETREE.RESOURCE.CONTEXTMENU', new ContextMenusPlugin());

pluginManager.register('RESOURCETREE.RESOURCE.TOOLBAR', new ToolbarPlugin())

