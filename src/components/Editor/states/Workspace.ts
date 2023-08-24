import { StateModel, StateX } from '@blocksx/ui/StateX';
import { utils } from '@blocksx/core';
import EditorWorkspacePanel from './WorkspacePanel';
import EditorLayoutState from './Layout';
import EditorFeedback from './Feedback';
import EditorMetaData from './MetaData';

interface WorkspaceItem {
    key: string;
    name: string;
    type: string; // 调用的插件的类型
    changed?: boolean ; // 标记是否发生修改

    data?: any; // 插件的初始化数据
}
interface WorkspaceState {
    current?: string;
    items?: EditorMetaData<any>[];
    changed?: any
}


const getCurrentKey = (data?: EditorMetaData<any>[]) =>{
    if (data && data[0]) {
        return data[0].namespace;
    }
}

export default class EditorWorkspaceState extends StateModel<WorkspaceState> {
    private cache: any = {};
    private dataMeta: any;

    public layoutState: EditorLayoutState = StateX.findModel(EditorLayoutState);

    public constructor(state: WorkspaceState) {
        super(Object.assign({
            current: state ? getCurrentKey(state.items) : null,
            items: state ? state.items || [] : [],
            changed: {}
        }, state))

        this.cache = {};
        this.dataMeta = {};
        
    }
    public initWorkspace() {
        console.log('initworkspace', this.state)
        this.state.items?.map((it)=>{
            this.push(it,null, true)
        })
    }
    private  push = (meta: any,props?: any, noset?: boolean) => {
        // 如果是序列化参数
        if (utils.isPlainObject(meta)) {
            meta = EditorMetaData.deserialize(meta);
        } 
        if (!this.has(meta.namespace)) {
            this.dataMeta[meta.namespace] = meta;
        }

        if (noset !== true) {

            let items: any = this.state.items || [];
            items.push(EditorMetaData.serialize(meta));

            this.setState({
                items: items,
                ...props
            })
        }
    }
    /**
     * 获取列表
     * @returns 
     */
    public getItems() {
        return (this.state.items || []).map(it => {
            return this.dataMeta[it.namespace]
        });
    }
    
    public getCurrentKey() {
        return this.state.current;
    }

    public setCurrentKey(current:string) {
        this.setState({
            current: current
        })
        //this.toggleFeedback();
        //this.emit('switch');

        this.get(current).toggleFeedback();
    }

    /**
     * 判断是否有
     * @param namespace 
     * @returns 
     */
    public has(namespace:string) {
        return !!this.dataMeta[namespace]
    }
    /**
     * 查找
     * @param namespace 
     * @returns 
     */
     public findIndex( namespace: string ) {
        return this.state.items?.findIndex(it => {
           return it.namespace === namespace;
        })
    }
    public get(namespace?: string) {
        return this.dataMeta[namespace || this.state.current as string] ;
    }
    /**
     * 查找
     * @param namespace 
     * @returns 
     */
    public find( namespace?: string ) {
        let name: any = namespace || this.state.current;

        if (this.cache[name]) {
            return this.cache[name]
        }

        return this.cache[name] = this.state.items?.find(it => {
           return it.namespace === name;
        })
    }
    
    /**
     * 必须加入
     * @param meta 
     */
     public register(meta: EditorMetaData<any>, props?: any) {
        if (!EditorMetaData.findMetaModel(meta)) {
            console.error(`Please register datameta[${meta.toString()}] before using it!`)
        }
        let namespace: string = meta.namespace as string;
        
        if (this.has(namespace)) {
            this.setCurrentKey(namespace)
        } else {

            this.push(meta, props);
        }
    }

    /**
     * 打开一个datameta对象
     * @param meta 
     */
    public open(meta: EditorMetaData<any>) {
        this.register(meta, {
            current: meta.namespace
        });
        
        this.get(meta.namespace).toggleFeedback();
    }

    /**
     * 保存工作区
     * @param namespace 
     */
    public onSave(namespace?: string) {
        this.onChange(namespace, false)
    }

    /**
     * 修改工作区
     * @param namespace 
     */
    public onChange(namespace?: string, changed?: boolean) {
        let workspace: any = this.find(namespace);
        if (workspace) {
            let changeds: any = this.state.changed;
            

            changeds[namespace || this.state.current as any] 
                = workspace.changed 
                = utils.isUndefined(changed) ? true : changed;
            

            this.setState({
                changed: changeds,
                items: this.state.items
            })

        }
    }
    /**
     * 
     * @param namespace 
     * @returns 
     */
    public isChanged(namespace?: string) {
        return this.state.changed[namespace || this.state.current as any]
    }
    /**
     * 删除工作区
     * @param namespace  
     */
    public remove(namespace:string) {
        let workspaceIdx: any = this.findIndex(namespace);
        let items:any = this.state.items;

        if (workspaceIdx > -1) {
            items.splice(workspaceIdx, 1)

            this.setState({
                items: items,
                // 删除当前的选项自动
                current: namespace == this.state.current 
                    ? items[Math.max(0, --workspaceIdx)].key 
                    : this.state.current
            })
            
            delete this.cache[namespace];
        }

    }
    /**
     * 获取当前workspace面板状态
     * @returns 
     */
    public getCurrentPanel() {
        return this.get(this.state.current as string)
    }
    /**
     * 获取当前的面状态对象
     * @returns 
     */
    public getCurrentFeedback() {

        let currentPanel: any = this.getCurrentPanel();
        return currentPanel.getFeedback();
    }
}


StateX.registerModel(new EditorWorkspaceState({}))