import React from 'react';
import Icon from '@ant-design/icons';
import upsvg from './svg/down.svg';


export default class Down extends React.Component {
    public render() {
        return <Icon component={upsvg} {...this.props} />
    }
}
