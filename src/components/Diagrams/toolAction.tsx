import React from 'react';
import { Space, Button, Tooltip, Divider } from 'antd';
import { TableAdd, ToolbarEnlarge,ToolbarNarrow } from '../Icons/index'
import i18n from '@blocksx/i18n';


export default class ToolAction extends React.Component<{diag?:any,zoom: number},{zoom: number}>{
    public constructor(props) {
        super(props);
        this.state = {
            zoom: props.zoom
        }
    }

    public UNSAFE_componentWillReceiveProps (newProps: any) {
        if (newProps.zoom!= this.state.zoom) {
            this.setState({
                zoom: newProps.zoom
            })
        }
    }
    public render() {
        return (
            <div className='hoofs-diagrams-action'>
                <Tooltip title={i18n.translate("新增数据对象")}>
                        <Button onClick={()=> {
                            this.props.diag.addTable()
                        }} size="middle" icon={<TableAdd />} />
                </Tooltip>
                <Divider type="vertical" />
                <Space.Compact size='middle'>
                    <Tooltip title={i18n.translate("放大视图")}>
                        <Button disabled={this.state.zoom >= 2} onClick={()=> {this.props.diag.setZoom(1)}} icon={<ToolbarEnlarge />} />
                    </Tooltip>

                    <Tooltip title={i18n.translate("缩小视图")}>
                        <Button disabled={this.state.zoom< 0.4} onClick={()=> {this.props.diag.setZoom(-1)}}  icon={<ToolbarNarrow />} />
                    </Tooltip>
                </Space.Compact>

            </div>
        )
    }
}