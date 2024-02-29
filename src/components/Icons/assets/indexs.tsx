import React from 'react';
import { IconProps } from '../type';
import Icon from '@ant-design/icons';
import indexssvg from './svg/indexs.svg'; // path to your '*.svg' file.


export default class Indexs extends React.Component<IconProps> {
    public render() {
        return <Icon component={indexssvg} {...this.props} />
    }
}
