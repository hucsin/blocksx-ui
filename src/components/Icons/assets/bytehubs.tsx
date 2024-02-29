import React from 'react';
import { IconProps } from '../type';
import Icon from '@ant-design/icons';
import bytehubssvg from './svg/bytehubs.svg'; // path to your '*.svg' file.


export default class Bytehubs extends React.Component<IconProps> {
    public render() {
        return <Icon component={bytehubssvg} {...this.props} />
    }
}
