import React from 'react';
import Icon from '@ant-design/icons';
import monitorsvg from './svg/monitor.svg';


export default class Monitor extends React.Component {
    public render() {
        return <Icon component={monitorsvg} {...this.props} />
    }
}
