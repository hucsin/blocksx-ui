import StateModel from '@blocksx/ui/StateX/Model';
import { Request } from '@blocksx/swap';
import EditorConfig from '../core/Config';
import { utils } from '@blocksx/core';

// 数据库类型范围
export type ResourceDatabaseType = 'datasource' | 'database' | 'schema' | 'table' | 'view' | 'column' | 'procedure' | 'trigger' | 'function' | 'user';
// 项目类型范围                      数据同步(时时)       数据复制(一次性)   定时任务(周期)           
export type ResourceProductType = 'synchronization' | 'replication' | 'scheduled' | ''; 
export type ResourceFileGroupType = 'folder';

export type ResourceType = ResourceDatabaseType | ResourceProductType | ResourceFileGroupType

export interface ResourceItem {
    type: ResourceType; // 资源名称
    key: string; // 资源标识
    keypath?: string;
    name: string; // 资源名称
    children?: ResourceItem[];
    parent?: string; //
    record?: any; // 该资源的一个基础信息
}

interface ResourceState {
    loading?: boolean; // 资源加载中
    tree: ResourceItem[];
    version?: number;
    expandedKeys?: string[]
}
const getDefaultExpandedKeys = (tree: any) => {
    let expandedKeys: string[] = [];
    tree.forEach(it => {
        expandedKeys.push(it.key || it.k)
    });
    return expandedKeys;
}
export default class EditorResourceState extends StateModel<ResourceState> {
    private searchTreeCache: any ;
    private washTreeCache: any;
    private washer: Function;
    public namespaceTreeURIMap: any = {
        // 默认的资源配置
        resource: {
            fetch: '/openapi/v1/meta/datasource/getMeta',
            reflush: '/openapi/v1/meta/datasource/reflushMeta',
            create: '/openapi/v1/meta/datasource/create',
            update: '/openapi/v1/meta/datasource/update',
            find: '/openapi/v1/meta/datasource/find',
            delete: '/openapi/v1/meta/datasource/delete',
            test: '/openapi/v1/meta/datasource/test',
            findTreeNode: ''
        },
        product: ''
    }
    public constructor(namespace: string, state: ResourceState) {
        super(namespace, Object.assign({
            loading: false,
            tree: [],
            version: 0,
            expandedKeys: getDefaultExpandedKeys(state.tree || []),
        }, state), true);

        this.searchTreeCache = {};
        this.washTreeCache = {};

        this.initTreeList(state)
    }

    private initTreeList(state) {
       
        if (this.historyStack.getDataLength() < 20 
                && this.getURL('fetch')
                && (this.state.tree.length == 0)) {

            this.reload(true);
        }
    }
    
    private getURL (type: string) {
        return EditorConfig.get([this.namespace, type].join('.')) 
            || this.namespaceTreeURIMap[this.namespace][type]
    }

    public reload(isInit?: boolean) {
        // 一步步获取
        this.setState({
            loading: true
        })

        this.doAction('fetch', {}).then((result:any[]) => {
            this.setState({
                loading: false,
                tree: result,
                version: (this.state.version as number) + 1,
                expandedKeys: isInit ? getDefaultExpandedKeys(result) : this.state.expandedKeys
            })
        })
    }

    public reflushTree() {
        this.reload()
    }
    /**
     * 执行动作
     * @param type 
     * @param data 
     */
    public doAction(type: string, data: any) {
        return new Promise((resolve, reject) => {
            Request.post(this.getURL(type), data).then((result:any[]) => {
                resolve(result)
            }, reject)
        })
    }
    /**
     * 注册清洗者
     * @param washer 
     */
    public registerWasher(washer: Function) {
        this.washer = washer;
    }
    /**
     * 获取清洗之后的函数
     * @returns 
     */
    public getWashedTree() {
        let version: any = this.state.version;

        if (this.washTreeCache[version]) {
            return this.washTreeCache[version]
        } else {
            let tree: any = this.washer 
                ? this.washer(this.getTreeList()) : this.getTreeList();
            
            if (tree.length) {
                this.washTreeCache[version] = tree;
            }
            return tree;
        }
    }
    public find(namespace: string, type?: string[]) {
        let searchTree: any = this.getSearchTree();
        let result: any  = type ? {} : [];

        for(let p in searchTree) {
            if (p.indexOf(namespace) > -1) {
                if (type) {
                    let itemType: string = searchTree[p].type;
                    if (type.indexOf(itemType) > -1) {
                        if (!result[itemType]) {
                            result[itemType] = []
                        }
                        result[itemType].push(searchTree[p])
                    }
                } else {
                    result.push(searchTree[p])
                }
            }
        }
        return result;
    }

    /**
     * 依据数据生成searchtree
     */
    public getSearchTree () {
        let version: any = this.state.version;
        
        if (this.searchTreeCache[version]) {
            return this.searchTreeCache[version];
        } else {
            this.searchTreeCache[version] = {}
            this.generateSearchTree(this.getWashedTree())

            return this.getSearchTree();
        }
    }

    private generateSearchTree(treeNode: any[],parent?: string) {

        let version: any = this.state.version;
        let cacheTree: any = this.searchTreeCache[version];
        
        treeNode.forEach(it => {
            if (!it.keypath) {
                it.keypath = parent ? [parent, it.key].join('.') : it.key;
            }

            let cache: any = cacheTree[it.keypath];
            
            if (cache) {
                if (!utils.isArray(cache)) {
                    cacheTree[it.keypath] = [cache];
                }
                cacheTree[it.keypath].push(it)
            } else {
                cacheTree[it.keypath] = it;
            }

            if (it.children) {
                this.generateSearchTree(it.children, it.keypath)
            }

            
        })
    }

    /**
     * 获取treeList
     * @returns 
     */
    public getTreeList() {
        return this.state.tree;
    }
    /**
     * 获取给定节点所在树的前面几个数据类型的数据
     */
    public getRouterList(needTypes: string[], currentNode?: ResourceItem) {
        let currentRootNode = this.getWashedRootNode(currentNode);
        let searchTree = this.getSearchTree();

        if (currentRootNode) {
            let routerTree: any = this.translateData(currentRootNode.children, needTypes);
            let currentTree: any = this.getCurrentTree(needTypes, searchTree, currentNode);

            return {
                root: {
                    id: currentRootNode.id,
                    key: currentRootNode.key,
                    type: currentRootNode.type,
                    name: currentRootNode.name
                },
                children: routerTree,
                current: currentTree
            }
        }
    }

    private  getCurrentTree(needTypes: string[], searchTree: any, currentNode?: ResourceItem) {
        if (currentNode) {
            let keypath: string = currentNode.keypath as string;
            
            if (utils.isString(keypath)) {
                let path: string[] = keypath.split('.');
                let result: any[] = [];
                
                for(let i = 2,l=path.length;i<=l;i++) {
                    let current: string[] = path.slice(0,i);
                    let cacheData: any = searchTree[current.join('.')];
                    
                    if (cacheData) {
                        if (needTypes.indexOf(cacheData.type) == -1) {
                            return result
                        } else {
                            result.push({
                                id: cacheData.id,
                                type: cacheData.type,
                                name: cacheData.name
                            })
                        }
                    }
                }

                return result;
            }
        }

    }

    private translateData(list: any[], needTypes: string[]) {
        return list.map((it: any) => {
            let hit: boolean = needTypes.indexOf(it.type) > -1 ;
            if (hit) {
                return {
                    name: it.name,
                    type: it.type,
                    id: it.id,
                    children: hit ? this.translateData(it.children, needTypes) : null
                }
            } else {
                return null;
            }
        }).filter(it=>it)
    }

    private getWashedRootNode(currentNode?: ResourceItem) {
        let washedTree: any = this.getWashedTree();
        let cacheTree: any = this.getSearchTree();
        if (currentNode) {
            let keypath: string = currentNode.keypath as string;

            if (utils.isString(keypath)) {
                let match: string[] = keypath.split('.');
                return cacheTree[match[0]]
            }
        } else {
            return washedTree[0];
        }
    }

    public getLoadingState() {
        return this.state.loading
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