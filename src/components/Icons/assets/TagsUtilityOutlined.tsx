import React from 'react';
import { IconProps } from '../type';
import Icon from '@ant-design/icons';
import iconsvg from './svg/outlined/tags-utility.svg?react';

export default class TagsUtilityOutlined extends React.Component<IconProps> {
    public render() {
        let  props: any = this.props;
        return <Icon component={iconsvg} {...props} />
    }
}
