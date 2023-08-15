/**
 * 资源树
 */
import React from 'react';
import { Tree, Button } from 'antd';
import { Down, Menu } from '../../Icons';

import { StateX, StateComponent } from '../../StateX';
import EditorResourceState , { ResourceItem } from '../states/Resource';
import { resourceManager, pluginManager } from '../core/manager/index';
import ContextMenu from '../ContextMenu';

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
    private namespace: string;
    private resourceState: any;
    private resourceTree: any;
    public constructor(props: EditorResourceTreeProps) {
        super(props);
        StateX.registerModel(new EditorResourceState(this.namespace = props.namespace, {
            tree: props.tree
        }))

        this.resourceState = StateX.findModel(EditorResourceState, this.namespace);

        this.state = {
            height: 0
        }
    }
    public resetHeight() {
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
        this.resetHeight();
    }
    public render() {
        return (
            <div className='resourcetree-wrapper' >
                <ContextMenu namespace={this.namespace} />
                
                <div ref={(e)=> this.resourceTree = e}>
                    <div className='resourcetree-header'>
                        <span>{this.nameMap[this.namespace]}</span>
                        <div className='resourcetree-toolbar'>
                            {this.renderToolbar()}
                        </div>
                    </div>
                    {this.state.height && <Tree
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
                        treeData={this.washTree(this.resourceState.getTreeList())}
                    />}
                </div>
            </div>
        )
    }
    private renderToolbar() {
        
        let toolbar: any = pluginManager.getWidget(['RESOURCETREE', this.namespace,'TOOLBAR'], 'toolbar') || [];
        
        return toolbar.map((it,i) => {
            if (it) {
                return it.render({key:i})
            } else {
                return <span></span>
            }
        });
    }
    private renderTitle(title: any,nodeData: any) {
        return (
            <div className='resourcetree-item'>
                <div><span>{title}</span></div>
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
    /**
     * 清洗数据  RESOURCETREE.RESOURCE.WASH
     * @param ResourceItem 
     * @returns 
     */
    private washTree(ResourceItem:[]) {

        return ResourceItem.map((it: ResourceItem) => {
            return pluginManager.pipeline(['RESOURCETREE',this.namespace,'WASH'],{
                ...it,
                key: it.key,
                title: it.name,//this.renderTitle(it.name),
                icon: this.getIconResourceComponent(it),
                children:it.children ? this.washTree(it.children as any) : null
            }, this)
        })
    }

    private getIconResourceComponent(item: ResourceItem) {
        let View: any = this.getIconResource(item);

        if (View) {
            return <View/>
        }
    }
    private getIconResource(item: ResourceItem) {
        
        if (item.record && item.record.type) {
            let key2: any = ['RESOURCE.ICON',item.type, item.record.type];
            if (resourceManager.has(key2)) {
                return resourceManager.get(key2);
            }
        }

        return resourceManager.get(['RESOURCE.ICON',item.type])
    }
}