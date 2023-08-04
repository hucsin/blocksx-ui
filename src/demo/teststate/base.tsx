/* Copyright (c) 2019-2020 ubug
 * https://ubugio.coding.net/public/novus/novus/git/files/master/src/index.tsx
 * 本程序是开源程序，但是使用时请保留上述源地址，以便后续 Bug 修复和特性追踪
 **/
import React, {
    Component,
    ComponentClass
  } from "react";
  
  interface TModelsPool {
    [ind: string]: NovusBaseModel<any, any>;
  }
  
  type IDisposable = () => void;
  
  type TElement<T> = string | ComponentClass<T, any> ;
  export type TConnectProps = {
    getModel: <K extends keyof TModelsPool>(name: K) => TModelsPool[K];
    getModels: () => TModelsPool;
  };
  
  // simple polyfill for requestIdleCallback
  const _requestIdleCallback =
    // @ts-ignore experimental APIs not included in lib.d.ts
    (window || (global as any)).requestIdleCallback ||
    ((cb: Function) => setTimeout(cb, 1));
  
  const _cancelIdleCallback =
    // @ts-ignore experimental APIs not included in lib.d.ts
    (window || (global as any)).cancelIdleCallback ||
    ((id: number) => clearTimeout(id));
  
  let subscribeIndex = 0;
  
  let idleHandler: number;
  
  class Novus {
    // 提供一个集中的聚合地方，这块可以不使用
    // @ts-ignore
    models: TModelsPool = {};
    // 用订阅通知的模式，简单实现数据变更通知，外部可以不关心
    listeners: Map<string, [Function, string[]]> = new Map(); // private
    /**
     * 绑定数据模型，集中管理数据模型
     *
     * @param model 数据模型 NovusBaseModel
     */
    bindModel(model: NovusBaseModel<any>): IDisposable {
      if (this.models[model.namespace]) {
        console.error("sorry, you should bind with unque namespace!!");
        delete this.models[model.namespace];
      }
      model.novus = this;
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
    subscribe = (func: Function, deps: string[] = []): IDisposable => {
      if (typeof deps === "undefined"){
        console.warn(
          "you didn't specify the dependency list, it works, but we recommend you fill a list to get a better performance"
        );
      }
      const id = (subscribeIndex++).toString();
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
    notifyChangesListeners = (namespace?: string) => {
      this.listeners.forEach((v, key) => {
        if (
          typeof namespace === "undefined" ||
          v[1].length === 0 ||
          v[1].includes(namespace)
        ) {
          // 将需要通知的函数放进队列等待通知
          this.needNotifiedListeners.add([key, namespace as string]);
          console.log('notify,',key)
        }
      });
      // 需要通知各个订阅了
      this.startNotifies();
    };
    needNotifiedListeners = new Set<[string, string]>([]);
    startNotiTime: number;
    startNotifies = () => {
      if (idleHandler) _cancelIdleCallback(idleHandler);
      // 执行之前先标记下时间
      this.startNotiTime = new Date().getTime();
      this.doTheNotifies();
    };
    /**
     * 确实去通知订阅的部分，根据不同的执行可能再不同的宏任务队列被执行
     */
    doTheNotifies = () => {
      if (this.needNotifiedListeners.size > 0) {
        const nextId = this.needNotifiedListeners.values().next().value;
        this.needNotifiedListeners.delete(nextId);
  
        if (this.listeners.has(nextId[0])) {
          const linstener = this.listeners.get(nextId[0]);
          if (linstener) linstener[0]();
          console.log('nextId,',nextId,this.needNotifiedListeners)
        }
  
        // 如果当前渲染的递归还有时间，继续，否则等待下一次宏任务
        if (new Date().getTime() - this.startNotiTime < 16) {
          this.doTheNotifies();
        } else {
          idleHandler = _requestIdleCallback(this.startNotifies);
        }
      }
    };
    connectProps = {
      getModel: <K extends keyof TModelsPool>(name: K): TModelsPool[K] => {
        return this.models[name];
      },
      getModels: (): TModelsPool => this.models,
    };
    /**
     * 将 models state 数据转换挂载到组件上，类似 react-redux 的 connect 功能，不推荐，但是支持
     *
     * @param Comp 要挂载的组件，props 需求有基础的和被 connected 的
     * @param mapStatetoProps 数据转换函数
     * @param deps 依赖的 models，不在这个数组的 models 改变不会执行 mapStatetoProps 函数
     *
     * @returns NewComponent 返回新的组件，props 提示只有基础的
     */
    connect = <OriginProps, ConnectedProps>(
      Comp: TElement<OriginProps & ConnectedProps & TConnectProps>,
      mapStatetoProps: (
        models: TModelsPool,
        app: Novus,
        props: OriginProps
      ) => ConnectedProps,
      deps: string[] = []
    ): React.ComponentClass<OriginProps> => {
      class OutputCom extends Component<OriginProps, ConnectedProps> {
        constructor(props: OriginProps) {
          super(props);
          this.state = mapStatetoProps(novus.models, novus, props);
        }
        dispose: Function;
        componentDidMount() {
          this.dispose = novus.subscribe(() => {
            let newState = mapStatetoProps(novus.models, novus, this.props);
            this.setState(newState);
          }, deps);
        }
        componentWillUnmount() {
          if (typeof this.dispose !== "undefined") {
            this.dispose();
          }
        }
  
        render() {
          const allProps:any = {
            ...this.props,
            ...this.state,
            ...novus.connectProps,
          };
          // @ts-ignore
          return <Comp {...allProps} />;
        }
      }
  
      return OutputCom;
    };
    /**
     * 删除全部模型
     */
    clean = () => {
      for (let m in this.models) delete this.models[m];
      this.listeners.clear();
      this.needNotifiedListeners.clear();
    };
  }
  
  export const novus = new Novus();
  
  /**
   * 一个基础的数据模型。用户可以继承此类后自己添加更新函数
   *
   * - namespace 作为唯一的 id
   * - state 作为数据储存仓
   * - setState 同步更新 state 的函数
   * - actions 用户的数据模型的更新函数，支持异步函数
   */
  export class NovusBaseModel<S, A = {}> {
    /**
     * 唯一的命名空间
     */
    namespace: string;
    novus: Novus = novus;
    /**
     * 数据仓
     *
     * 由于继承后会 state 覆盖，所以子组件要显式指定类型
     */
    state: Readonly<S>;
    /**
     * 纯函数的数据更新函数，同步执行
     *
     * @param state 要更新的属性或者函数
     */
    protected setState = <K extends keyof S>(
      state: Pick<S, K> | ((states: S) => Pick<S, K>)
    ) => {
      if (typeof state === "function") {
        const newState = state(this.state);
        this.state = { ...this.state, ...newState };
      } else {
        this.state = { ...this.state, ...state };
      }
      this.notifyChanges();
    };
    protected getModel = <K extends keyof TModelsPool>(
      modelName: K
    ): TModelsPool[K] => {
      return novus.models[modelName];
    };
    /**
     * 通过标志变量控制多次的事件通知在一个 EventLoop 中只触发一次
     */
    protected waitingNotify = false;
    /**
     * 通知上层触发订阅的 connect 转换函数，每次修改 state 必须触发！！！
     */
    protected notifyChanges = () => {
      // setState 是同步的，但是事件通知不是同步
      if (this.waitingNotify) return;
      this.waitingNotify = true;
      new Promise<void>((r) => r()).then(() => {
        novus.notifyChangesListeners(this.namespace);
        this.waitingNotify = false;
      });
    };
    /**
     * 数据更新的函数，相当于 effects 或者 reducers 的概念集合
     */
    readonly actions: A;
  }
  
  /**
   * 封装一个组件，默认携带 novus 属性，方便引用
   *
   * @export
   * @class NovusComponent
   * @extends {(Component<P, S, SS>)}
   * @template P
   * @template S
   * @template SS
   */
  export class NovusComponent<P, S = {}, SS = any> extends Component<P, S, SS> {
    novus = novus;
  
  }
  

  export class NovusComponent2<P, S = {}, SS = any> extends Component<P, S, SS> {
    public novus: any = novus;
    public constructor(props: any) {
      super(props);
      this.bind();
    }
    bind() {
      novus.subscribe(() => {
        this.setState({
          // @ts-ignore
          modules: novus.models
        });
      }, []);
    }
  }

  export default Novus;
  