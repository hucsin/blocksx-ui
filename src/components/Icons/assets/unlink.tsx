import React from 'react';
import { IconProps } from '../type';
import Icon from '@ant-design/icons';
import unlink from './svg/unlink.svg'; // path to your '*.svg' file.


export default class Inbox extends React.Component<IconProps> {
    public render() {
        return <Icon component={unlink} {...this.props} />
    }
}
