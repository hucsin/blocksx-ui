import { 
    EditorBasePlugin, 
    PluginManager,
    UIIContextmenu,
    UIIShortcut
} from '@blocksx/ui';

import { monaco } from 'react-monaco-editor';

class Clipboard extends EditorBasePlugin {
    public constructor(namespace: string, context: any) {
        super(namespace, context);
        
       // this.registerContextMenu('EDITOR.CONTEXTMENU', this.contextMenu)
    }

    @UIIShortcut(
        monaco.KeyMod.CtrlCmd,
        monaco.KeyCode.KeyX
    )
    @UIIContextmenu(
        {
            label: 'Cut',
        }, 
        ({runtimeContext}) =>runtimeContext.hasSelection()
    )
    public doCut() {
        this.runtimeContext.clipboardCut();
    }

    @UIIShortcut(
        monaco.KeyMod.CtrlCmd,
        monaco.KeyCode.KeyC
    )
    @UIIContextmenu(
        {
            label: 'Copy',
        }, 
        ({runtimeContext})=>runtimeContext.hasSelection()
    )
    public doCopy() {
        this.runtimeContext.clipboardCopy();
    }


    @UIIShortcut(
        monaco.KeyMod.CtrlCmd,
        monaco.KeyCode.KeyV
    )
    @UIIContextmenu(
        {
            label: 'Paste',
        }, 
        ({runtimeContext})=>runtimeContext.hasClipboardData()
    )
    public doPaste() {
        this.runtimeContext.clipboardPaste();
    }
}

export default PluginManager.register('EDITOR.TOOLBAR',  Clipboard)
