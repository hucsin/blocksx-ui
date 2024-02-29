import React from 'react';
import { IconProps } from '../type';
import Icon from '@ant-design/icons';
import relatedsvg from './svg/related.svg'; // path to your '*.svg' file.


export default class Related extends React.Component<IconProps> {
    public render() {
        return <Icon component={relatedsvg} {...this.props} />
    }
}
