
import {resourceManager } from '../core/manager/index';
import { Mysql, PostgreSQL , Table, Datasource, FolderOutlined } from '../../Icons'

import './resource/boot';

// 注册ICON资源
resourceManager.register('RESOURCE.ICON.DATASOURCE.MYSQL', Mysql)
resourceManager.register('RESOURCE.ICON.DATASOURCE.POSTGRESQL', PostgreSQL)
resourceManager.register('RESOURCE.ICON.SCHEMA', Datasource)
resourceManager.register('RESOURCE.ICON.TABLEGROUP', FolderOutlined)
resourceManager.register('RESOURCE.ICON.TABLE', Table)

