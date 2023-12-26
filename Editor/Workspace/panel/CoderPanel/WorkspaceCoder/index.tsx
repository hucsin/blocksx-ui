import React from 'react';
import MonacoEditor from 'react-monaco-editor';
import Toolbar from '@blocksx/ui/Editor/Toolbar';
import { pluginManager, resourceManager } from '@blocksx/ui/Editor/core/manager';
import { addEvent, removeEvent } from '@blocksx/ui/utils/dom';
import { StateComponent, StateX } from '@blocksx/ui/StateX';

import { EditorWorkspaceState } from '@blocksx/ui/Editor/states';


import './style.scss';
import './toolbar/index';
import './editor/index'


interface WorkspaceCoderProps {
    namespace: string;
    value?: string;

}

export default class WorkspaceCoder extends StateComponent<WorkspaceCoderProps, {
    height: number;
    editorOptions?: any
}>{
    private toolbarNamespace: string = 'WORKSPACE.CODER.TOOLBAR';
    private configNamespace: string = 'WORKSPACE.CODER.CONFIG';
    private editorNamespace: string = 'WORKSPACE.CODER.EDITOR';
    
    private panelCanvas: any;
    private workspaceState: EditorWorkspaceState = StateX.findModel(EditorWorkspaceState);
    private editor:any ;
    public constructor(props:WorkspaceCoderProps) {
        super(props);
        this.state = {
            height: 0,
            editorOptions: resourceManager.find(this.configNamespace) || {
                language: 'sql',
                minimap: {
                    enabled: false
                },
                theme: 'vs',
                tabSize: 4
            }
        }

        
       // this.workspaceCoderState = new WorkspaceCoderMeta(props.namespace, {}, { value: props.value })
        
    }

    public bindEvent() {
        addEvent(window,'resize', this.resetHeight);
       
    }
    public resetHeight=()=> {
        let rect: any = this.panelCanvas.getBoundingClientRect();
        if (this.editor && rect && rect.height > 20) {
            this.editor.layout();
        }
    }
    public componentDidMount() {
        this.resetHeight();
    }
    public componentDidUpdate() {
       this.resetHeight();
    }
    public onChange =(e) => {
        this.workspaceState.get(this.props.namespace).onChange(e)
    }
    public render () {
        let coderState: any = this.workspaceState.get(this.props.namespace);
        return (
             <div className='workspace-coder-panel' >
                <Toolbar direction='horizontal' toolbar={this.toolbarNamespace} namespace={this.props.namespace} />
                <div className='workspace-coder-panel-inner' ref={(ref)=> this.panelCanvas=ref}>
                    <MonacoEditor
                        
                        width='100%'
                        height='100%'

                        language="sql"
                        theme={this.state.editorOptions.theme || 'vs'}
                        value={coderState.getValue()}
                        options={this.state.editorOptions}
                        onChange={this.onChange}
                        editorDidMount={(editor)=> {
                            this.editor = editor;
                            coderState.setContext(this);
                            
                            pluginManager.pipeline(this.editorNamespace, this.state, this)
                        }}
                    />
                </div>
            </div>
        )
    }

    public destory() {
        removeEvent(window,'resize', this.resetHeight);
        //this.modelCancel && this.modelCancel();
        console.log(333333)
        //this.workspacePanelState.destory();
    }
}