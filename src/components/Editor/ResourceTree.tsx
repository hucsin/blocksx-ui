/**
 * 资源树
 */
import React from 'react';
import { Tree, Button } from 'antd';
import { Down, Menu } from '../Icons';

import { StateX, StateComponent } from '../StateX';
import EditorResourceState , { ResourceItem } from './states/Resource';
import { resourceManager, pluginManager } from './manager/index';
import ContextMenu from './ContextMenu';

import './ResourceTree/index';


interface EditorResourceTreeProps {
    namespace: 'resource' | 'product';
    tree: ResourceItem[];
    height?: number
}


export default class EditorResourceTree extends StateComponent<EditorResourceTreeProps, { height: number}> {
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
            <div className='resourcetree-wrapper' data-height={this.state.height-20} >
                <ContextMenu namespace={this.props.namespace} />
                <div ref={(e)=> this.resourceTree = e}>
                    {this.state.height && <Tree
                        showIcon
                        blockNode
                        onExpand={(e)=>{
                            this.resourceState.setExpandedKeys(e)
                        }}
                        expandedKeys={this.resourceState.getExpandedKeys()}
                        height={this.state.height-1}
                        
                        titleRender={(nodeData) => { return this.renderTitle(nodeData.title, nodeData);}}
                        defaultSelectedKeys={['0-0-0']}
                        
                        switcherIcon={<Down />}
                        treeData={this.washTree(this.resourceState.getTreeList())}
                    />}
                </div>
            </div>
        )
    }
    private renderTitle(title: any,nodeData: any) {
        return (
            <div className='resourcetree-item'>
                <div><span>{title}</span></div>
                <Button type="text" size="small" onClick={()=>{ console.log(nodeData)}}><Menu/></Button>
            </div>
        )
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