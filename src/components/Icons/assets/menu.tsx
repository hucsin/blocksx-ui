import React from 'react';
import Icon from '@ant-design/icons';
import actionsvg from './svg/menu.svg'; // path to your '*.svg' file.


export default class Menu extends React.Component {
    public render() {
        return <Icon component={actionsvg} {...this.props} />
    }
}
