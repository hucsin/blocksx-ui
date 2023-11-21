import React from 'react';
import Icon from '@ant-design/icons';
import arrowBack from './svg/arrowBack.svg';


export default class ArrowBack extends React.Component {
    public render() {
        return <Icon component={arrowBack} {...this.props} />
    }
}
