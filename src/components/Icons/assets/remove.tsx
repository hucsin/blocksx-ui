import React from 'react';
import Icon from '@ant-design/icons';
import removesvg from './svg/remove.svg';


export default class Remove extends React.Component {
    public render() {
        return <Icon component={removesvg} {...this.props} />
    }
}
