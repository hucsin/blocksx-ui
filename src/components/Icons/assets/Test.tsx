import React from 'react';
import { IconProps } from '../type';
import TableUtilityOutlined from './TableUtilityOutlined';
import View from './ViewUtilityFilled';

export default class Test extends React.Component<IconProps> {
    public render() {
        return <span className='icons-combine icons-combine-bottomRight'>
            <TableUtilityOutlined/>
            <View/>
        </span>
    }
}
