import React from 'react';
import Icon from '@ant-design/icons';
import upsvg from './svg/up.svg';


export default class Up extends React.Component {
    public render() {
        return <Icon component={upsvg} {...this.props} />
    }
}
