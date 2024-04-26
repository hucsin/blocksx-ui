/**
 * 
 */
 import React from 'react';
 import { Button } from 'antd';

 import { StateComponent, StateX } from '@blocksx/ui/StateX/index';
 import PluginBase from '@blocksx/ui/Editor/core/Plugin';
 import WidgetBase, { WidgetDirectionType } from '@blocksx/ui/Editor/core/Widget';
 import { PlayCircleFilled } from '@blocksx/ui/Icons';

 import { EditorWorkspaceState, EditorWorkspacePanelState } from '@blocksx/ui/Editor/states';
 import { RecordMetaData } from '@blocksx/ui/Editor/Feedback/panel'

 
 
 class CodeRunComponent extends StateComponent<{
    namespace: string;
    text: string
 }> {
    private workspaceState: EditorWorkspaceState = StateX.findModel(EditorWorkspaceState);
    
    public constructor(props) {
        super(props);
    }
    public onClick =()=> {
        let currentPanel: any = this.workspaceState.getCurrentPanel();
        let { editor } = currentPanel.getContext();
        let feedback:any  = this.workspaceState.getCurrentFeedback();
        let { root = {} } = currentPanel.getProp('router') || {};
        let router: any = currentPanel.getState('router');
        
        let record: any = new RecordMetaData([this.props.namespace, 'RECORD'].join('.'), {
            code: editor.getValue(),
            databaseId: root.id,
            schema: router
        });
        
        this.workspaceState.layoutState.showFeedbackDisplay();
        this.workspaceState.resetErrorMessage();
        
        feedback.open(record)
    }
    
    public render() {
        let currentPanel: EditorWorkspacePanelState = this.workspaceState.getCurrentPanel();

        return (
            <Button type="text" size="small" onClick={this.onClick} disabled={currentPanel && !currentPanel.getValue()}>
                <PlayCircleFilled /> {this.props.text}
            </Button>
        )
    }
 }
 

 class CodeRunWidget extends WidgetBase {
    public text: string =  '执行';
    public placeholder: string = '点击运行代码';
    public index:number = 0;
    public direction: WidgetDirectionType = 'left';


    public renderChildren(props:any, key: string):React.ReactNode  {
        return (<CodeRunComponent {...props} key={key} text={this.text}/>)
    }

}



 export default class CodeRun extends PluginBase {
    public constructor() {
        super();
        this.registerWidget('toolbar', new CodeRunWidget())
    }
}