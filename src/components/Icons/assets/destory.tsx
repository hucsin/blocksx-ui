import React from 'react';
import { IconProps } from '../type';
import Icon from '@ant-design/icons';
import destroy from './svg/destroy.svg'; // path to your '*.svg' file.


export default class Inbox extends React.Component<IconProps> {
    public render() {
        return <Icon component={destroy} {...this.props} />
    }
}
