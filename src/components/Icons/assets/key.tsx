import React from 'react';
import Icon from '@ant-design/icons';
import Keysvg from './svg/key.svg';


export default class Key extends React.Component {
    public render() {
        return <Icon component={Keysvg} {...this.props} />
    }
}
