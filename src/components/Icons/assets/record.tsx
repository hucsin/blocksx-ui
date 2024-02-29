import React from 'react';
import { IconProps } from '../type';
import Icon from '@ant-design/icons';
import recordsvg from './svg/record.svg';


export default class Record extends React.Component<IconProps> {
    public render() {
        return <Icon component={recordsvg} {...this.props} />
    }
}
