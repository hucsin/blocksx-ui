import React from 'react';
import Icon from '@ant-design/icons';
import toolbarBackSvg from './svg/productService.svg'; // path to your '*.svg' file.


export default class ProductService extends React.Component {
    public render() {
        return <Icon component={toolbarBackSvg} {...this.props} />
    }
}
