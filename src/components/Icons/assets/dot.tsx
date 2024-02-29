import React from 'react';
import { IconProps } from '../type';
import Icon from '@ant-design/icons';
import Dotsvg from './svg/dot.svg';


export default class Dot extends React.Component<IconProps> {
    public render() {
        return <Icon component={Dotsvg} {...this.props} />
    }
}
