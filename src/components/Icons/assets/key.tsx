import React from 'react';
import { IconProps } from '../type';
import Icon from '@ant-design/icons';
import Keysvg from './svg/key.svg';


export default class Key extends React.Component<IconProps> {
    public render() {
        return <Icon component={Keysvg} {...this.props} />
    }
}
