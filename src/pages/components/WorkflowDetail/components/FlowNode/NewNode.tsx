import React from 'react';
import { PlusOutlined } from '@ant-design/icons';
import NodeConfigure from '../NodeConfigure';
import { FetchMap } from '../../typing';

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

                        // 修改icon
                        if (Array.isArray(row.icon) && row.icon.length == 2) {
                            //row.icon = row.icon[1];
                            
                            //if (row.props) {
                              //  row.props.icon = row.icon[1];
                            //}
                        }
                        
                        //row.icon = row.icon.replace(/#[a-z0-9A-Z]+$/, '');
                        
                        row.type ='go';

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