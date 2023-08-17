import PluginBase from '../../../../../core/Plugin';


import React from 'react';
import { Button } from 'antd';
import Widget, { WidgetDirectionType } from '../../../../../core/Widget';

import { SettingFilled } from '../../../../../../Icons'

class TestWidget44 extends Widget {
    public text: string =  '设置';
    public placeholder: string = '功能测试按钮';
    public index:number = 0;
    public direction: WidgetDirectionType = 'right';


    public renderChildren(props:any, key: string):React.ReactNode  {

        return <Button type="text" size="small" key={key}><SettingFilled {...props}/> {this.text}</Button>
    }

}

export default class Toolbar004 extends PluginBase {
    public constructor() {
        super();
        this.registerWidget('rightToolbar', new TestWidget44())
    }
}