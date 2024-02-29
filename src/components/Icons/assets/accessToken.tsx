import React from 'react';
import { IconProps } from '../type';
import Icon from '@ant-design/icons';
import accessTokensvg from './svg/accessToken.svg'; // path to your '*.svg' file.


export default class AccessToken extends React.Component<IconProps> {
    public render() {
        return <Icon component={accessTokensvg} {...this.props} />
    }
}
