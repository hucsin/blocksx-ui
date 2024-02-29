import React from 'react';
import { IconProps } from '../type';
import Icon from '@ant-design/icons';
import toolbarBackSvg from './svg/productModel.svg'; // path to your '*.svg' file.


export default class ProductModel extends React.Component<IconProps> {
    public render() {
        return <Icon component={toolbarBackSvg} {...this.props} />
    }
}
