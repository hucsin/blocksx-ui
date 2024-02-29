import React from 'react';
import { IconProps } from '../type';
import Icon from '@ant-design/icons';
import settingsvg from './svg/statistics.svg'; // path to your '*.svg' file.


export default class Statistics extends React.Component<IconProps> {
    public render() {
        return <Icon component={settingsvg} {...this.props} />
    }
}
