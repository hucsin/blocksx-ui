import React from 'react';
import Icon from '@ant-design/icons';
import toolbarEnlargeSvg from './svg/toolbarEnlarge.svg'; // path to your '*.svg' file.

export default class ToolbarEnlarge extends React.Component {
    public render() {
        return <Icon component={toolbarEnlargeSvg} {...this.props}/>
    }
}
