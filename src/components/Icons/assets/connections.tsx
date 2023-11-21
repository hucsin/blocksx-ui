import React from 'react';
import Icon from '@ant-design/icons';
import Dotsvg from './svg/connections.svg';


export default class Connections extends React.Component {
    public render() {
        return <Icon component={Dotsvg} {...this.props} />
    }
}
