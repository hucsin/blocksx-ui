import React from 'react';
import StateX from './StateX';
import { utils } from '@blocksx/core';

type IDisposable = () => void;

export default abstract class StateComponent<P, S = {}, SS = any> extends React.Component<P, S, SS> {
    // 填写models 关注的name
    public ListenModels?: string[];
    // hooks一个新的生命周期函数,等价于componentWillUnmount
    public componentDidUnmount?: Function;
    public StateX: any = StateX;

    private _unSubscribed: IDisposable;

    public constructor(props: any) {
        super(props)

        this.initSubscribe();
    }
    private initSubscribe() {
        this._unSubscribed = this.StateX.subscribe((namespace?: string) => {
            // 更新对应的namespace 状态
            this.setState({
                // @ts-ignore
                [['hoof', namespace || '*'].join('.')]: utils.uniq('hoof')
            } as any)
        // @ts-ignore
        }, this.ListenModels || [], this.props.namespace)
    }
    public componentWillUnmount() {
        this._unSubscribed();
        this.componentDidUnmount && this.componentDidUnmount();
    }
}