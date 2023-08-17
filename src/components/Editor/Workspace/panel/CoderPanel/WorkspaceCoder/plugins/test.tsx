import PluginBase from '../../../../../core/Plugin';


import React from 'react';
import { Button } from 'antd';
import Widget, { WidgetDirectionType } from '../../../../../core/Widget';

import { PlayCircleFilled } from '../../../../../../Icons'

class TestWidget3 extends Widget {
    public text: string =  '执行';
    public placeholder: string = '功能测试按钮';
    public index:number = 0;
    public direction: WidgetDirectionType = 'left';


    public renderChildren(props:any, key: string):React.ReactNode  {

        return <Button type="text" size="small"><PlayCircleFilled key={key} {...props}/> {this.text}</Button>
    }

}

export default class Toolbar001 extends PluginBase {
    public constructor() {
        super();
        this.registerWidget('toolbar', new TestWidget3())
    }
}