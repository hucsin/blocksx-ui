
import React from 'react';
import { Tabs } from 'antd';
import { StateX, StateComponent } from '../../components/StateX/index';
import GlobalState from './model/global'
import runtimeModel from './model/runtime'

StateX.registerModel(new GlobalState({
    current: 'index2',
    windows: [
        {
            type: 'code',
            name: 'index1',
            key: 'index1',
        },
        {
            type: 'code',
            name: 'index2',
            key: 'index2'
        }
    ]
}))


// 核心框架
export default class DemoComponent extends StateComponent<{}> {
    public ListenModels = [];
    public constructor(props) {
        super(props)
        this.state = {
        }

    }

    public render () {
        console.log(this.StateX.findModel(GlobalState.name))
        let { windows=[],current='s' } = this.StateX.findModel(GlobalState.name).state;

        return (
            <div className='tab-wrapper'>
                <h3>h3</h3>
                 <Tabs
                    type="editable-card"
                    onChange={(e)=>{
                        this.StateX.findModel(GlobalState).actions.current(e)
                    }}
                    activeKey={current}
                    onEdit={(e)=> {console.log(e)}}
                    items={(windows as any).map((it) => {
                        return {
                            key: it.key,
                            name: it.name,
                            label: it.name,
                            children: <TabContent namespace={'globalState-runtimeState-' + it.key}></TabContent>
                        }
                    })}
                    />
            </div>
        )
    }

}


class TabContent extends StateComponent<{
    namespace: string
}> {
    public ListenModels = [];
    public constructor(props) {
        super(props);
        StateX.registerModel(new runtimeModel(props.namespace, {c:1}))
    }

    public render() {
        let model: any = StateX.findModel('runtimeState', this.props.namespace)
        return (
            <div className='tab-content'>
                <h2>tab-content</h2>
                <p>{model.state.c}</p>
                <button onClick={()=>{ model.actions.add()  }}>点击</button>
            </div>
        )
    }
}