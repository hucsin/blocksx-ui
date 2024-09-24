import React from 'react';
import { TablerUtils,Icons, FormerTypes } from '@blocksx/ui';
import { List } from 'antd';

import './style.scss';

interface MoreStartsProps {
    startNodes: any;
    onSubmit: Function;
    onCancel: Function;
}
interface MoreStartsState {
    startNodes: any;
}

export default class InputParams extends React.Component<MoreStartsProps, MoreStartsState> {
    public constructor(props: MoreStartsProps) {
        super(props);

        this.state = {
            startNodes: props.startNodes
        }
    }

    public UNSAFE_componentWillReceiveProps(nextProps: Readonly<MoreStartsProps>, nextContext: any): void {
        if (nextProps.startNodes != this.state.startNodes) {
            this.setState({
                startNodes: nextProps.startNodes
            })
        }
    }
    private onSubmit = (nodeName: string) => {
        this.props.onSubmit(nodeName)
    }
    public renderTitle(program: string, item: any ) {
        return (
            <>{program} <span className='ui-serial'>{item.name}</span></>
        )
    }
    public render() {
        
        return (
            <div className='ui-more-starts'>
                <FormerTypes.notice value="Testing multiple nodes is not supported. Please select a starting node."/>
                <List
                    className='ui-runtest-input'
                    dataSource={this.state.startNodes}
                
                    renderItem={(item: any, index: number) => {
                        let {props = {} } = item;
                        return (
                            <List.Item
                                actions={[<Icons.PlayCircleFilled/>]}
                                onClick={()=> this.onSubmit(item.name)}
                            >
                                <List.Item.Meta
                                    avatar={<FormerTypes.avatar icon={item.icon} color={item.color} />}
                                    title={this.renderTitle(props.program,item)}
                                    description={props.method}
                                    
                                />
                            </List.Item>
                        )
                    }}
            >
            </List>
            </div>
        );
    }
}