import React from 'react';
import { PlusOutlined } from '@ant-design/icons';
import NodeConfigure from '../NodeConfigure';
import { FetchMap } from '../typing';

interface NewNodeProps {
    workflowType: string;
    onClick?(): any;
    fetchMap: FetchMap;
    onAddNewNode: any;
}

export default class NewNode extends React.Component<NewNodeProps, {open: any}> {
    private newRef: any;
    public constructor(props: NewNodeProps) {
        super(props)
        this.state = {
            open: false
        }
    }

    public render() {
        return (

            <div
                className='ui-flownode-new'
                ref={(dom) => this.newRef = dom}
            >
                <NodeConfigure
                    open={this.state.open}
                    onFetchRecoFilter={( parmas)=>{
                        
                        return this.props.fetchMap['programs']({...parmas},  this.props.workflowType)
                    }}
                    onClassifyClick={(row) => {
                        this.props.onAddNewNode(row, this.newRef.getBoundingClientRect())
                    }}
                    onOpenChange={(v)=> {this.setState({open: v})}}
                >
                    <PlusOutlined />

                    <div className='ui-arrow-wraper'>
                        <div className='ui-arrow'></div>
                        <div className='ui-arrow'></div>
                    </div>

                </NodeConfigure>
            </div>
        )
    }
}