import React from 'react';
import Icon from '@ant-design/icons';
import monitorsvg from './svg/postgresql.svg';


export default class PostgreSQL extends React.Component {
    public render() {
        return <Icon component={monitorsvg} {...this.props} />
    }
}
