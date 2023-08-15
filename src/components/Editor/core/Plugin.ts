/**
 * 插件使用场景:
 * 1、数据清洗
 * 2、功能界面
 * 3、右键扩展
 */
import { utils } from '@blocksx/core';
import Widget from './Widget';

interface WidgetMap {
    [key: string]: Widget
}

export interface PluginPipeline {
    pipeline: Function;
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
    public hasWidget(name:string) {
        return !!this.widget[name];
    }
    /**
     * 注册widget
     * @param name 
     * @param widget 
     */
    public registerWidget(name: string, widget:Widget) {
        if (!this.hasWidget(name)) {
            this.widget[name] = widget;
        } else {
            console.warn('widget with duplicate names!')
        }
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
    public findWidget(name?: string) {
        return name ? this.widget[name] : this.widget;
    }
}