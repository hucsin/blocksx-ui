/**
 * 插件使用场景:
 * 1、数据清洗
 * 2、功能界面
 * 3、右键扩展
 */
import React from 'react';
import { utils } from '@blocksx/core';
import Widget from './Widget';

interface WidgetMap {
    [key: string]: Widget
}


export interface ContextMenuItem {
    key: string;
    name: string;
    action: string;
    children?: ContextMenuItem[];
    data?: any;
}

export interface PluginContextMenu {
    contextMenu: ContextMenuItem[];
}

export interface PluginPipeline {
    pipeline(value: any, context: any): any | void;
}
export interface PluginComponent {
    render(props: any, key?: any): React.ReactNode
}
export default abstract class PluginBase  {
    private widget:WidgetMap;

    public constructor () {
        this.widget = {};
    }
    /**
     * 判断是否存在widget
     * @param name 
     * @returns 
     */
    public hasWidget(namespace:any) {
        namespace = this.toCaseInsensitive(namespace);

        return !!this.widget[namespace];
    }
    /**
     * 注册widget
     * @param name 
     * @param widget 
     */
    public registerWidget(namespace: string, widget:Widget) {
        namespace = this.toCaseInsensitive(namespace);
        
        let widgetArray: any = this.hasWidget(namespace) 
            ? this.widget[namespace] : []; 

        widgetArray.push(widget);
        this.widget[namespace] = widgetArray;
    }

    public hasContextMenu() {
        return this['contextMenu']
    }
    public hasPipeLine() {
        return utils.isFunction(this['pipeline']);
    }

    /**
     * 查找widget
     * @param name 
     * @returns 
     */
    public findWidget(namespace?: string) {
        
        return namespace 
            ? this.widget[this.toCaseInsensitive(namespace)] 
            : this.getAllWidget();
    }

    private getAllWidget() {
        let keys:string[] = Object.keys(this.widget);
        let widgets: any[]  = [];

        keys.map(it => {
            widgets = widgets.concat(this.widget[it]);
        })
        
        return widgets;
    }
    private toCaseInsensitive(namespace:any) {

        if (Array.isArray(namespace)) {
            namespace = namespace.join('.');
        }

        return namespace.toUpperCase();
    }
}