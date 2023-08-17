
import React from 'react';
import Widget, { WidgetDirectionType } from '@blocksx-ui/Editor/core/Widget';

import { Setting } from '@blocksx-ui/Icons'

export default class TestWidget extends Widget {
    public text: string =  '';
    public placeholder: string = '功能测试按钮';
    public index:number = 0;
    public direction: WidgetDirectionType = 'left';


    public renderChildren(props:any):React.ReactNode  {

        return <Setting {...props}/>
    }

}