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
 import { HistoryMetaData } from '@blocksx/ui/Editor/Feedback/panel'

 
 
 
 class CodeRunComponent extends StateComponent<{
    namespace: string;
    text: string
 }> {
    private workspaceState: EditorWorkspaceState = StateX.findModel(EditorWorkspaceState);
    
    public constructor(props) {
        super(props);
    }
    public onClick =()=> {
        let { editor } = this.workspaceState.getCurrentPanel().getContext();
        let feedback:any  = this.workspaceState.getCurrentFeedback();
        let history: any = new HistoryMetaData([this.props.namespace, 'HISTORY'].join('.'), null);
        
        history.push({
            code: editor.getValue(),
            time: new Date().toString().split(' ')[4],
            cost: '232ms'
        })
        console.log(feedback)
        this.workspaceState.layoutState.showFeedbackDisplay();

        feedback.open(history)
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