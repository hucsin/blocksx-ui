import PluginBase, { PluginContextMenu } from '@blocksx/ui/Editor/core/Plugin';

export default class ResourceTreeContextMenuPlugin extends PluginBase implements  PluginContextMenu {
    public contextMenu: any = [
        {
            key: 'ac',
            name: '属性'
        },
        {
            key: 'ac2',
            name: '其他'
        }

    ]
}