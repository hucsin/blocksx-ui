import React from 'react';
import { Tooltip } from 'antd';
import StateComponent from '../StateX/Component'
import { WidgetDirectionType } from './types';
/**
 * 组件里面的部件,用来渲染组件面板
 */
export default abstract class  WidgetBase <P, S = {}, SS = any> extends StateComponent<P, S, SS>{// extends StateComponent<{},{}>{
    public abstract text: string;
    public abstract placeholder: string;
    public static direction: WidgetDirectionType;
    public static index: number; 

    public abstract renderChildren(): React.ReactNode;

    public render(): React.ReactNode {
        
        if (this.placeholder) {
            
            return (<Tooltip 
                        placement="top" 
                        mouseEnterDelay={1.2}
                        title={this.placeholder} 
                        key={this.text}
                        trigger={['hover']}
                        getPopupContainer={()=> {return document.body}}
                    >
                        <span className='ant-btn-wraper'>{this.renderChildren()}</span>
                    </Tooltip>) 
        } else {
            return this.renderChildren()
        }
    }
}