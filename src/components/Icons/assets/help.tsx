import React from 'react';
import { IconProps } from '../type';
import Icon from '@ant-design/icons';
import help from './svg/help.svg';


export default class Dot extends React.Component<IconProps> {
    public render() {
        return <Icon component={help} {...this.props} />
    }
}
