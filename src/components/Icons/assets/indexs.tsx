import React from 'react';
import Icon from '@ant-design/icons';
import indexssvg from './svg/indexs.svg'; // path to your '*.svg' file.


export default class Indexs extends React.Component {
    public render() {
        return <Icon component={indexssvg} {...this.props} />
    }
}
