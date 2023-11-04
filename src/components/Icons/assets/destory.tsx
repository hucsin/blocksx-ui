import React from 'react';
import Icon from '@ant-design/icons';
import destroy from './svg/destroy.svg'; // path to your '*.svg' file.


export default class Inbox extends React.Component {
    public render() {
        return <Icon component={destroy} {...this.props} />
    }
}
