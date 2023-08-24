import StateModel from '@blocksx/ui/StateX/Model';

// 数据库类型范围
export type ResourceDatabaseType = 'datasource' | 'database' | 'schema' | 'table' | 'view' | 'column' | 'procedure' | 'trigger' | 'function' | 'user';
// 项目类型范围                      数据同步(时时)       数据复制(一次性)   定时任务(周期)           
export type ResourceProductType = 'synchronization' | 'replication' | 'scheduled' | ''; 
export type ResourceFileGroupType = 'folder';

export type ResourceType = ResourceDatabaseType | ResourceProductType | ResourceFileGroupType

export interface ResourceItem {
    type: ResourceType; // 资源名称
    key: string; // 资源标识
    name: string; // 资源名称
    children?: ResourceItem[];
    parent?: string; // 
    record?: any; // 该资源的一个基础信息
}

interface ResourceState {
    loading?: boolean; // 资源加载中
    tree: ResourceItem[];
    expandedKeys?: string[]
}
const getDefaultExpandedKeys = (tree: any) => {
    let expandedKeys: string[] = [];
    tree.forEach(it => {
        expandedKeys.push(it.key)
    });
    return expandedKeys;
}
export default class EditorResourceState extends StateModel<ResourceState> {
    public constructor(namespace: string, state: ResourceState) {
        super(namespace, Object.assign({
            loading: false,
            tree: [],
            expandedKeys: getDefaultExpandedKeys(state.tree || []),
        }, state));
    }
    
    public getTreeList() {
        return this.state.tree;
    }

    public getExpandedKeys() {
        return this.state.expandedKeys;
    }
    public setExpandedKeys(expandedKeys) {
        this.setState({
            expandedKeys: expandedKeys
        })
    }
}