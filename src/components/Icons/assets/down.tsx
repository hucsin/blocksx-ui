import React from 'react';
import { IconProps } from '../type';
import Icon from '@ant-design/icons';
import upsvg from './svg/down.svg';


export default class Down extends React.Component<IconProps> {
    public render() {
        return <Icon component={upsvg} {...this.props} />
    }
}
