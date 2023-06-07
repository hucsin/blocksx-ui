import React from 'react';
import Icon from '@ant-design/icons';
import recordsvg from './svg/record.svg';


export default class Record extends React.Component {
    public render() {
        return <Icon component={recordsvg} {...this.props} />
    }
}
