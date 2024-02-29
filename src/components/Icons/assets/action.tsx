import React from 'react';
import { IconProps } from '../type';
import Icon from '@ant-design/icons';
import actionsvg from './svg/action.svg'; // path to your '*.svg' file.


export default class Action extends React.Component<IconProps> {
    public render() {
        return <Icon component={actionsvg} {...this.props} />
    }
}
