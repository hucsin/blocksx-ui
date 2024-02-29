import React from 'react';
import { IconProps } from '../type';
import Icon from '@ant-design/icons';
import Publishsvg from './svg/publish.svg';


export default class Publish extends React.Component<IconProps> {
    public render() {
        return <Icon component={Publishsvg} {...this.props} />
    }
}
