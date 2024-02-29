import React from 'react';
import { IconProps } from '../type';
import Icon from '@ant-design/icons';
import User from './svg/user.svg';


export default class Dot extends React.Component<IconProps> {
    public render() {
        return <Icon component={User} {...this.props} />
    }
}
