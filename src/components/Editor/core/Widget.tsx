import React from 'react';
import { Tooltip } from 'antd';

export default abstract class  Widget {
    public abstract name: string;
    public abstract placeholder: string;


    public abstract renderChildren(props?:any): React.ReactNode;

    public render(props: any) {
        
        return <Tooltip placement="bottom" title={this.placeholder} {...props} key={'t'+ props.key}>{this.renderChildren(props)}</Tooltip> 
            
    }
}