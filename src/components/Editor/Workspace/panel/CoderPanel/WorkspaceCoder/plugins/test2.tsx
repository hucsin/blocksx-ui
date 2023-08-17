import PluginBase from '../../../../../core/Plugin';


import React from 'react';
import { Button } from 'antd';
import Widget, { WidgetDirectionType } from '../../../../../core/Widget';

import { PlayCircleFilled,SaveFilled,FormatPainterFilled } from '../../../../../../Icons'

class TestWidget extends Widget {
    public text: string =  '保存';
    public placeholder: string = '功能测试按钮';
    public index:number = 0;
    public direction: WidgetDirectionType = 'left';


    public renderChildren(props:any, key: string):React.ReactNode  {

        return <Button type="text" size="small"  key={key}><SaveFilled {...props}/> {this.text}</Button>
    }

}

class TestWidget2 extends Widget {
    public text: string =  '格式化';
    public placeholder: string = '功能测试按钮';
    public index:number = 0;
    public direction: WidgetDirectionType = 'left';


    public renderChildren(props:any, key?: string):React.ReactNode  {

        return <Button type="text" size="small" key={key}><FormatPainterFilled {...props}/> {this.text}</Button>
    }

}


export default class Toolbar003 extends PluginBase {
    public constructor() {
        super();
        this.registerWidget('toolbar', new TestWidget())
        this.registerWidget('toolbar', new TestWidget2())
    }
}