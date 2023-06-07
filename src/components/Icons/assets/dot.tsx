import React from 'react';
import Icon from '@ant-design/icons';
import Dotsvg from './svg/dot.svg';


export default class Dot extends React.Component {
    public render() {
        return <Icon component={Dotsvg} {...this.props} />
    }
}
