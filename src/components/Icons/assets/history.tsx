import React from 'react';
import Icon from '@ant-design/icons';
import historysvg from './svg/history.svg';


export default class History extends React.Component {
    public render() {
        return <Icon component={historysvg} {...this.props} />
    }
}
