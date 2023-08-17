import React from 'react';
import MonacoEditor from 'react-monaco-editor';
import EditorWorkspacePanelState from '@blocksx-ui/Editor/states/WorkspacePanel';
import Toolbar from '@blocksx-ui/Editor/Toolbar';
import { pluginManager, resourceManager } from '@blocksx-ui/Editor/core/manager';
import { addEvent, removeEvent } from '@blocksx-ui/utils/dom';
import { StateComponent } from '@blocksx-ui/StateX';
import { StateX } from '@blocksx-ui/StateX'


import './style.scss';
import './plugins/index'


interface WorkspaceCoderProps {
    namespace: string;
    value?: string;

}

export default class WorkspaceCoder extends StateComponent<WorkspaceCoderProps, {
    height: number;
    editorOptions?: any
}>{
    private staticNamespace: string = 'WORKSPACE.CODER.TOOLBAR';
    private panelCanvas: any;
    private modelCancel: any;
    private workspacePanelState: EditorWorkspacePanelState;
    private editor:any ;
    public constructor(props:WorkspaceCoderProps) {
        super(props);
        this.state = {
            height: 0,
            editorOptions: resourceManager.find([this.staticNamespace, 'CONFIG']) || {
                minimap: {
                    enabled: false
                },
                theme: 'vs'
            }
        }
        
        this.modelCancel = StateX.registerModel(
            this.workspacePanelState = new EditorWorkspacePanelState(props.namespace, props.value)
        )
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

        this.workspacePanelState.onChange(e);
    }
    public render () {
        return (
             <div className='workspace-coder-panel' >
                <Toolbar direction='horizontal' toolbar={this.staticNamespace} namespace={this.props.namespace} />
                <div className='workspace-coder-panel-inner' ref={(ref)=> this.panelCanvas=ref}>
                    <MonacoEditor
                        
                        width='100%'
                        height='100%'

                        language="sql"
                        theme={this.state.editorOptions.theme || 'vs'}
                        value={this.workspacePanelState.getValue()}
                        options={pluginManager.pipeline(this.staticNamespace, this.state.editorOptions, this)}
                        onChange={this.onChange}
                        editorDidMount={(editor)=> {
                            this.editor = editor;
                            this.workspacePanelState.setContext(editor);
                        }}
                    />
                </div>
            </div>
        )
    }

    public destory() {
        removeEvent(window,'resize', this.resetHeight);
        this.modelCancel && this.modelCancel();
    }
}