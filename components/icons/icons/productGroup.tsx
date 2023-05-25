import React from 'react';
import Icon from '@ant-design/icons';
import toolbarBackSvg from './svg/productGroup.svg'; // path to your '*.svg' file.


export default class ProductGroup extends React.Component {
    public render() {
        return <Icon component={toolbarBackSvg} {...this.props} />
    }
}
