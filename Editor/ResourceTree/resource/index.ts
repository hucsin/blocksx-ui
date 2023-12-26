import { message } from 'antd';
import {  utils } from '@blocksx/core';

import { resourceManager, pluginManager } from '@blocksx/ui/Editor/core/manager/index';
import { MySQL, PostgreSQL , Table, Datasource, FolderOutlined } from '@blocksx/ui/Icons';


import { 
    EditorResourceState, 
    EditorFormerState, 
    EditorWorkspaceState, 
    EditorMetaDataState   
} from '@blocksx/ui/Editor/states';

import { StateX } from '@blocksx/ui/StateX/index';


import './toolbar/index';
import './plugins/index';
import './former/index';


// 注册ICON资源
resourceManager.register('RESOURCE.ICON.DATASOURCE.MYSQL', MySQL)
resourceManager.register('RESOURCE.ICON.DATASOURCE.POSTGRESQL', PostgreSQL)
resourceManager.register('RESOURCE.ICON.SCHEMA', Datasource)
resourceManager.register('RESOURCE.ICON.TABLEGROUP', FolderOutlined)
resourceManager.register('RESOURCE.ICON.TABLE', Table);




/**
 * 添加新数据源
 */
 pluginManager.registorContextMenuAction('RESOURCE.ADD.DATASOURCE', (_, item, payload: any = {}) => {
    
    let _payload: any = Object.assign({}, payload, item.payload) || payload;
    let type: string = _payload ? _payload.type || item.name : item.name;
    console.log(payload, item)
    let Former: any = StateX.findModel(EditorFormerState);
    let namespace: any = ['RESOURCE.FORMER', type].join('.');
    
    if (!resourceManager.has(namespace)) {
       message.warning(`不存在数据源模板[${type}]`)
    } else {
        Former.show(namespace)
    }
})



// 组册打开新窗口事件
pluginManager.registorContextMenuAction('RESOURCE.OPEN.CODER', (_, item: any, payload: any) => {
    let CoderMeta: any = EditorMetaDataState.findMetaModel('WORKSPACE.PANEL.CODER.META');
    let resourceState: EditorResourceState =  StateX.findModel(EditorResourceState, 'resource');
    
    if (CoderMeta) {
        let Workspace:any = StateX.findModel(EditorWorkspaceState);
        let router:any = resourceState.getRouterList(['database', 'schema'], payload.type ? payload : undefined) || {};
        let workspaceName: string = '';
        let workspaceId: any = utils.uniq();

        if (router.current) {
            workspaceName = router.current.map(it => {
                return it.name
            }).join('.') || router.root.name;
            workspaceId = [router.root.key, workspaceName].join('.')
        } else {
            workspaceName = '查询窗口' + (Workspace.getHistoryLength()+1)
        }

        Workspace.open(new CoderMeta(workspaceId, {
            key: workspaceId,
            name: workspaceName,
            router : {
                ...router,
                rootId: router.root.id
            }
        }))
    }
})

// 组册右键菜单

pluginManager.registerContextMenu('RESOURCE.CONTEXTMENU', [
    { key: 'property', control: { type: ['datasource'] }, name: '属性',icon:'DsSetting' , action: 'RESOURCE.EDIT.DATASOURCE'},
    { key: 'openquery', name: '打开窗口',icon:'Query' , action: 'RESOURCE.OPEN.CODER'},
    { key: 'hr', type:'divider' },
    ...pluginManager.findContextMenu('RESOURCE.CREATEMENU', 'datasource') 
]);

// 编辑数据源
pluginManager.registorContextMenuAction('RESOURCE.EDIT.DATASOURCE', (_, menuItem: any, payload: any) => {

    // 先通过id获取
    
    let resourceState: EditorResourceState =  StateX.findModel(EditorResourceState, 'resource');
    let formerState: EditorFormerState = StateX.findModel(EditorFormerState);

    let { id } = payload.record || {};

    if (id) {
        resourceState.doAction('find', {id: id}).then((result: any) => {
            formerState.show(['RESOURCE.FORMER',result.type].join('.'), result)
        }).catch((e) => {
            message.error(e)
        })

    } else {
        message.warning('缺少必要的ID参数!')
    }
})
