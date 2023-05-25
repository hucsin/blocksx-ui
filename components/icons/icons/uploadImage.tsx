import React from 'react';
import Icon from '@ant-design/icons';
import svgImage from './svg/uploadImage.svg'; // path to your '*.svg' file.

export default class UploadImage extends React.Component {
    public constructor(props: any) {
        super(props)
    }
    public render() {
        return <Icon component={svgImage} {...this.props}/>
    }
}