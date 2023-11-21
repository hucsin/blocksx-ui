import React from 'react';
import Icon from '@ant-design/icons';
import document from './svg/charging.svg';


export default class Dot extends React.Component {
    public render() {
        return <Icon component={document} {...this.props} />
    }
}
