import React from 'react';
import { IconProps } from '../type';
import Icon from '@ant-design/icons';
import relyRelatedsvg from './svg/reverseRelated.svg'; // path to your '*.svg' file.


export default class RelyRelated extends React.Component<IconProps> {
    public render() {
        return <Icon component={relyRelatedsvg} {...this.props} />
    }
}
