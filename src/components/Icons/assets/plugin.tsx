import React from 'react';
import Icon from '@ant-design/icons';
import inboxsvg from './svg/plugin.svg'; // path to your '*.svg' file.


export default class Plugin extends React.Component {
    public render() {
        return <Icon component={inboxsvg} {...this.props} />
    }
}
