import React from 'react';
import Icon from '@ant-design/icons';
import API from './svg/router.svg';


export default class Dot extends React.Component {
    public render() {
        return <Icon component={API} {...this.props} />
    }
}
