import { StateModel, StateX } from '@blocksx-ui/StateX';
import { utils } from '@blocksx/core';
import EditorWorkspacePanel from './WorkspacePanel';
import EditorFeedback from './Feedback';

interface WorkspaceItem {
    key: string;
    name: string;
    type: string; // 调用的插件的类型
    changed?: boolean ; // 标记是否发生修改

    data?: any; // 插件的初始化数据
}
interface WorkspaceState {
    current?: string;
    items?:  WorkspaceItem[];
    changed?: any
}


const getCurrentKey = (data?: WorkspaceItem[]) =>{
    if (data && data[0]) {
        return data[0].key;
    }
}

export default class EditorWorkspaceState extends StateModel<WorkspaceState> {
    private cache: any = {};
    public constructor(state: WorkspaceState) {
        super(Object.assign({
            current: state ? getCurrentKey(state.items) : null,
            items: state ? state.items || [] : [],
            changed: {}
        }, state))

        this.cache = {};
    }
    /**
     * 获取列表
     * @returns 
     */
    public getItems() {
        return this.state.items || [];
    }
    public getCurrentKey() {
        return this.state.current;
    }

    public setCurrentKey(current:string) {
        this.setState({
            current: current
        })
    }
    /**
     * 判断是否有
     * @param namespace 
     * @returns 
     */
    public has(namespace:string) {
        return this.find(namespace)
    }
    /**
     * 查找
     * @param namespace 
     * @returns 
     */
     public findIndex( namespace: string ) {
        return this.state.items?.findIndex(it => {
           return it.key === namespace;
        })
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
           return it.key === name;
        })
    }
    /**
     * 添加工作区
     */
     public add(namespace: string, type: string,  name: string, data?:any) {
        this.register(namespace, type, name, data)
     }
    /**
     * 添加工作区
     */
    public register(namespace: string, type: string,  name: string, data?:any) {
        let items: any = this.state.items;

        if (this.has(namespace)) {
            this.setState({current: namespace});
            console.info('There is a workspace with the same name!');

        } else {

            items.push({
                key: namespace,
                name: name, 
                type: type,
                data: data
            });

            this.setState({
                items: items,
                current: namespace
            })
        }
    }
    /**
     * 保存工作区
     * @param namespace 
     */
    public save(namespace?: string) {
        this.change(namespace, false)
    }

    /**
     * 修改工作区
     * @param namespace 
     */
    public change(namespace?: string, changed?: boolean) {
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
    public getCurrentPanelState() {
        return this.getPanelState(this.state.current as string);
    }
    public getPanelState(namespace: string) {
        return StateX.findModel(EditorWorkspacePanel, namespace);
    }
    /**
     * 获取当前的面状态对象
     * @returns 
     */
    public getCurrentFeedbackState() {

        let workspacePanel: EditorWorkspacePanel = this.getCurrentPanelState();
        return workspacePanel &&  workspacePanel.getFeedbackState()
    }
}


StateX.registerModel(new EditorWorkspaceState({}))