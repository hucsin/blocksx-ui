import {
    EditorBasePlugin,
    PluginManager,
    EditorContext,
    UIIShortcut,
    UIIContextmenu
} from '@blocksx/ui';

import ToolbarWidget from './WidgetToolbar';
import FollowbarWdiget from './WidgetFollowbar';

import { monaco } from 'react-monaco-editor';

class Runer extends EditorBasePlugin {
    public constructor(namespace: string, context: EditorContext) {
        super(namespace, context);

        this.registerWidget('toolbar', ToolbarWidget);
        this.registerWidget('followbar', FollowbarWdiget);
    }
    /**
     * 运行当前代码
     */
   
    @UIIContextmenu(
        {
            label: 'Run code',
        }, 
        ({runtimeContext}) =>runtimeContext.hasValue()
    )
    public runCode = () => {
        console.log(this.runtimeContext.getValue())
    }
    /**
     * 运行当前行代码
     */
    @UIIContextmenu(
        {
            label: 'Run selected'
        }, 
        ({runtimeContext}) =>runtimeContext.hasSelection()
    )
    public runSelectionCode = () => {

        console.log(this.runtimeContext.getSelectionValue())
    }

    /**
     * action
     */
    @UIIShortcut(
        monaco.KeyMod.CtrlCmd,
        monaco.KeyCode.KeyR
    )
    public doAction =(item?: any)=> {
        
        if (item) {


        } else {
            this.runtimeContext.hasSelection() 
                ? this.runSelectionCode()
                : this.runCode();
        }
        
    }
}

export default PluginManager.register('EDITOR.TOOLBAR', Runer)
