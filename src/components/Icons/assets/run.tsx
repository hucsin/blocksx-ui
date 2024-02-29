import React from 'react';
import { IconProps } from '../type';
import Icon from '@ant-design/icons';
import scheduledsvg from './svg/run.svg'; // path to your '*.svg' file.


export default class Scheduled extends React.Component<IconProps> {
    public render() {
        return <Icon component={scheduledsvg} {...this.props} />
    }
}
