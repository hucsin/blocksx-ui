import React from 'react';
import { IconProps } from '../type';
import Icon from '@ant-design/icons';
import document from './svg/charging.svg';


export default class Dot extends React.Component<IconProps> {
    public render() {
        return <Icon component={document} {...this.props} />
    }
}
