import React from 'react';
import Icon from '@ant-design/icons';
import toolbarBackSvg from './svg/productTrigger.svg'; // path to your '*.svg' file.


export default class ProductTrigger extends React.Component {
    public render() {
        return <Icon component={toolbarBackSvg} {...this.props} />
    }
}
