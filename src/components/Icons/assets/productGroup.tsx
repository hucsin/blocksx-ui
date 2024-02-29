import React from 'react';
import { IconProps } from '../type';
import Icon from '@ant-design/icons';
import toolbarBackSvg from './svg/productGroup.svg'; // path to your '*.svg' file.


export default class ProductGroup extends React.Component<IconProps> {
    public render() {
        return <Icon component={toolbarBackSvg} {...this.props} />
    }
}
