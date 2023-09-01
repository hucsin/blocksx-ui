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
    historyLength?: number;
    items?: EditorMetaData<any>[];
    changed?: any;
    errorMessage?: string;
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
            changed: {},
            historyLength: state ? (state.items || []).length : 0
        }, state))

        this.cache = {};
        this.dataMeta = {};
        
    }
    public initWorkspace() {
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
                historyLength: (this.state.historyLength as number || 0) + 1,
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
    public getLength() {
        return this.state.items?.length;
    }
    public getHistoryLength() {
        return this.state.historyLength;
    }
    
    public getCurrentKey() {
        return this.state.current;
    }
    /**
     * 错误消息 
     * @param message 
     */
    public showErrorMessage(message:string) {
        this.setState({
            errorMessage: message
        })
    }
    public resetErrorMessage() {
        this.setState({
            errorMessage: ''
        })
    }
    public getErrorMessage() {
        return this.state.errorMessage;
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
        this.resetErrorMessage();
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
                items: this.state.items,
                errorMessage: ''
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
    public getCurrent(){
        return this.getCurrentPanel()
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