import { utils } from '@blocksx/core';
import { PluginBase, EditorContext, EditorRuntimeContext, UIIManger } from '@blocksx/ui';

import { monaco } from 'react-monaco-editor';
export default class EditorBasePlugin extends PluginBase {
    public editorContext: EditorContext;
    public runtimeContext: EditorRuntimeContext;
    
    public constructor(namespace: string, context: EditorContext) {
        super(namespace, context);

        this.editorContext = context;
        this.runtimeContext = context.runtimeContext;
    }
    public didMount() {

        this.initShortcut();
        this.initContextmenu();
    }
    private initContextmenu() {
        let constructor: any = this.constructor
        let contextmenu: any = UIIManger.findContextMenu(constructor);

        if (contextmenu && contextmenu.length) {
            this.registerContextMenu([this.namespace, 'CONTEXTMENU'].join('.'), contextmenu.map(({key, contextmenu}) => {
                
                return {
                    key: [constructor.name, key].join('_'),
                    ...contextmenu,
                    type: key,
                    action: (editorContext: EditorContext) => {
                        if (utils.isFunction(this[key])) {
                            this[key](editorContext)
                        }
                    }
                }
            }))
        }
    }
    private initShortcut() {
        let shortcut: any = UIIManger.findShortcut(this.constructor);

        if (shortcut &&  shortcut.length) {
            shortcut.forEach(({shortcut, key}) => {
                this.editorContext.editor.addAction({
                    id: 'custorm-'+key,
                    label: key +'dispay',
                    keybindings: [shortcut[0] | shortcut[1]],
                    run: () => {
                      // 在这里执行自定义操作
                      utils.isFunction(this[key]) && this[key]()
                    }
                });
            })
        }

    }
    public registerWidgetByType(namespace: string, widget:any) {

    }
}