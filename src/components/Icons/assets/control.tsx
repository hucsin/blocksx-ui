import React from 'react';
import Icon from '@ant-design/icons';
import svgImage from './svg/control.svg'; // path to your '*.svg' file.

export default class Control extends React.Component {
    public constructor(props: any) {
        super(props)
    }
    public render() {
        return <Icon component={svgImage} {...this.props}/>
    }
}