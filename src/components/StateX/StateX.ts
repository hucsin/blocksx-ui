import { utils } from '@blocksx/core';
import { default as StateModel } from './Model';



type IDisposable = () => void;

const _requestIdleCallback =
    // @ts-ignore 
    (window || (global as any)).requestIdleCallback ||
    ((cb: Function) => setTimeout(cb, 1));

const _cancelIdleCallback =
    // @ts-ignore 
    (window || (global as any)).cancelIdleCallback ||
    ((id: number) => clearTimeout(id));

interface IModelsPool {
    [ind: string]: StateModel<any, any>;
}

class StateX {
    private idleHandler: number | null;
    private subscribeIndex: number = 0;
    private listeners: Map<string, [Function, string[], string]> = new Map();
    private needNotifiedListeners: any = [];
    private startNotiTime: number;
    public models: IModelsPool = {};


    /**
     * 绑定数据模型，集中管理数据模型
     *
     * @param model 数据模型 StateModel
     */
    public registerModel(model: StateModel<any>): IDisposable {
        if (this.models[model.getId()]) {
            console.error("sorry, you should bind with unque namespace!");
            delete this.models[model.getId()];
        }
        model.StateX = this;
        this.models[model.getId()] = model;

        return () => {
            delete this.models[model.getId()];
        };
    }

    public findModel(modelName: string | any, namespace?:string) {
        if (!utils.isString(modelName)) {
            modelName = modelName.name;
        }

        return this.models[[namespace || StateModel.defaultNamespace, modelName].join('.')]
    }

    /**
     * 订阅器，订阅对应 model 改变的函数，外部可以不关心
     *
     * @param func 订阅触发函数
     * @param deps 订阅的 model，仅订阅的 model 改变后才会触发函数
     *
     * @returns 返回取消订阅的函数
     */
    public subscribe(func: Function, deps: string[] = [], namespace?: string): IDisposable {
        if (typeof deps === "undefined") {
            console.warn(
                "you didn't specify the dependency list, it works, but we recommend you fill a list to get a better performance"
            );
        }
        const id = (this.subscribeIndex++).toString();
        this.listeners.set(id, [func, deps, namespace || StateModel.defaultNamespace]);
        return () => {
            this.listeners.delete(id);
        };
    };
    /**
     * 触发器，更新完数据仓之后必须触发才能通知 UI 变更
     *
     * @param id model 的命名空间 id，只会触发订阅对应 model 的 mapStatetoProps 函数。留空表示触发全部
     */
    public notifyChangesListeners(id?: string, namespace?: string) {

        this.listeners.forEach((v, key) => {
            if (
                typeof id === "undefined" ||
                v[1].length === 0 ||
                v[1].includes(id) ||
                this.matchNotifyChanges(v[1], v[2], id, namespace || StateModel.defaultNamespace)
            ) {
                
                // 将需要通知的函数放进队列等待通知
                if(!this.needNotifiedListeners.find((e)=>e.key == key)) {
                    this.needNotifiedListeners.push([key, id, namespace || StateModel.defaultNamespace]);
                }
            }
        });
        // 需要通知各个订阅了
        this.startNotifies();
    };

    private matchNotifyChanges(listener: string[], listenerNamespace: string, triggerId: string, triggerNamespace):boolean {
        let triggerMap: string[] = triggerId.split('.');
        let triggerModelName: string = triggerMap[1];
        // 默认命名空间, 不判断命名空间
        if (listenerNamespace  == StateModel.defaultNamespace) {
            return listener.includes(triggerModelName)
        } 

        return listener.includes(triggerModelName) && (listenerNamespace === triggerNamespace)
    }

    public startNotifies() {
        if (this.idleHandler) {
            _cancelIdleCallback(this.idleHandler);
            this.idleHandler = null;
        }
        // 执行之前先标记下时间
        this.startNotiTime = new Date().getTime();
        this.doTheNotifies();
    };

    public doTheNotifies() {
        let next = null;

        while ( next = this.needNotifiedListeners.shift()) {

            if (this.listeners.has(next[0])) {
                const linstener = this.listeners.get(next[0]);
                if (linstener) linstener[0](next[1]);
            }

            // 如果当前渲染的递归还有时间，继续，否则等待下一次宏任务
            if (new Date().getTime() - this.startNotiTime < 16) {
                this.doTheNotifies();
            } else {
                this.idleHandler = _requestIdleCallback(()=>{
                    this.startNotifies()
                });
            }
        }
    };
    public destory() {
        for (let m in this.models) delete this.models[m];
        this.listeners.clear();
        this.needNotifiedListeners.clear();
    }
}

export default new StateX();