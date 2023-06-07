import React from 'react';
import Icon from '@ant-design/icons';
import foldersvg from './svg/folder.svg'; // path to your '*.svg' file.


export default class Folder extends React.Component {
    public render() {
        return <Icon component={foldersvg} {...this.props} />
    }
}
