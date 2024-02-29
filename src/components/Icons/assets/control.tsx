import React from 'react';
import { IconProps } from '../type';
import Icon from '@ant-design/icons';
import svgImage from './svg/control.svg'; // path to your '*.svg' file.

export default class Control extends React.Component<IconProps> {
    public constructor(props: any) {
        super(props)
    }
    public render() {
        return <Icon component={svgImage} {...this.props}/>
    }
}