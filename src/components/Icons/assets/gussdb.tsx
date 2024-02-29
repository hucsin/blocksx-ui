import React from 'react';
import { IconProps } from '../type';
import Icon from '@ant-design/icons';
import svg from './svg/gussdb.svg'; // path to your '*.svg' file.


export default class IconView extends React.Component<IconProps> {
    public render() {
        return <Icon component={svg} {...this.props} />
    }
}
