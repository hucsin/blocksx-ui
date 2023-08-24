/*
 * @Author: your name
 * @Date: 2020-10-10 14:13:10
 * @LastEditTime: 2022-06-19 14:49:01
 * @LastEditors: wangjian366 wangjian366@pingan.com.cn
 * @Description: In User Settings Edit
 * @FilePath: /designer/Users/iceet/work/hucsin/blocksx/packages/design-components/src/diagram/toolbar.tsx
 */
import React from 'react';
import { ToolbarBack, ToolbarEnlarge, ToolbarForward, ToolbarNarrow } from '@blocksx/design-components/lib/icons';
import { Tooltip, Divider } from 'antd';
import { number } from '../former/types';

interface ToolbarProps {
    historyCurrentIndex?: number;
    historyTotal?: number;
    diagram: any;
    zoom: number;
}
interface ToolbarState {
    historyCurrentIndex?: number;
    historyTotal?: number;
    zoom: number;
}

export default class Toolbar extends React.Component<ToolbarProps, ToolbarState> {

    private diagram: any;

    public constructor(props: any) {
        super(props);

        this.state = {
            historyCurrentIndex: props.historyCurrentIndex,
            historyTotal: props.historyTotal,
            zoom: props.zoom
        };
        
        this.diagram = props.diagram;
    }
    
    public UNSAFE_componentWillReceiveProps(newProps: ToolbarProps) {
        if (newProps.historyTotal != this.state.historyTotal) {
            this.setState({
                historyTotal: newProps.historyTotal
            })
        }
        if (newProps.historyCurrentIndex != this.state.historyCurrentIndex) {
            this.setState({
                historyCurrentIndex: newProps.historyCurrentIndex
            })
        }
        if (newProps.zoom != this.state.zoom) {
            this.setState({
                zoom: newProps.zoom
            })
        }
    }

    private onBackward =()=> {
        this.diagram.history.backward();
    }
    private onForward =()=> {
        this.diagram.history.forward();
    }
    private setZoom(step: number) {
        this.diagram.canvasManage.setZoom(this.state.zoom + step);
    }
    private onNarrow =()=> {
        this.setZoom(-0.1)
    }

    private onEnlarge =()=> {
        this.setZoom(0.1)
    }

    public render() {

        let { historyCurrentIndex = -1, historyTotal = 0, zoom } = this.state;
        
        let disBack = 0 && historyCurrentIndex > 1 && historyTotal > 0;
        let disForward = 0&& historyCurrentIndex <= historyTotal - 1 && historyTotal > 0;
        let disEnlarge = zoom < this.diagram.canvasManage.zoomMaxNumber;
        let disNarrow = zoom > this.diagram.canvasManage.zoomMinNumber;
        

        return (<div className="design-diagram-toolbar">
                    {disBack ? <Tooltip title="向后回退一次操作" mouseEnterDelay={1}>
                        <span  data-toolbar  onClick={this.onBackward}><ToolbarBack /></span>
                    </Tooltip> : <ToolbarBack /> }
                    {disForward ? <Tooltip title="向前回退一次操作" mouseEnterDelay={1}>
                        <span  data-toolbar  onClick={this.onForward}><ToolbarForward /></span>
                    </Tooltip>: <ToolbarForward /> }
                    <Divider type="vertical" />
                    {disEnlarge ? <Tooltip  title="画布放大" mouseEnterDelay={1}>
                        <span data-toolbar onClick={this.onEnlarge}><ToolbarEnlarge  /></span>
                    </Tooltip>: <ToolbarEnlarge /> }
                    {disNarrow? <Tooltip title="画布缩小" mouseEnterDelay={1}>
                        <span data-toolbar onClick={this.onNarrow}><ToolbarNarrow /></span>
                    </Tooltip>: <ToolbarNarrow /> }
            </div>);
    }
}