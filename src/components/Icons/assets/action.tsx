import React from 'react';
import Icon from '@ant-design/icons';
import actionsvg from './svg/action.svg'; // path to your '*.svg' file.


export default class Action extends React.Component {
    public render() {
        return <Icon component={actionsvg} {...this.props} />
    }
}
