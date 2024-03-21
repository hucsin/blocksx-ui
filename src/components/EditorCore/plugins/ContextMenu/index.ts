import { PluginBase, PluginManager } from '../../../core/index';


class ContextMenu extends PluginBase {
    public constructor(context: any) {
        super(context);
        
    }
    public didMount(){

        let editor = this.context.monaco;

        console.log(editor.getContextMenuService)

        // 定义右键菜单项
var contextMenu = [
    {
        label: 'Cut',
        id: 'editor.action.clipboardCutAction',
        // 点击菜单项时的行为
        click: function() {
            editor.trigger('contextmenu', 'editor.action.clipboardCutAction');
        }
    },
    {
        label: 'Copy',
        id: 'editor.action.clipboardCopyAction',
        // 点击菜单项时的行为
        click: function() {
            editor.trigger('contextmenu', 'editor.action.clipboardCopyAction');
        }
    },
    {
        label: 'Paste',
        id: 'editor.action.clipboardPasteAction',
        // 点击菜单项时的行为
        click: function() {
            editor.trigger('contextmenu', 'editor.action.clipboardPasteAction');
        }
    }

];
console.log(editor.editor, 222);
//editor.setContextMenu(contextMenu);

    }
}

export default PluginManager.register('EDITOR.TOOLBAR',  ContextMenu)
