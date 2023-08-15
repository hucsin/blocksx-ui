import PluginBase, { PluginContextMenu } from '../core/Plugin';

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