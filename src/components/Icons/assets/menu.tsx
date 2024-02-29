import React from 'react';
import { IconProps } from '../type';
import Icon from '@ant-design/icons';
import actionsvg from './svg/menu.svg'; // path to your '*.svg' file.


export default class Menu extends React.Component<IconProps> {
    public render() {
        return <Icon component={actionsvg} {...this.props} />
    }
}
