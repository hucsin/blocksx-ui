import { utils } from '@blocksx/core';
import PluginBase, { PluginPipeline } from '@blocksx-ui/Editor/core/Plugin';


/**
 * 给资源树扩展目录等功能
 */
export default class ResourceTreeItemWashPlugin extends PluginBase implements  PluginPipeline {

    private groupMap: any = {
        schema: {
            table: '表'
        },
        table: {
            field: '字段',
            index: '索引'
        }
    }
    private slatMap:any =  {
        datasource: true,
        tableGroup: true,
        fieldGroup: true,
        field: (v) => {
            return v.record &&  v.record.format ;
        }
    }

    public constructor() {
        super()
    }
    public groupChildren(parentKey: string, children: any[], map: any, context: any) {
        let group: any = {};
        children.forEach(it => {
            if (!group[it.type]) {
                group[it.type] = [];
            }
            group[it.type].push(it)
        });
        let keys = Object.keys(group);
        
        return keys.map(it => {
            let item:any = {
                key: parentKey + it + 'Group',
                title: map[it],
                children: group[it],
                type : it + 'Group',
               
            }
            item.slotTitle= this.getSlotTitle(item,item.children)
            item.icon = context.getIconResourceComponent(item);
            return item;
        })
    }
    /**
     * 核心函数
     * @param value 
     * @param context 
     * @returns 
     */
    public pipeline(value: any, context: any) {
        if (this.groupMap[value.type]) {
            let children: any = value.children ? this.groupChildren(value.key, value.children, this.groupMap[value.type], context) : null;
            return {
                ...value,
                children: children, 
                slotTitle: this.getSlotTitle(value,children)
            }
        } else {
            value.slotTitle= this.getSlotTitle(value, value.children);
            return value;
        }
    }
    private getSlotTitle(context: any, children: any) {
        
        if (this.slatMap[context.type]) {
            if (utils.isFunction(this.slatMap[context.type])) {
                return this.slatMap[context.type](context)
            }
            return children ? children.length: 0;
        }
    }
}