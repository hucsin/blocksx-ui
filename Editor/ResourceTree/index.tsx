/**
 * 资源树
 */
import React from 'react';
import { Tree, Button, Skeleton } from 'antd';
import JDBCSortKeyMap from '@blocksx/db/jdbc/es/JDBCSortKeyMap';
import { Down, Menu } from '@blocksx/ui/Icons';
import { addEvent ,removeEvent } from '@blocksx/ui/utils/dom'

import { StateX, StateComponent } from '@blocksx/ui/StateX';
import EditorResourceState , { ResourceItem } from '@blocksx/ui/Editor/states/Resource';
import { resourceManager, pluginManager } from '@blocksx/ui/Editor/core/manager/index';
import ContextMenu from '@blocksx/ui/Editor/ContextMenu';
import { EditorLayoutState } from '@blocksx/ui/Editor/states';

import './boot';
import './style.scss';


interface EditorResourceTreeProps {
    namespace: 'resource' | 'product';
    tree: ResourceItem[];
    height?: number
}


export default class EditorResourceTree extends StateComponent<EditorResourceTreeProps, { height: number}> {
    private nameMap: any = {
        resource: '资源',
        product: '任务'
    }
    private typeShortMap: any = {
        v: 'view',
        i: 'index',
        t: 'table',
        c: 'column',
        d: 'database',
        f: 'function',
        p: 'procedure',
        tr: 'trigger',
        s: 'schema',
        ds: 'datasource'
    }
    private namespace: string;
    private resourceState: any;
    private resourceTree: any;
    private layoutState: any = StateX.findModel(EditorLayoutState);
    public constructor(props: EditorResourceTreeProps) {
        super(props);

        StateX.registerModel(this.resourceState = new EditorResourceState(this.namespace = props.namespace, {
            tree: props.tree 
        }))

        this.state = {
            height: 0
        }

        this.bindEvent();
    }
    public bindEvent() {
        addEvent(window,'resize', this.resetHeight);
        //this.layoutState.on('resize', this.resetHeight)
        this.resourceState.registerWasher((tree: ResourceItem[]) => {
            return this.washTree(tree)
        })
    }
    public resetHeight=()=> {
        let height = this.resourceTree.getBoundingClientRect().height;
        let oldHeight = this.state.height;
        
        if (height !=oldHeight) {
            this.setState({
                height: height
            })
        }
    }
    public componentDidMount() {
        this.resetHeight();
    }

    public componentDidUpdate() {
        // this.resetHeight();
    }
    public destory() {
        removeEvent(window,'resize', this.resetHeight);
        //this.layoutState.off('resize', this.resetHeight)
    };
    public render() {
        let tree: any[] = this.resourceState.getWashedTree();
        return (
            <div className='resourcetree-wrapper' >
                <ContextMenu namespace={this.namespace} />
                
                <div ref={(e)=> this.resourceTree = e}>
                    <div className='resourcetree-header'>
                        <span>{this.nameMap[this.namespace]}</span>
                        <span className='resourcetree-left-toolbar'>
                            {this.renderLeftToolbar()}
                        </span>
                        <div className='resourcetree-toolbar'>
                            {this.renderRightToolbar()}
                        </div>
                    </div>
                    {this.resourceState.getLoadingState() && tree.length ==0 ? <Skeleton active/> : this.state.height && (tree.length==0 ? <Skeleton/> : <Tree
                        showIcon
                        blockNode
                        onRightClick={(e: any)=> {return this.showContextMenu(e.event,e.node)}}
                        onExpand={(e)=>{
                            this.resourceState.setExpandedKeys(e)
                        }}
                        expandedKeys={this.resourceState.getExpandedKeys()}
                        height={this.state.height-35}

                        
                        titleRender={(nodeData) => { return this.renderTitle(nodeData.title, nodeData);}}
                        defaultSelectedKeys={['0-0-0']}
                        
                        switcherIcon={<Down />}
                        treeData={tree}
                    />)}
                </div>
            </div>
        )
    }
    private renderRightToolbar() {
        return pluginManager.renderWidgetByDirection(
            ['RESOURCETREE', this.namespace,'TOOLBAR'], ['right', 'bottom'])
    }
    private renderLeftToolbar() {
        return pluginManager.renderWidgetByDirection(
            ['RESOURCETREE', this.namespace,'TOOLBAR'], ['left', 'top'])
    }
    private renderTitle(title: any,nodeData: any) {
        return (
            <div className='resourcetree-item'>
                <div>
                    <span className='ri-title'>
                        {title}
                        {nodeData.slotTitle ? <span className='ri-slot'>{nodeData.slotTitle}</span> : null}
                    </span>
                    
                </div>
                <Button 
                    type="text" 
                    size="small" 
                    onClick={
                        (event)=>{
                            this.showContextMenu(event,nodeData);
                        }
                    }
                >
                    <Menu/>
                </Button>
            </div>
        )
    }
    private showContextMenu = (event: any, context: any) => {
        event.stopPropagation();
        ContextMenu.showContextMenu(this.namespace, event, context)
    }
    private washRecord(record: any) {
        let result: any = {};
        for(let prop in record) {
            result[JDBCSortKeyMap.getEnlargeKey(prop)] = record[prop]
        }
        return result;
    }
    /**
     * 清洗数据  RESOURCETREE.RESOURCE.WASH
     * @param ResourceItem 
     * @returns 
     */
    private washTree(ResourceItem:ResourceItem[], parent?: string[]) {

        return ResourceItem.map((it: ResourceItem, index: any) => {
            let item: any = this.getTrueData(it);
            let keypath: any = parent ? [...parent, item.key] : [item.key];
            let treeKey: string = keypath.join('.')
            
            return pluginManager.pipeline(['RESOURCETREE',this.namespace,'WASH'],{
                ...item,
                key: `${treeKey}-${index}`,
                keypath: treeKey,
                id: treeKey,
                title: item.name ,//this.renderTitle(it.name),
                icon: this.getIconResourceComponent(item),
                children:item.children ? this.washTree(item.children as any, keypath) : null
            }, this)
        })
    }   
    private getTrueType(type: string) {
        return this.typeShortMap[type] || type;
    }
    private getTrueData(data: any) {
        return {
            type: this.getTrueType(data.t || data.type),
            name: data.n || data.name,
            key: data.k || data.key || data.n || data.name,
            children: data.c || data.children,
            parent: data.p || data.parent,
            record: this.washRecord(data.r || data.record)
        }
    }

    private getIconResourceComponent(item: ResourceItem) {
        let View: any = this.getIconResource(item);

        if (View) {
            return <View/>
        }
    }
    private getIconResource(item: ResourceItem) {
        
        if (item.record && item.record.type) {
            let key2: any = ['RESOURCE.ICON', item.type, item.record.type];
            if (resourceManager.has(key2)) {
                return resourceManager.get(key2);
            }
        }

        return resourceManager.get(['RESOURCE.ICON',item.type])
    }
}