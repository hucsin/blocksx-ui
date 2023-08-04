/**
 * 简单的数据流插件
 * 实现简单的数据管理
 */

import React from "react";
import { utils, HistoryStack } from '@blocksx/core';

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
    [ind: string]: HoofBaseModel<any, any>;
}

export class Hoof {
    private idleHandler: number;
    private subscribeIndex: number = 0;
    private listeners: Map<string, [Function, string[]]> = new Map();
    private needNotifiedListeners = new Set<[index: string, namespace?: string]>([]);
    private startNotiTime: number;
    public models: IModelsPool = {};


    /**
     * 绑定数据模型，集中管理数据模型
     *
     * @param model 数据模型 HoofBaseModel
     */
    public bindModel(model: HoofBaseModel<any>): IDisposable {
        if (this.models[model.namespace]) {
            console.error("sorry, you should bind with unque namespace!");
            delete this.models[model.namespace];
        }
        model.hoof = this;
        this.models[model.namespace] = model;

        return () => {
            delete this.models[model.namespace];
        };
    }

    /**
     * 订阅器，订阅对应 model 改变的函数，外部可以不关心
     *
     * @param func 订阅触发函数
     * @param deps 订阅的 model，仅订阅的 model 改变后才会触发函数
     *
     * @returns 返回取消订阅的函数
     */
    public subscribe(func: Function, deps: string[] = []): IDisposable {
        if (typeof deps === "undefined") {
            console.warn(
                "you didn't specify the dependency list, it works, but we recommend you fill a list to get a better performance"
            );
        }
        const id = (this.subscribeIndex++).toString();
        this.listeners.set(id, [func, deps]);
        return () => {
            this.listeners.delete(id);
        };
    };
    /**
     * 触发器，更新完数据仓之后必须触发才能通知 UI 变更
     *
     * @param namespace model 的命名空间 id，只会触发订阅对应 model 的 mapStatetoProps 函数。留空表示触发全部
     */
    public notifyChangesListeners(namespace?: string) {
        this.listeners.forEach((v, key) => {
            if (
                typeof namespace === "undefined" ||
                v[1].length === 0 ||
                v[1].includes(namespace)
            ) {
                // 将需要通知的函数放进队列等待通知
                this.needNotifiedListeners.add([key, namespace]);
            }
        });
        // 需要通知各个订阅了
        this.startNotifies();
    };

    public startNotifies() {
        if (this.idleHandler) _cancelIdleCallback(this.idleHandler);
        // 执行之前先标记下时间
        this.startNotiTime = new Date().getTime();
        this.doTheNotifies();
    };

    public doTheNotifies() {
        if (this.needNotifiedListeners.size > 0) {
            const next = this.needNotifiedListeners.values().next().value;
            this.needNotifiedListeners.delete(next[0]);

            if (this.listeners.has(next[0])) {
                const linstener = this.listeners.get(next[0]);
                if (linstener) linstener[0](next[1]);
            }

            // 如果当前渲染的递归还有时间，继续，否则等待下一次宏任务
            if (new Date().getTime() - this.startNotiTime < 16) {
                this.doTheNotifies();
            } else {
                this.idleHandler = _requestIdleCallback(this.startNotifies);
            }
        }
    };
    public destory() {
        for (let m in this.models) delete this.models[m];
        this.listeners.clear();
        this.needNotifiedListeners.clear();
    }
}



export const hoof = new Hoof();

/**
 * 一个基础的数据模型。用户可以继承此类后自己添加更新函数
 *
 * - namespace 作为唯一的 id
 * - state 作为数据储存仓
 * - setState 同步更新 state 的函数
 * - actions 用户的数据模型的更新函数，支持异步函数
 */
export abstract class HoofBaseModel<S, A = {}> {
    public abstract namespace: string; // 唯一的命名空间
    public state: Readonly<S>;
    public hoof: Hoof = hoof;

    private historyStack: HistoryStack;
    private waitingNotify:boolean = false; //通过标志变量控制多次的事件通知在一个 EventLoop 中只触发一次
   
    public constructor(state?: any) {

        this.historyStack = new HistoryStack({
            maxLength: 100,
            // @ts-ignore 
            persistenceKey: this.namespace
        })
        if (state) {
            this.historyStack.push(utils.deepCopy(state))
            this.state = this.historyStack.getCurrent() || state ;
        }
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
    protected setState<K extends keyof S>(
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
        
        if (!ignoreHistory ) {
            this.historyStack.push(utils.deepCopy(this.state))
        }
    };
    protected getModel<K extends keyof IModelsPool>(
        modelName: K
    ): IModelsPool[K] {
        return this.hoof.models[modelName];
    };
    /**
     * 通知上层触发订阅的 connect 转换函数，每次修改 state 必须触发！！！
     */
    protected notifyChanges() {
        // setState 是同步的，但是事件通知不是同步
        if (this.waitingNotify) return;
        this.waitingNotify = true;
        new Promise<void>((r) => r()).then(() => {
            hoof.notifyChangesListeners(this.namespace);
            this.waitingNotify = false;
        });
    };
    /**
     * 数据更新的函数，相当于 effects 或者 reducers 的概念集合
     */
    readonly actions: A;
}

export abstract class HoofComponent<P, S = {}, SS = any> extends React.Component<P, S, SS> {
    // 填写models 关注的name
    public abstract HFCareModels: string[];
    // hooks一个新的生命周期函数,等价于componentWillUnmount
    public componentDidUnmount?: Function;
    public hoof: any = hoof;

    private unSubscribed: IDisposable;

    public constructor(props: any) {
        super(props)
        this.initHoofSubscribe();
    }
    private initHoofSubscribe() {
        this.unSubscribed = this.hoof.subscribe((namespace?: string) => {
            // 更新对应的namespace 状态
            this.setState({
                // @ts-ignore
                [['hoof', namespace || '*'].join('.')]: utils.uniq('hoof')
            } as any)
        }, this.HFCareModels || [])
    }
    public componentWillUnmount() {
        this.unSubscribed();
        this.componentDidUnmount && this.componentDidUnmount();
    }
}