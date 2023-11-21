import React from 'react';
import Icon from '@ant-design/icons';
import DataPipeline from './svg/DataPipeline.svg';


export default class Dot extends React.Component {
    public render() {
        return <Icon component={DataPipeline} {...this.props} />
    }
}
