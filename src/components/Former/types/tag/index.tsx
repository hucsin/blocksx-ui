import React from 'react';
import { Tag } from 'antd';

export default class FormerTag extends React.Component<any> {
    public static Viewer = FormerTag;
    public render() {
        if (this.props.value) {
            return (
                <Tag color={this.props.color}>{this.props.value}</Tag>
            )
        }
    }
}