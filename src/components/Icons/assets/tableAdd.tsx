import React from 'react';
import Icon from '@ant-design/icons';
import Tablesvg from './svg/tableAdd.svg';


export default class tableAdd extends React.Component {
    public render() {
        return <Icon component={Tablesvg} {...this.props} />
    }
}
