import React from 'react';
import Icon from '@ant-design/icons';
import variablesvg from './svg/variable.svg'; // path to your '*.svg' file.


export default class Variable extends React.Component {
    public render() {
        return <Icon component={variablesvg} {...this.props} />
    }
}
