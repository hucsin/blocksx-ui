import React from 'react';
import { IconProps } from '../type';
import Main from './TableUtilityOutlined';
import Subscript from './ViewUtilityFilled';
    
export default class ViewUtilityCombine extends React.Component<IconProps> {
    public render() {
        return (
            <span className='icons-combine icons-combine-bottomRight'>
                <Main/>
                <Subscript/>
            </span>
        )
    }
}
