import React from 'react';
import classnames from 'classnames';

import { Segmented } from 'antd';
import { Icons, ValueView } from '@blocksx/ui'
import './style.scss';


interface RunLogOutputProps {
    nodeStatus: any;
    expand?: boolean;
}
export default class RunLogOutput extends React.Component<RunLogOutputProps, {value: any,expand?: boolean}> {
    public constructor(props: any) {
        super(props);
        this.state = {
            value: this.getOutcome() ? 'Output' : this.getIncome() ? 'Input' : '',
            expand: props.expand || false
        }
    }
    private renderHeader() {
        
        return (
            <div className='ui-output-header'>
                <Segmented 
                    size='small' 
                    onClick={()=>{this.setState({expand: false})}}
                    onChange={(v)=>{
                        this.setState({value: v, expand:false})
                    }}
                    value={this.state.value} 
                    options={[this.getIncome() ? 'Input': null, this.getOutcome() ? 'Output': null].filter(Boolean)} 
                ></Segmented>

                <Icons.VerticalAlignTopOutlined onClick={()=> {
                    this.setState({
                        expand: true
                    })
                }}/>
            </div>
        )
    }
    private getIncome() {
        let { income } = this.props.nodeStatus;

        return income && income.$data;
    }
    
    private getOutcome() {
        let { outcome } = this.props.nodeStatus;

        return outcome && outcome.$data;
    }

    private renderDescription() {

        let valueText: any = this.state.value == 'Input' ? this.getIncome() : this.getOutcome();

        return (
            <div className="ui-run-log-output">
                <ValueView value={valueText} type="auto" />
            </div>
        )
    }
    public render() {
        return (
            <div className={classnames({
                'ui-output-tips': true,
                'ui-output-expand': this.state.expand
            })}>
                {this.renderHeader()}
                {this.renderDescription()}
            </div>
        )
    }
}