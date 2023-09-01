import React from 'react';
import Icon from '@ant-design/icons';
import Dotsvg from './svg/DsAdd.svg';


export default class DsAdd extends React.Component {
    public render() {
        return <Icon component={Dotsvg} {...this.props} />
    }
}
