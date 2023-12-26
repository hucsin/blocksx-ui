/**
 * 
 */
 import React from 'react';
 import { Button } from 'antd';

 import { StateComponent, StateX } from '@blocksx/ui/StateX/index';
 import PluginBase from '@blocksx/ui/Editor/core/Plugin';
 import WidgetBase, { WidgetDirectionType } from '@blocksx/ui/Editor/core/Widget';
 import { ReloadOutlined, LoadingOutlined } from '@blocksx/ui/Icons';

 import { EditorResourceState } from '@blocksx/ui/Editor/states';

 
 
 
 class ResourceReflushComponent extends StateComponent<{
    namespace: string;
    text: string
 }> {
    private resourceState: EditorResourceState = StateX.findModel(EditorResourceState, 'resource');
    
    public constructor(props) {
        super(props);
    }
    public onClick =()=> {
        this.resourceState.reflushTree()
    }
    
    public render() {

        return (
            <Button type="text" size="small" onClick={this.onClick} >
                {this.resourceState.getLoadingState() ? <LoadingOutlined/> :<ReloadOutlined />} {this.props.text}
            </Button>
        )
    }
 }
 

 class ResourceReflushWidget extends WidgetBase {
    public text: string =  '';
    public placeholder: string = '刷新资源树';
    public index:number = 2;
    public direction: WidgetDirectionType = 'left';


    public renderChildren(props:any, key: string):React.ReactNode  {
        return (<ResourceReflushComponent {...props} key={key} text={this.text}/>)
    }

}



 export default class CodeRun extends PluginBase {
    public constructor() {
        super();
        this.registerWidget('toolbar', new ResourceReflushWidget())
    }
}