import React from 'react';
import Icon from '@ant-design/icons';
import bytehubssvg from './svg/bytehubs.svg'; // path to your '*.svg' file.


export default class Bytehubs extends React.Component {
    public render() {
        return <Icon component={bytehubssvg} {...this.props} />
    }
}
