import React from 'react';
import { Button } from 'antd';
import { 
    Icons, 
    EditorContext, 
    EditorBaseWidget,
    EditorBaseWidgetProps, 
    EditorRuntimeContext, 
    WidgetDirectionType 
} from '@blocksx/ui'


export default class RunerFollowWidget extends  EditorBaseWidget<EditorBaseWidgetProps,{}> {
    public ListenModels: any = [EditorRuntimeContext.name];

    public static index: number = 1;
    public static direction: WidgetDirectionType = 'left';
    
    public text: string = 'Run';
    public placeholder: string = 'Run the selection code';


    public constructor(props: EditorBaseWidgetProps) {
        super(props)
    }
    public shouldComponentDisplay() {
        return true;
    }
    public renderChildren() {
        return (
            <Button 
                size='small' 
                type='text' 
                icon={<Icons.StartCircleUtilityFilled/>} 
                onClick={this.plugin.runSelectionCode}
            />
        )
    }
}
