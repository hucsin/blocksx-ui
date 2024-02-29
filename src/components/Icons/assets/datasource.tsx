import React from 'react';
import { IconProps } from '../type';
import Icon from '@ant-design/icons';
import datasourcesvg from './svg/datasource.svg'; // path to your '*.svg' file.


export default class Datasource extends React.Component<IconProps> {
    public render() {
        return <Icon component={datasourcesvg} {...this.props} />
    }
}
