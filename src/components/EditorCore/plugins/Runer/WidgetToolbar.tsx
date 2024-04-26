import React from 'react';
import { Button } from 'antd';
import { monaco } from 'react-monaco-editor';
import { Icons , EditorContext, EditorBaseWidget, WidgetDirectionType, EditorBaseWidgetProps } from '@blocksx/ui'
import EditorRuntimeContext from '../../core/EditorRuntimeContext';


export default class RunerDefaultWidget extends EditorBaseWidget<EditorBaseWidgetProps,{}> {

    public ListenModels: any = [ EditorRuntimeContext.name ];
    public static index: number = 1;
    public static direction: WidgetDirectionType = 'left';

    
    public text: string = 'Run';
    public placeholder: string = 'Run the code';
    public keybindings:any = [monaco.KeyMod.CtrlCmd, monaco.KeyCode.KeyR];


    public constructor(props: EditorBaseWidgetProps) {
        super(props);
    }
    
    public renderChildren() {
        return (
            <Button 
                size='small' 
                disabled={!this.runtimeContext.hasValue()} 
                onClick={this.plugin.runCode} 
                type='text' 
                icon={<Icons.StartCircleUtilityFilled/>}
            >
                {this.text}
            </Button>
        )
    }
}

