import React from 'react';
import { Tooltip } from 'antd';

export type WidgetDirectionType = 'top' | 'bottom' | 'right' | 'left' | 'center';

export default abstract class  Widget {
    public abstract text: string;
    public abstract placeholder: string;
    public abstract direction: WidgetDirectionType;
    public abstract index: number; 
    public abstract renderChildren(props:any,key: string): React.ReactNode;

    public render(props: any, key?:string) {
        let _props: any = props || {};
        let _key: string = key || _props.namespace || _props.key;
        
        if (this.placeholder) {
            return (<Tooltip 
                        placement="bottom" 
                        title={this.placeholder} 
                        {...props} 
                        key={_key}
                    >
                        {this.renderChildren(props, _key)}
                    </Tooltip>) 
        } else {
            return this.renderChildren(props, _key)
        }
    }
}