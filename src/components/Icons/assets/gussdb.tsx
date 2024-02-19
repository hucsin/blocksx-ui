import React from 'react';
import Icon from '@ant-design/icons';
import svg from './svg/gussdb.svg'; // path to your '*.svg' file.


export default class IconView extends React.Component {
    public render() {
        return <Icon component={svg} {...this.props} />
    }
}
