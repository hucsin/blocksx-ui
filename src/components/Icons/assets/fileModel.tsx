import React from 'react';
import Icon from '@ant-design/icons';
import toolbarBackSvg from './svg/fileModel.svg'; // path to your '*.svg' file.


export default class FileModel extends React.Component {
    public render() {
        return <Icon component={toolbarBackSvg} {...this.props} />
    }
}
