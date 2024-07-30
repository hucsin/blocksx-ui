/**
 * 编辑器组件
 */
import React from 'react';
import classnames from 'classnames';
import MonacoEditor from 'react-monaco-editor';

import { 
    ContextMenu, 
    StateComponent, 
    PluginManager,
    EditorContext
} from '@blocksx/ui';


import Toolbar from '../../../components/Toolbar';
import EditorFollowBar from './core/EditorFollowBar';
import { resizeObserver } from '../../../components/utils/dom';

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
            tabSize: 4,
            contextmenu: false
        }
    }
    private editorWrapper: any;
    private namespace: string;

    public editorContext: EditorContext;

    public constructor(props: EditorCoreProps) {
        super(props);

        this.namespace = [props.namespace, props.id].join(':');
        this.state = {
            value: '',
            options: props.options,
            editorHeight: 0
        }
        this.editorWrapper = React.createRef();

        PluginManager.mount(this.namespace, this.editorContext = new EditorContext(this))
    }
    public componentDidMount() {
        
        resizeObserver(this.editorWrapper.current, (e)=> {
            this.setState({
                editorHeight: e.height - 4
            })
        })
    }
    public componentWillUnmount(): void {
        PluginManager.unmount(this.namespace)
    }

    private onChangeValue =(value: string)=> {
        this.editorContext.runtimeContext.setValue(value);
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
                <ContextMenu
                    
                    namespace={this.namespace}
                />
                
                <div className='editor-core-inner' ref={this.editorWrapper}>
                    <EditorFollowBar namespace={this.namespace} toolbar={[this.namespace, 'TOOLBAR'].join('.')}  editorContext={this.editorContext}/>
                    <MonacoEditor
                        width='100%'
                        height={this.state.editorHeight}
                        
                        language="sql"
                        theme={this.props.theme}
                        value={this.editorContext.runtimeContext.getValue()}
                        options={this.state.options}
                        onChange={this.onChangeValue}
                        editorDidMount={(editor, monaco)=> {
                            
                            this.editorContext.setMonacoEditor(editor, monaco);

                            editor.onContextMenu((editorEvent: any)=> {
                                editorEvent.event.preventDefault();
                                editorEvent.event.clientX = editorEvent.event.posx;
                                editorEvent.event.clientY = editorEvent.event.posy;
                                ContextMenu.showContextMenu(this.namespace, editorEvent.event, this.editorContext)
                            })

                            PluginManager.loadon(this.namespace);
                        
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