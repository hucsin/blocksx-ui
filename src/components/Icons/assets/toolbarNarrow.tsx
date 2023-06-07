import React from 'react';
import Icon from '@ant-design/icons';
import toolbarNarrowSvg from './svg/toolbarNarrow.svg'; // path to your '*.svg' file.

export default class ToolbarNarrow extends React.Component {
    public constructor(props: any) {
        super(props)
    }
    public render() {
        return <Icon component={toolbarNarrowSvg} {...this.props}/>
    }
}