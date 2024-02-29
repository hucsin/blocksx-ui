import React from 'react';
import { IconProps } from '../type';
import Icon from '@ant-design/icons';
import DataPipeline from './svg/DataPipeline.svg';


export default class Dot extends React.Component<IconProps> {
    public render() {
        return <Icon component={DataPipeline} {...this.props} />
    }
}
