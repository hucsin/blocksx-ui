import React from 'react';
import Icon from '@ant-design/icons';
import relatedsvg from './svg/related.svg'; // path to your '*.svg' file.


export default class Related extends React.Component {
    public render() {
        return <Icon component={relatedsvg} {...this.props} />
    }
}
