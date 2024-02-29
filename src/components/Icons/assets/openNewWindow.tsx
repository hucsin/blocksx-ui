import React from 'react';
import { IconProps } from '../type';
import Icon from '@ant-design/icons';
import openNewWindowsrc from './svg/openNewWindow.svg';


export default class OpenNewWindow extends React.Component<IconProps> {
    public render() {
        return <Icon component={openNewWindowsrc} {...this.props} />
    }
}
