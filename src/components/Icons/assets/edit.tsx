import React from 'react';
import { IconProps } from '../type';
import Icon from '@ant-design/icons';
import editsvg from './svg/edit.svg';


export default class Edit extends React.Component<IconProps> {
    public render() {
        return <Icon component={editsvg} {...this.props} />
    }
}
