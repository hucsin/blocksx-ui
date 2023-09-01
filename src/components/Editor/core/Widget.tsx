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
                        placement="top" 
                        mouseEnterDelay={0.3}
                        title={this.placeholder} 
                        key={_key}
                        trigger={['hover']}
                        getPopupContainer={()=> {return document.body}}
                    >
                        <span className='ant-btn-wraper'>{this.renderChildren(props, _key)}</span>
                    </Tooltip>) 
        } else {
            return this.renderChildren(props, _key)
        }
    }
}