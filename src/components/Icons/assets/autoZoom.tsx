import React from 'react';
import Icon from '@ant-design/icons';
import autoZoom from './svg/autoZoom.svg';


export default class AutoZoom extends React.Component {
    public render() {
        return <Icon component={autoZoom} {...this.props} />
    }
}
