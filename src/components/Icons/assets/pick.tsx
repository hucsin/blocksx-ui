import React from 'react';
import Icon from '@ant-design/icons';
import PickSrc from './svg/pick.svg';


export default class Picker extends React.Component {
    public render() {
        return <Icon component={PickSrc} {...this.props} />
    }
}
