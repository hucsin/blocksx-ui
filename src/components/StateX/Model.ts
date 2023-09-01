
import { utils, HistoryStack } from '@blocksx/core';
import { EventEmitter } from 'events';
import StateX from './StateX';

interface IModelsPool {
    [ind: string]: StateModel<any, any>;
}

export default abstract class StateModel<S, A = {}> extends EventEmitter {
    static defaultNamespace: string = '__';

    public namespace: string;
    public modelName?: string;
    public id: string;
    public state: Readonly<S>;
    public StateX: any = StateX;

    
    public historyStack: HistoryStack;
    private waitingNotify: boolean = false; //通过标志变量控制多次的事件通知在一个 EventLoop 中只触发一次
    
    public constructor(namespace?: any, state?: any, isManyData?: boolean | number) {
        super();
        
        this.namespace = utils.isString(namespace) 
            ? namespace : StateModel.defaultNamespace;
        this.modelName = this.constructor.name;
        
        if (utils.isUndefined(state)) {
            state = namespace;
        }
        
        this.historyStack = new HistoryStack({
            maxLength: utils.isBoolean(isManyData) ? isManyData ? 1 : 10 : isManyData ||  10,
            // 标记是否持久化
            persistenceKey: state ? this.getId() : null
        }, isManyData as any)
       
        // 需要持续化
        if (state) {
            this.state = state;

            if (this.historyStack.hasManyData()) {
                
                this.historyStack.getCurrent().then((newState) => {
                    
                    this.resetCurrentData(newState, state);
                    this.emit('onDataInited')
                })
            } else {
                this.resetCurrentData(
                    this.historyStack.getCurrent(),
                    state
                )
            }
        }
    }

    private resetCurrentData(newState:any, state: any) {
        if (newState) {
            this.setState({
                ...newState
            })
        } else {
            this.historyStack.push(utils.deepCopy(state));
            this.setState({
                ...state
            })
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
    public setState(
        state: any,
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
    public getStates() {
        return this.state;
    }
    public getState(key: string) {
        return this.state[key as string]
    }
    /**
     * 更新状态的版本号
     */
    public updateVersion(obj?: any) {
        let version = this.getState('_version') || 0;

        if ( !utils.isPlainObject( obj) ) {
            this.setState({
                _version: version + 1
            })
        } else {
            obj['_version'] = version + 1;
            return obj;
        }
    }

    /**
     * 获取状态的版本号
     * @returns 
     */
    public getVersion() {
        return this.getState('_version') || 0
    }
    /**
     * 获取model
     * @param modelName 
     * @returns 
     */
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

            this.StateX.notifyChangesListeners(this.getId(), this.namespace);
            this.waitingNotify = false;
        });
    };
    /**
     * 数据更新的函数，相当于 effects 或者 reducers 的概念集合
     */
    public readonly actions: A;
}