import React from 'react';
import { IconProps } from '../type';
import Icon from '@ant-design/icons';
import toolbarBackSvg from './svg/productService.svg'; // path to your '*.svg' file.


export default class ProductService extends React.Component<IconProps> {
    public render() {
        return <Icon component={toolbarBackSvg} {...this.props} />
    }
}
