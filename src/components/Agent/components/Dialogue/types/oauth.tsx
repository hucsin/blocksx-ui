import React from 'react';
import { Button } from 'antd';
import SmartRequest from '../../../../utils/SmartRequest';
import SmartAction from '../../../../core/SmartAction';
import { OpenWindowUtilityOutlined } from '../../../../Icons';

export default function OAuth(props: any) {
    console.log(props, 'OAuth')
    return (
        <Button icon={<OpenWindowUtilityOutlined/>} type="default" size="small" block onClick={() => {
            
            SmartAction.doAction({
                smartaction: 'window',
                url: SmartRequest.getRequestURI(props.url)
            }, () => {

            })
        }}>{props.title}</Button>
    )
}