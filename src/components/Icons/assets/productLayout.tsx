import React from 'react';
import { IconProps } from '../type';
import Icon from '@ant-design/icons';
import toolbarBackSvg from './svg/productLayout.svg'; // path to your '*.svg' file.


export default class ProductLayout extends React.Component<IconProps> {
    public render() {
        return <Icon component={toolbarBackSvg} {...this.props} />
    }
}
