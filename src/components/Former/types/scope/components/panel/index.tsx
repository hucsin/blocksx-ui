import React from 'react';
import classnames from 'classnames';
import PanelProcess from './process';
import PanelStorges from './storges';
import PanelOther from './other';
import ScopeManger from '../../core/ScopeManger';
import Avatar from '../../../avatar';


import './panel.scss';

interface ScopePanelProps {
    scope: any;
    open: any;
}
interface ScopePanelState {
    current: string;
    open: any;
}

export default class ScopePanel extends React.Component<ScopePanelProps, ScopePanelState> {
    private groupList: any = ScopeManger.findGroup();
    private timer: any;
    public constructor(props: ScopePanelProps) {
        super(props);
        this.state = {
            current: 'Thinking',
            open : props.open
        }
    }
    public UNSAFE_componentWillReceiveProps(nextProps: Readonly<ScopePanelProps>, nextContext: any): void {
        if (nextProps.open != this.state.open) {
            this.setState({
                open: nextProps.open
            })
        }
    }
    private renderBody(name) {
        switch(name) {
            case 'Thinking':
                return <PanelProcess onClick={(value, keypath: string) => {
                    this.props.scope.addValueIntoScope({
                        type: 'scope',
                        keypath: keypath,
                        value: value
                    })
                }}/>
            case 'Data Stores':
                return <PanelStorges/>
            default:
                return <PanelOther name={name} onClick={(item: any)=> {
                    this.props.scope.addValueIntoScope(item)
                }} />

        }
    }
    public render() {
       let groupKeys: any = Object.keys(this.groupList);
       let titleKeys: any = [
        'Thinking',
        ...groupKeys,
        'Data Stores'
       ]
       if (!this.state.open) {
         return null;
       }
        
       return  (
            <div className='ui-scope-panel-inner'
                onMouseDown={(e:any)=> {
                    e.preventDefault();
                    //e.stopPropagation();
                }}
            >
                <div className='ui-scope-panel-header'>
                    <Avatar icon="VariableUtilityOutlined" color="#4d53e8"/>
                    
                    <div className='ui-scope-classify'>
                        {titleKeys.map(it=> {
                            return (
                                <span 
                                    onMouseEnter={()=> {
                                        /*if (this.timer ) {
                                            clearTimeout(this.timer);
                                        }
                                        this.timer = setTimeout(() => {
                                            this.setState({current: it})
                                            this.timer = null;
                                        }, 200)
                                        */
                                    }}
                                    onClick={()=> {
                                        this.setState({current: it})
                                    }}
                                    //onMouseLeave={()=> this.timer && clearTimeout(this.timer)}
                                    className={classnames({
                                    "ui-selected": it == this.state.current
                                })}>{it}</span>
                            )
                        })}
                    </div>
                </div>
                <div className='ui-scope-panel-body'>
                    {titleKeys.map(it => {
                        return (
                            <div className={classnames({'ui-selected': it == this.state.current})}>
                                {this.renderBody(it)}
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }
}