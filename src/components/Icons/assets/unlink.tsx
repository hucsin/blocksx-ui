import React from 'react';
import Icon from '@ant-design/icons';
import unlink from './svg/unlink.svg'; // path to your '*.svg' file.


export default class Inbox extends React.Component {
    public render() {
        return <Icon component={unlink} {...this.props} />
    }
}
