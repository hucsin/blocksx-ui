import React from 'react';
import Icon from '@ant-design/icons';
import toolbarBackSvg from './svg/productLayout.svg'; // path to your '*.svg' file.


export default class ProductLayout extends React.Component {
    public render() {
        return <Icon component={toolbarBackSvg} {...this.props} />
    }
}
