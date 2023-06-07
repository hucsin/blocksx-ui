import React from 'react';
import Icon from '@ant-design/icons';
import Tablesvg from './svg/table.svg';


export default class Table extends React.Component {
    public render() {
        return <Icon component={Tablesvg} {...this.props} />
    }
}
