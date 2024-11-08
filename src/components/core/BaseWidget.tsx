import React from 'react';
import { Tooltip } from 'antd';
import StateComponent from '../StateX/Component';
import { WidgetDirectionType } from './typing';
/**
 * 组件里面的部件,用来渲染组件面板
 */
export default abstract class  WidgetBase <P, S = {}> extends StateComponent<P, S>{// extends StateComponent<{},{}>{
    public abstract text: string;
    public abstract placeholder: string;

    public static direction: WidgetDirectionType;
    public static index: number; 

    public abstract renderChildren(): React.ReactNode;
    public shouldComponentDisplay?(): boolean;

    public constructor(props: any) {
        super(props);
        
    }

    public render(): React.ReactNode {
        // 如果不能渲染的情况
        if (this.shouldComponentDisplay && !this.shouldComponentDisplay()) {
            return null;
        }
        
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