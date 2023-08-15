
import React from 'react';
import Widget from '../../../core/Widget';

import { Setting } from '../../../../Icons'

export default class TestWidget extends Widget {
    public name: string =  '';
    public placeholder: string = '功能测试按钮'

    public renderChildren(props:any):React.ReactNode  {

        return <Setting {...props}/>
    }

}