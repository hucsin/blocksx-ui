import React from 'react';
import Icon from '@ant-design/icons';
import versionsvg from './svg/workflow.svg';


export default class Version extends React.Component {
    public render() {
        return <Icon component={versionsvg} {...this.props} />
    }
}
