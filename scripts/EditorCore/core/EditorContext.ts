/**
 * 编辑器上下文
 */
import React from 'react';
import { monaco } from 'react-monaco-editor';

import EditorRuntimeContext from './EditorRuntimeContext';

export default class EditorContext {
    public editorCore: any;
    public editor: monaco.editor.IStandaloneCodeEditor;
    public runtimeContext: EditorRuntimeContext;
    public monaco: typeof monaco;
    
    private listenerList: any;

    public constructor(editorCore: React.Component) {
        this.editorCore = editorCore; 
        this.listenerList = {};
        this.runtimeContext = new EditorRuntimeContext();
    }

    public setMonacoEditor(editor: monaco.editor.IStandaloneCodeEditor, monaco: any) {
        this.monaco = monaco;
        this.editor = editor;

        this.runtimeContext.bindEditor(editor);
        this.initializeEvent();
    }
    private initializeEvent() {
        let typekeys: any = Object.keys(this.listenerList);
        
        return typekeys.map(tk => {
            let map: any = this.listenerList[tk];

            if (map) {
                map.forEach(listener => {
                    this.editor[tk](listener)
                })
            }
        })
    }

    public getScrollTop() {
        return this.editor.getScrollTop();
    }
    public getScorllWidth() {
        return this.editor.getScrollWidth();
    }

    public registerEvent(type: string, listener: Function) {

        if (!this.listenerList[type]) {
            this.listenerList[type] = [];
        }

        this.listenerList[type].push(listener);
    }
    public getEditorWrapper () {
        return this.editorCore.editorWrapper.current;
    }
}