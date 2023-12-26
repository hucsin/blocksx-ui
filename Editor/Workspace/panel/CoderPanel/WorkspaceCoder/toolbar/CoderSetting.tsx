import PluginBase from '@blocksx/ui/Editor/core/Plugin';


import React from 'react';
import { Button } from 'antd';
import Widget, { WidgetDirectionType } from '@blocksx/ui/Editor/core/Widget';

import { SettingFilled } from '@blocksx/ui/Icons'

class CoderSettingComponent extends Widget {
    public text: string =  '';
    public placeholder: string = '功能测试按钮';
    public index:number = 0;
    public direction: WidgetDirectionType = 'right';


    public renderChildren(props:any, key: string):React.ReactNode  {

        return <Button type="text" size="small" key={key}><SettingFilled {...props}/>{this.text}</Button>
    }

}

export default class CoderSetting extends PluginBase {
    public constructor() {
        super();
        this.registerWidget('rightToolbar', new CoderSettingComponent())
    }
}