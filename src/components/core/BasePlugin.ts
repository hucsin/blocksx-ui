/**
 * 插件使用场景:
 * 1、数据清洗
 * 2、功能界面
 * 3、右键扩展
 */
import React from 'react';
import { utils } from '@blocksx/core';
import { ContextMenuItem, PluginManager } from '@blocksx/ui';

import { ContextMenuMap } from './typing';


interface WidgetMap {
    [key: string]: any
}


export interface PluginPipeline {
    pipeline(value: any, context: any): any | void;
}
export interface PluginComponent {
    render(props: any, key?: any): React.ReactNode
}
export default abstract class PluginBase  {
    
    public destory?(): void;
    public mount?(): void;
    public static contextMenuMap : ContextMenuMap;
    public keybindingMap?: any[];

    public context: any;
    public namespace: string;
    private widget: WidgetMap;
    
    
    public constructor (namespace: string, context: any) {
        this.widget = {};

        this.namespace = namespace;
        this.context = context;
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
    public registerWidget(namespace: string, widget:any) {
        namespace = this.toCaseInsensitive(namespace);
        
        let widgetArray: any[] = this.hasWidget(namespace) 
            ? this.widget[namespace] : []; 

        widgetArray.push(widget);
        this.widget[namespace] = widgetArray;

    }

    public registerContextMenu(namespace: string, contextMenu:ContextMenuItem[]) {
        PluginManager.registerContextMenu(namespace, contextMenu);
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

        return namespace && namespace !=='*' 
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