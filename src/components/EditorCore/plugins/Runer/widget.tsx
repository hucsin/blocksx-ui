import React from 'react';
import { Button } from 'antd';
import * as Icons from '../../../Icons';

import { WidgetBase, WidgetDirectionType } from '../../../core/index';


export default class RunerWidget extends WidgetBase<{namespace: string, context: any},{}> {
    public text: string = 'Run';
    public placeholder: string = 'Run the code';

    public static index: number = 1;
    public static direction: WidgetDirectionType = 'left'

    public constructor(props: any) {
        super(props)
    }

    public renderChildren() {
        return (
            <>
                <Button size='small' onClick={()=>{
                    console.log(this.props.context.monaco.getValue())

                }} type='text' icon={<Icons.StartCircleUtilityFilled/>}>{this.text}</Button>
                <Button size='small' type='text' icon={<Icons.HistoryOutlined/>} ></Button>
            </>
        )

    }
}
