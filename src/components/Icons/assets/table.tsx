import React from 'react';
import { IconProps } from '../type';
import Icon from '@ant-design/icons';
import Tablesvg from './svg/table.svg';


export default class Table extends React.Component<IconProps> {
    public render() {
        return <Icon component={Tablesvg} {...this.props} />
    }
}
