/**
 * 
 */
 import React from 'react';
 import { Button } from 'antd';

 import { format } from 'sql-formatter'

 import { StateComponent, StateX } from '@blocksx/ui/StateX/index';
 import PluginBase from '@blocksx/ui/Editor/core/Plugin';
 import WidgetBase, { WidgetDirectionType } from '@blocksx/ui/Editor/core/Widget';
 import { SaveFilled,FormatPainterFilled } from '@blocksx/ui/Icons';

 import { EditorWorkspaceState } from '@blocksx/ui/Editor/states'

 
 

 class CodeFormatComponent extends StateComponent<{
    text: string
 }> {
    private workspaceState: EditorWorkspaceState = StateX.findModel(EditorWorkspaceState)
    public constructor(props) {
        super(props);
    }
    public onClick =()=> {
        let { editor } = this.workspaceState.getCurrentPanel().getContext();

        if (editor) {
            editor.setValue(format(editor.getValue(), {language:'mysql'}))
        }
    }
    public render() {
        
        return (
            <Button type="text" size="small" onClick={this.onClick}>
                <FormatPainterFilled /> {this.props.text}
            </Button>
        )
    }
 }


 class CodeFormatWidget extends WidgetBase {
    public text: string =  '格式化';
    public placeholder: string = '格式化当前代码';
    public index:number = 0;
    public direction: WidgetDirectionType = 'left';


    public renderChildren(props:any, key: string):React.ReactNode  {

        return (<CodeFormatComponent {...props} key={key} text={this.text}/>)
    }
}


 
 class CodeSaveComponent extends StateComponent<{
    text: string
 }> {
    private workspaceState: EditorWorkspaceState = StateX.findModel(EditorWorkspaceState)
    public constructor(props) {
        super(props);
    }
    public onClick =()=> {
        this.workspaceState.onSave()
    }
    public render() {
        
        return (
            <Button type="text" size="small" onClick={this.onClick} disabled={!this.workspaceState.isChanged()}>
                <SaveFilled /> {this.props.text}
            </Button>
        )
    }
 }
 
 class CodeSaveWidget extends WidgetBase {
    public text: string =  '保存';
    public placeholder: string = '保存当前变更代码';
    public index:number = 0;
    public direction: WidgetDirectionType = 'left';


    public renderChildren(props:any, key: string):React.ReactNode  {

        return (<CodeSaveComponent {...props} key={key} text={this.text}/>)
    }
}



 export default class CodeModify extends PluginBase {
    public constructor() {
        super();
        this.registerWidget('toolbar', new CodeSaveWidget());
        this.registerWidget('toolbar', new CodeFormatWidget())
    }
}