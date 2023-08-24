
/**
 * 数据对象基类
 */


 import { StateModel, StateX } from '@blocksx/ui/StateX';
 
 import { utils } from '@blocksx/core';
 import EditorWorkspaceState from '@blocksx/ui/Editor/states/Workspace';

 export interface SerializeType {
    $name: string;
    namespace: string;
    props: any;
    state: any;
 }
 export interface MetaDataState {
    value?: any;
    data?: any[];
 }

 const toCaseInsensitive = (name: string) => {
    return name.replace(/([A-Z])([a-z]+)/g, ($1,$2,$3,i)=> {
        return (i ? '.' : '') + $2 + $3.toUpperCase()
    })
 }

 export default abstract class  EditorMetaDataState<S>  extends StateModel<S> {

    /**
     * 用来支持反序列化
     */
    static MetaModelList: any = {};

    static findMetaModel:any = (model: any) => {
        let modelname: string = model;
        if (!utils.isString(model)) {
            modelname = model.constructor ? model.constructor.name : model.name;
        }
        
        return EditorMetaDataState.MetaModelList[toCaseInsensitive(modelname)];
    }
    static registerMetaModel:any = (modelname: string, model?: any) => {
        if (utils.isUndefined(model)) {
            model = modelname;

            modelname = model.name;
        }
        
        EditorMetaDataState.MetaModelList[toCaseInsensitive(modelname)] = model;
    }

    static serialize: any = (model: any)=> {
        return {
            $name: toCaseInsensitive(model.constructor.name),
            props: model.props,
            namespace: model.namespace,
            state: model.state
        }
    }
    static deserialize: any =  (serialize: SerializeType)=> {
        if (utils.isPlainObject(serialize)) {
            let Model: any = EditorMetaDataState.findMetaModel(serialize.$name);
            
            if (Model) {
                return new Model(serialize.namespace, serialize.props, serialize.state)
            }
        }
    }
    
    public workspaceState: any = StateX.findModel(EditorWorkspaceState);
    public props: any;

    public constructor(namespace: string, props: any, state: any) {
        super(namespace, state || {});
        this.props = props || {};
    }

    public config(key:string) {
        return this.props[key]
    }

    public meta(key: string, value?: any) {
        if (utils.isUndefined(value)) {
            return this.state[key];
        } else {
            this.setState ({
                [`${key}`]: value
            })
        }
    }

    /**
     * 设置或则获取组件加载状态
     * @param loading 
     * @returns 
     */
     public loading(loading?:boolean) {
        if (utils.isUndefined(loading)) {
            return this.meta('loading');
        } else {
            this.meta('loading', loading);
        }
    }
    /**
     * 设置data
     * @param data 
     */
    public setData(data: any) {
        this.meta('data', data);
    }
    /**
     * 获取data
     * @returns 
     */
    public getData() {
        return this.meta('data') || [];
    }

    public setValue(value: any) {
        this.meta('value', value)
    }
    public getValue() {
        return this.meta('value');
    }
    /**
     * 往data 的后面写入
     * @param item 
     */
    public push(item: any) {
        let data: any = this.getData()
        if (utils.isArray(data)) {
            data.push(item);
            this.setData(data);
        }
    }
    /**
     * 往data 的前面写入
     * @param item 
     */
    public unshift(item: any) {
        let data: any = this.getData()
        if (utils.isArray(data)) {
            data.unshift(item);
            this.setData(data);
        }
    }

    public serialize() {
        return EditorMetaDataState.serialize(this);
    }
 }