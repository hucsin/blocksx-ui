/**
 * 编辑器组件
 */
import React from 'react';
import classnames from 'classnames';
import MonacoEditor from 'react-monaco-editor';
import StateComponent from '../StateX/Component';
import { PluginManager } from '../core/index';

import Toolbar from '../Toolbar';
import { resizeObserver } from '../utils/dom';


import './plugins';
import './style.scss';



interface EditorCoreProps {
    id: string;
    theme: string;
    options: any;
    namespace: string;

    disabledFeedback?: boolean;
}

interface EditorCoreState {
    value: string;
    options: any;
    editorHeight: number;
}
export default class EditorCore extends StateComponent<EditorCoreProps, EditorCoreState> {
    public static defaultProps = {
        theme: 'vs',
        disabledFeedback: false,
        namespace: 'EDITOR',
        options: {
            language: 'sql',
            minimap: {
                enabled: false
            },
            theme: 'vs',
            tabSize: 4
        }
    }
    private editorWrapper: any;
    private namespace: string;
    public monaco: any;

    public constructor(props: EditorCoreProps) {
        super(props);

        this.namespace = [props.namespace, props.id].join(':');
        this.state = {
            value: '',
            options: props.options,
            editorHeight: 0
        }

        PluginManager.mount(this.namespace, this)
    }
    public componentDidMount() {
        resizeObserver(this.editorWrapper, (e)=> {
            this.setState({
                editorHeight: e.height
            })
        })
    }
    public componentWillUnmount(): void {
        PluginManager.unmount(this.namespace)
    }

    private onChangeValue =(value: string)=> {
        this.setState({
            value: value
        })
    }
    public render() {
        return (
            <div className={classnames({
                'editor-core-wrapper': true,
                'editor-core-nofeadback': this.props.disabledFeedback
            })}>
                <Toolbar 
                    className='editor-core-toolbar' 
                    namespace={this.namespace} 
                    toolbar={[this.namespace, 'TOOLBAR'].join('.')} 
                    style={{
                        height: '35px'
                    }}
                />
                <div className='editor-core-inner' ref={e=>this.editorWrapper=e}>
                    <MonacoEditor
                        width='100%'
                        height={this.state.editorHeight}

                        language="sql"
                        theme={this.props.theme}
                        value={this.state.value}
                        options={this.state.options}
                        onChange={this.onChangeValue}
                        editorDidMount={(editor, monaco)=> {
                            this.monaco = editor;
                            console.log(editor, monaco)
                            //console.log(monaco.getContextMenuService, editor.getContextMenuService)
                            //coderState.setContext(this);
                            
                            PluginManager.loadon(this.namespace);
                        //  pluginManager.pipeline(this.editorNamespace, this.state, this)
                        }}
                    />
                </div>

                {!this.props.disabledFeedback && <Toolbar 
                    className='editor-core-feedback' 
                    namespace={this.namespace} 
                    toolbar={[this.namespace, 'FEEDBACK'].join('.')}
                    style={{
                        height: '25px'
                    }}
                />}
            </div>
        )
    }
}