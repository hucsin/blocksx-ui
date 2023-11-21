import React from 'react';
import Icon from '@ant-design/icons';
import help from './svg/help.svg';


export default class Dot extends React.Component {
    public render() {
        return <Icon component={help} {...this.props} />
    }
}
