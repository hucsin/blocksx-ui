import React from 'react';
import classnames from 'classnames';
import { IconProps } from './type';

interface CombineIconProp extends IconProps {
    main: any;
    subscript: any;
    direction?: 'bottomRight' | 'topRight' | 'topLeft' | 'bottomLeft'
}
    
export default class CombineIcon extends React.Component<CombineIconProp> {
    public static defaultProps = {
        direction: 'bottomRight'
    }
    public render() {
        return (
            <span className={classnames({
                'icons-combine': true,
                [`icons-combine-${this.props.direction}`] : this.props.direction
            })}>
                {this.props.main}
                {this.props.subscript}
            </span>
        )
    }
}
