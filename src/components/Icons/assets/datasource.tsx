import React from 'react';
import Icon from '@ant-design/icons';
import datasourcesvg from './svg/datasource.svg'; // path to your '*.svg' file.


export default class Datasource extends React.Component {
    public render() {
        return <Icon component={datasourcesvg} {...this.props} />
    }
}
