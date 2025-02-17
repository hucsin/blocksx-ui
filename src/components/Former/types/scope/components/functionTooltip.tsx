import React from 'react';
import classname from 'classnames';
import { ScopeManger } from '@blocksx/scope';
import * as FormerTypes from '../../index';
import { Popover } from 'antd'

interface FunctionTooltipProps {
    children: any;
    schema: any;
    index: number;
}

interface FunctionTooltipState {
    index: number;
    schema: any;
}

export default class FunctionTooltip extends React.Component<FunctionTooltipProps, FunctionTooltipState> {
    public constructor(props: FunctionTooltipProps) {
        super(props);

        this.state = {
            schema: props.schema,
            index: props.index
        }
    }
    public UNSAFE_componentWillReceiveProps(nextProps: Readonly<FunctionTooltipProps>, nextContext: any): void {
        if (nextProps.index != this.state.index) {
            this.setState({
                index: nextProps.index
            })
        }
    }
    private renderTitle() {

        let { schema = {} } = this.state;

        return (<>
                <FormerTypes.avatar icon="FunctionOutlined"/>
                <span style={{paddingLeft: 8}}>{schema.name}</span>
            </>
        )
    }
    private renderParameters() {
        let { schema = {} } = this.state;
        let parameters:any = schema.parameters || [];
        let examples: any = schema.examples;
        
        return (
            <div className='ui-function-tooltip-wrapper'>
                <p>{schema.description}</p>
                {examples && examples.length>0 && <dl>
                        <dt>Examples</dt>
                        <dd><ul>{examples.map((item, index)=> {
                            return (
                                <li><div title={`call ${schema.name}() function `}>{schema.name}({item.map((it, index)=> {
                                    return <span className={classname({
                                        'ui-selected': index == Math.min(this.state.index, item.length - 1)
                                    })}>{JSON.stringify(it)}</span>
                                })})</div><div title="Return values." className='rv'>{JSON.stringify(ScopeManger.callScope(schema.name,item))}</div></li>
                            )
                        })}</ul></dd>
                    </dl>}

                <dl>
                    <dt>Parameters</dt>
                    <dd className='u'>
                    {schema.name}({parameters.map((it, index) => {
                            return (
                                <span className={classname({
                                    'ui-selected': index == Math.min(this.state.index, parameters.length - 1)
                                })}>{it.name=='Rest'?'...' :'' }{it.name}{`<${it.dataType}>`}</span>
                            )
                        })})
                    </dd>
                </dl>
                
            </div>
        )
    }
    public render() {
        return (
            <Popover
                title={this.renderTitle()}
                rootClassName='ui-function-tooltip'
                
                content={this.renderParameters()}
            >{this.props.children}</Popover>
        )
    }
}