import React from 'react';
import { IconProps } from '../type';
import Icon from '@ant-design/icons';
import iconsvg from './svg/outlined/google-todo-brand.svg?react';

export default class GoogleTodoBrandOutlined extends React.Component<IconProps> {
    public render() {
        let  props: any = this.props;
        return <Icon component={iconsvg} {...props} />
    }
}
