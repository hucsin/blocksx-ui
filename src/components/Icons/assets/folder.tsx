import React from 'react';
import { IconProps } from '../type';
import Icon from '@ant-design/icons';
import foldersvg from './svg/folder.svg'; // path to your '*.svg' file.


export default class Folder extends React.Component<IconProps> {
    public render() {
        return <Icon component={foldersvg} {...this.props} />
    }
}
