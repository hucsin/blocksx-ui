import React from 'react';
import { IconProps } from '../type';
import Icon from '@ant-design/icons';
import Dotsvg from './svg/dbquery.svg';


export default class DBquery extends React.Component<IconProps> {
    public render() {
        return <Icon component={Dotsvg} {...this.props} style={{width: 'auto'}} className="anticon-custom-icon" type="custom-icon" width={'100px'} />
    }
}
