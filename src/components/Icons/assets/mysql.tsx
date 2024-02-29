import React from 'react';
import { IconProps } from '../type';
import Icon from '@ant-design/icons';
import monitorsvg from './svg/mysql.svg';


export default class MySQL extends React.Component<IconProps> {
    public render() {
        return <Icon component={monitorsvg} {...this.props} />
    }
}
