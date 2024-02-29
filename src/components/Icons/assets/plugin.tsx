import React from 'react';
import { IconProps } from '../type';
import Icon from '@ant-design/icons';
import inboxsvg from './svg/plugin.svg'; // path to your '*.svg' file.


export default class Plugin extends React.Component<IconProps> {
    public render() {
        return <Icon component={inboxsvg} {...this.props} />
    }
}
