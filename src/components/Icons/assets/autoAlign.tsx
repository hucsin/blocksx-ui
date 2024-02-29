import React from 'react';
import { IconProps } from '../type';
import Icon from '@ant-design/icons';
import autoAlign from './svg/autoAlign.svg';


export default class AutoAlign extends React.Component<IconProps> {
    public render() {
        return <Icon component={autoAlign} {...this.props} />
    }
}
