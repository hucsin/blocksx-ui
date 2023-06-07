import React from 'react';
import Icon from '@ant-design/icons';
import toolbarBackSvg from './svg/fileFlow.svg'; // path to your '*.svg' file.


export default class FileFlow extends React.Component {
    public render() {
        return <Icon component={toolbarBackSvg} {...this.props} />
    }
}
