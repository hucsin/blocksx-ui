import {resourceManager,  pluginManager } from '../manager/index';
import ResourceTreeItemWashPlugin from './ResourceItemWash.plugin';

import { Mysql, PostgreSQL , Table, Datasource, FolderOutlined } from '../../Icons'
import './style.scss';

// 组册插件
pluginManager.register('RESOURCETREE.RESOURCE.WASH', new ResourceTreeItemWashPlugin())



// 注册ICON资源
resourceManager.register('RESOURCE.ICON.DATASOURCE.MYSQL', Mysql)
resourceManager.register('RESOURCE.ICON.DATASOURCE.POSTGRESQL', PostgreSQL)
resourceManager.register('RESOURCE.ICON.SCHEMA', Datasource)
resourceManager.register('RESOURCE.ICON.TABLEGROUP', FolderOutlined)
resourceManager.register('RESOURCE.ICON.TABLE', Table)