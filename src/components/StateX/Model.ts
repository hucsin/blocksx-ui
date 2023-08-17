
import { utils, HistoryStack } from '@blocksx/core';
import { EventEmitter } from 'events';

interface IModelsPool {
    [ind: string]: StateModel<any, any>;
}

export default abstract class StateModel<S, A = {}> extends EventEmitter {
    static defaultNamespace: string = '__';

    public namespace?: string;
    public modelName?: string;
    public id: string;
    public state: Readonly<S>;
    public StateX: any;

    
    private historyStack: HistoryStack;
    private waitingNotify: boolean = false; //通过标志变量控制多次的事件通知在一个 EventLoop 中只触发一次
   
    public constructor(namespace?: any, state?: any) {
        super();
        
        this.namespace = utils.isString(namespace) 
            ? namespace : StateModel.defaultNamespace;
        this.modelName = this.constructor.name;
        
        if (utils.isUndefined(state)) {
            state = namespace;
        }

        this.historyStack = new HistoryStack({
            maxLength: 100,
            // 标记是否持久化
            persistenceKey: state ? this.getId() : null
        })
       
        // 需要持续化
        if (state) {
            let currentState: any = this.historyStack.getCurrent() ;

            if (currentState) {
                this.state = this.historyStack.getCurrent() ;
            } else {
                this.historyStack.push(utils.deepCopy(state));
                this.state = state;
            }
        }
    }
    public getId() {
        return this.id || (this.id = [this.namespace, this.modelName].join('.'))
    }

    // 遍历历史
    protected go(dir:number) {
        this.setState(this.historyStack.go(dir), true);
    }
    public forward() {
        this.go(1)
    } 
    public backward() {
        this.go(-1)
    }

    /**
     * 纯函数的数据更新函数，同步执行
     *
     * @param state 要更新的属性或者函数
     */
    public setState<K extends keyof S>(
        state: Pick<S, K> | ((states: S) => Pick<S, K>),
        ignoreHistory?:boolean
    ) {
        if (typeof state === "function") {
            const newState = state(this.state);
            this.state = { ...this.state, ...newState };
        } else {
            this.state = { ...this.state, ...state };
        }
        this.notifyChanges();
        
        if (!ignoreHistory  ) {
            
            this.historyStack.push(utils.deepCopy(this.state))
        }
    };
    protected getModel<K extends keyof IModelsPool>(
        modelName: K
    ): IModelsPool[K] {
        return this.StateX.models[modelName];
    };
    /**
     * 通知上层触发订阅的 connect 转换函数，每次修改 state 必须触发！！！
     */
    protected notifyChanges() {
        // setState 是同步的，但是事件通知不是同步
        if (this.waitingNotify) return;
        this.waitingNotify = true;
        new Promise<void>((r) => r()).then(() => {
            console.log(this, this.StateX, 333)
            this.StateX.notifyChangesListeners(this.getId(), this.namespace);
            this.waitingNotify = false;
        });
    };
    /**
     * 数据更新的函数，相当于 effects 或者 reducers 的概念集合
     */
    public readonly actions: A;
}