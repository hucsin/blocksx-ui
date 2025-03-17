import React from 'react';
import { IconProps } from '../type';
import Icon from '@ant-design/icons';
import iconsvg from './svg/outlined/detection-utility.svg?react';

export default class DetectionUtilityOutlined extends React.Component<IconProps> {
    public render() {
        let  props: any = this.props;
        return <Icon component={iconsvg} {...props} />
    }
}
