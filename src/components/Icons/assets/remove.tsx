import React from 'react';
import { IconProps } from '../type';
import Icon from '@ant-design/icons';
import removesvg from './svg/remove.svg';


export default class Remove extends React.Component<IconProps> {
    public render() {
        return <Icon component={removesvg} {...this.props} />
    }
}
