/**
 * 管理
 */
import { StateModel, StateX } from '@blocksx-ui/StateX';

type FeedbackItemType = 'terminal' | 'history' | 'record' | 'issue' | 'explain';

interface FeedbackItem {
    key: string;
    name: string;
    type: FeedbackItemType; // 调用的插件的类型
    protect?: boolean; // 是否安全保护页签

    loading?: boolean; // 是否加载中

    data?: any; // 插件的初始化数据
}
interface FeedbackState {
    current?: string;
    items?: FeedbackItem[];

}

export default class EditorFeedbackState extends StateModel<FeedbackState> {
    private protectItemList: any;
    private otherItemList: any;
    private map: any;
    private cache: any;

    private protectMap: any = {
        terminal: true,
        history: true,
    }

    public constructor(namespace: string,state: FeedbackState) {
        super(namespace, Object.assign({
            items: []
        }, state));

        this.protectItemList = [];
        this.otherItemList = [];
        
        this.cache = {};
        this.map = {};
        this.state && this.initItems();
    }

    private initItems() {
        let items: any = this.state.items || [] ;

        items.forEach(it=>{
           this.push(it);
        })
    }
    private push(item:any) {
        if (item.protect) {
            this.map[item.key] = {
                protect: true,
                valueIndex: this.protectItemList.push(item) - 1
            }
        } else {
            this.map[item.key] = {
                protect: false,
                valueIndex: this.otherItemList.push(item) - 1
            }
        }
        
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
     * @param namespace 
     * @param type 
     * @param name 
     * @param data 
     */
    public add(namespace: string, type: FeedbackItemType,  name: string, data?:any) {
        this.register(namespace, type, name, data);
    }
    public register(namespace: string, type: FeedbackItemType,  name: string, data?:any, noReset?: boolean) {
        
        if (this.has(namespace)) {
            this.setState({current: namespace});
            //console.info('There is a feedback with the same name!');

        } else {
            this.push({
                key: namespace,
                type: type,
                name: name,
                loading: false,
                data: data,
                protect: !!this.protectMap[type]
            })
            
            !noReset && this.reset();
        }
    }
    public open(namespace: string, type: FeedbackItemType, name: string, data?: any) {
        this.register(namespace, type, name, data, false);
        // 打开当前的
        this.reset({
            current: namespace
        })
    }
    public reset(data?: any) {
        let items: any = [].concat(this.protectItemList, this.otherItemList);
        this.setState({
            items: items,
            ...data
        })
    }
    public remove(namespace:string) {
        let map: any = this.map[namespace];
        if (map) {
            if (map.protect) {
                this.protectItemList.splice(map.valueIndex, 1);
            } else {
                this.otherItemList.splice(map.valueIndex, 1);
            }
            
            this.reset();
        }
    }
}
