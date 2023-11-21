import React from 'react';
import Icon from '@ant-design/icons';
import settingsvg from './svg/statistics.svg'; // path to your '*.svg' file.


export default class Statistics extends React.Component {
    public render() {
        return <Icon component={settingsvg} {...this.props} />
    }
}
