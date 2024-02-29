import React from 'react';
import { IconProps } from '../type';
import Icon from '@ant-design/icons';
import API from './svg/api.svg';


export default class Dot extends React.Component<IconProps> {
    public render() {
        return <Icon component={API} {...this.props} />
    }
}
