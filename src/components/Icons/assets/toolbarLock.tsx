import React from 'react';
import { IconProps } from '../type';
import Icon from '@ant-design/icons';
import toolbarLock from './svg/toolbarLock.svg'; // path to your '*.svg' file.

export default class ToolbarLock extends React.Component<IconProps> {
    public render() {
        return <Icon component={toolbarLock} {...this.props}/>
    }
}
