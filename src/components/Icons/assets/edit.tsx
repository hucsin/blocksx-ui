import React from 'react';
import Icon from '@ant-design/icons';
import editsvg from './svg/edit.svg';


export default class Edit extends React.Component {
    public render() {
        return <Icon component={editsvg} {...this.props} />
    }
}
