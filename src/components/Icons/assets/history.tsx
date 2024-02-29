import React from 'react';
import { IconProps } from '../type';
import Icon from '@ant-design/icons';
import historysvg from './svg/history.svg';


export default class History extends React.Component<IconProps> {
    public render() {
        return <Icon component={historysvg} {...this.props} />
    }
}
