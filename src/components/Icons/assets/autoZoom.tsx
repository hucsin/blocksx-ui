import React from 'react';
import { IconProps } from '../type';
import Icon from '@ant-design/icons';
import autoZoom from './svg/autoZoom.svg';


export default class AutoZoom extends React.Component<IconProps> {
    public render() {
        return <Icon component={autoZoom} {...this.props} />
    }
}
