import React from 'react';
import Icon from '@ant-design/icons';
import autoAlign from './svg/autoAlign.svg';


export default class AutoAlign extends React.Component {
    public render() {
        return <Icon component={autoAlign} {...this.props} />
    }
}
