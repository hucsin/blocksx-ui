import React from 'react';
import Icon from '@ant-design/icons';
import Publishsvg from './svg/publish.svg';


export default class Publish extends React.Component {
    public render() {
        return <Icon component={Publishsvg} {...this.props} />
    }
}
