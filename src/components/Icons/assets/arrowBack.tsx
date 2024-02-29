import React from 'react';
import { IconProps } from '../type';
import Icon from '@ant-design/icons';
import arrowBack from './svg/arrowBack.svg';


export default class ArrowBack extends React.Component<IconProps> {
    public render() {
        return <Icon component={arrowBack} {...this.props} />
    }
}
