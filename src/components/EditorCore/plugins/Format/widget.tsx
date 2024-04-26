import React from 'react';
import { Button } from 'antd';
import * as Icons from '../../../Icons';

import { WidgetBase, WidgetDirectionType } from '../../../core/index';


export default class FormatWidget extends WidgetBase<{namespace: string},{}> {
    public text: string = 'Format';
    public placeholder: string = 'Format the code';

    public static index: number = 1;
    public static direction: WidgetDirectionType = 'left'

    public constructor(props: any) {
        super(props)
    }

    public renderChildren() {
        return <Button size='small' type='text' icon={<Icons.AlignLeftOutlined/>}>{this.text}</Button>;
    }
}
