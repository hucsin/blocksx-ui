import React from 'react';
import { Space, Button, Tooltip, Divider } from 'antd';
import { TableAdd, ToolbarEnlarge,ToolbarNarrow } from '../Icons/index'
import i18n from '@blocksx/i18n';


export default class ToolAction extends React.Component {
    public constructor(props) {
        super(props)
    }

    public render() {
        return (
            <div className='hoofs-diagrams-action'>
                <Tooltip title={i18n.translate("新增数据对象")}>
                        <Button size="middle" icon={<TableAdd />} />
                </Tooltip>
                <Divider type="vertical" />
                <Space.Compact size='middle'>
                    <Tooltip title={i18n.translate("放大视图")}>
                        <Button icon={<ToolbarEnlarge />} />
                    </Tooltip>

                    <Tooltip title={i18n.translate("缩小视图")}>
                        <Button icon={<ToolbarNarrow />} />
                    </Tooltip>
                </Space.Compact>

            </div>
        )
    }
}