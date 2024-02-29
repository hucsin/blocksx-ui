import React from 'react';
import { IconProps } from '../type';
import Icon from '@ant-design/icons';
import Dotsvg from './svg/connections.svg';


export default class Connections extends React.Component<IconProps> {
    public render() {
        return <Icon component={Dotsvg} {...this.props} />
    }
}
