import React from 'react';
import Icon from '@ant-design/icons';
import scheduledsvg from './svg/run.svg'; // path to your '*.svg' file.


export default class Scheduled extends React.Component {
    public render() {
        return <Icon component={scheduledsvg} {...this.props} />
    }
}
