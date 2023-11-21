import React from 'react';
import Icon from '@ant-design/icons';
import User from './svg/user.svg';


export default class Dot extends React.Component {
    public render() {
        return <Icon component={User} {...this.props} />
    }
}
