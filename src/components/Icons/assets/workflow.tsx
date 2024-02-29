import React from 'react';
import { IconProps } from '../type';
import Icon from '@ant-design/icons';
import versionsvg from './svg/workflow.svg';


export default class Version extends React.Component<IconProps> {
    public render() {
        return <Icon component={versionsvg} {...this.props} />
    }
}
