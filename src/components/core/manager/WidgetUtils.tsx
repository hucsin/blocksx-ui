import React from 'react';
import { Space, Divider } from 'antd'

export default class WidgetUtils {
    public static renderWidget(namespace: any, widgets: any[], space?: any) {
        return (
            <Space size='small'>
                {widgets.map((Widget: any, index:number) => {
                    return Widget 
                        ? <Widget.widget context={Widget.plugin.context} plugin={Widget.plugin} namespace={namespace} key={index}/> 
                        : !space && <Divider key={'d'+index} type="vertical" />
                })}
            </Space>
        )
    }
}