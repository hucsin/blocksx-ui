import React from 'react';
import Icon from '@ant-design/icons';
import toolbarForward from './svg/toolbarForward.svg'; // path to your '*.svg' file.

export default class ToolbarForward extends React.Component {
    public render() {
        return <Icon component={toolbarForward} {...this.props}/>
    }
}
