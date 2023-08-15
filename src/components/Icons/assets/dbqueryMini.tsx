import React from 'react';
import Icon from '@ant-design/icons';
import Dotsvg from './svg/dbquery-mini.svg';


export default class DBqueryMini extends React.Component {
    public render() {
        return <Icon component={Dotsvg} {...this.props} />
    }
}
