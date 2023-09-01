import React from 'react';
import Icon from '@ant-design/icons';
import Dotsvg from './svg/query.svg';


export default class Query extends React.Component {
    public render() {
        return <Icon component={Dotsvg} {...this.props} />
    }
}
