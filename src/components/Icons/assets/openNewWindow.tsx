import React from 'react';
import Icon from '@ant-design/icons';
import openNewWindowsrc from './svg/openNewWindow.svg';


export default class OpenNewWindow extends React.Component {
    public render() {
        return <Icon component={openNewWindowsrc} {...this.props} />
    }
}
