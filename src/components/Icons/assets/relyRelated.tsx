import React from 'react';
import Icon from '@ant-design/icons';
import relyRelatedsvg from './svg/relyRelated.svg'; // path to your '*.svg' file.


export default class RelyRelated extends React.Component {
    public render() {
        return <Icon component={relyRelatedsvg} {...this.props} />
    }
}
