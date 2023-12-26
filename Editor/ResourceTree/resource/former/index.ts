import { resourceManager, pluginManager } from '@blocksx/ui/Editor/core/manager/index';
import DSFormerCreater from './DSFormerCreater';

/**
 * datasource新增默认项
 */
resourceManager.register('RESOURCE.FORMER.MySQL', DSFormerCreater('MySQL'));
resourceManager.register('RESOURCE.FORMER.PostgreSQL', DSFormerCreater('PostgreSQL'));


pluginManager.registerContextMenu('RESOURCE.CREATEMENU',[
    { key: 'datasource.mysql',payload: {type: 'MySQL'}, icon: 'MySQL', name: 'MySQL', action: 'RESOURCE.ADD.DATASOURCE' },
    { key: 'datasource.pgsql', icon: 'PostgreSQL',payload: {type: 'PostgreSQL'}, name: 'PostgreSQL', action: 'RESOURCE.ADD.DATASOURCE' }
])
