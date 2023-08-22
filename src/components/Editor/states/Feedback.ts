/**
 * 管理
 */
import { StateModel, StateX } from '@blocksx-ui/StateX';
import { utils } from '@blocksx/core';
import DataMeta from './MetaData'

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
    items?: any;

}

export default class EditorFeedbackState extends StateModel<FeedbackState> {
    private protectItemList: any[];
    private otherItemList: any[];

    private dataMeta: {
        [key:string]: DataMeta<any>
    };
    private map: any;
    private cache: any;

    private protectMap: any = {
        terminal: true,
        history: true,
    }

    public constructor(namespace: string,state: FeedbackState) {
        super(namespace, Object.assign({
            items: []
        }));

        this.protectItemList = [];
        this.otherItemList = [];

        this.dataMeta = {};
        
        this.cache = {};
        this.map = {};

        this.state.items?.forEach(this.push)
        
    }

    private push = (meta:any)=> {
        // 如果是序列化参数
        if (utils.isPlainObject(meta)) {
            
            meta = DataMeta.deserialize(meta);
        } 

        this.dataMeta[meta.namespace] = meta;
        // 保护的对象
        if (meta.config('protect')) {
            this.map[meta.namespace] = {
                protect: true,
                namespace: meta.namespace,
                valueIndex: this.protectItemList.push(meta.serialize()) - 1
            }
        } else {
            this.map[meta.namespace] = {
                protect: false,
                namespace: meta.namespace,
                valueIndex: this.otherItemList.push(meta.serialize()) - 1
            }
        }
        
    }
    /**
     * 获取列表
     * @returns 
     */
    public getItems(items?: any) {
        return (items || this.state.items || []).map(it => {
            
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
    }
    /**
     * 判断是否有
     * @param namespace 
     * @returns 
     */
    public has(namespace:string) {
        return !!this.map[namespace]
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

        return this.cache[name] = this.getItems(this.state.items?.find(it => {
           return it.namespace === name;
        }))
    }
    /**
     * 
     * @param namespace 
     * @returns 
     */
    public get(namespace: string) {
        return this.dataMeta[namespace];
    }
    /**
     * 必须加入
     * @param meta 
     */
    public register(meta: DataMeta<any>, props?: any) {
        if (!DataMeta.findMetaModel(meta)) {
            console.error(`Please register datameta[${meta.toString()}] before using it!`)
        }
        let namespace: string = meta.namespace as string;

        if (this.has(namespace)) {
            this.setCurrentKey(namespace)
        } else {

            this.push(meta);
            this.reset(props);
        }
    }

    /**
     * 打开一个datameta对象
     * @param meta 
     */
    public open(meta: DataMeta<any>) {
        this.register(meta, {
            current: meta.namespace
        });
        
    }


    public reset(data?: any) {
        let items: any = [].concat(this.protectItemList as any, this.otherItemList as any);
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
