import React from 'react';
import Icon from '@ant-design/icons';
import toolbarLock from './svg/toolbarLock.svg'; // path to your '*.svg' file.

export default class ToolbarLock extends React.Component {
    public render() {
        return <Icon component={toolbarLock} {...this.props}/>
    }
}
