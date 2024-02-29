import React from 'react';
import { IconProps } from '../type';
import Icon from '@ant-design/icons';
import Dotsvg from './svg/dbquery-mini.svg';


export default class DBqueryMini extends React.Component<IconProps> {
    public render() {
        return <Icon component={Dotsvg} {...this.props} />
    }
}
