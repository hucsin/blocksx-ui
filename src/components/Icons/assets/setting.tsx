import React from 'react';
import Icon from '@ant-design/icons';
import settingsvg from './svg/setting.svg'; // path to your '*.svg' file.


export default class Setting extends React.Component {
    public render() {
        return <Icon component={settingsvg} {...this.props} />
    }
}
