import React from 'react';
import classnames from 'classnames';
import { ScopeManger } from '@blocksx/eos';
import { utils } from '@blocksx/core';
import { Popover,Alert } from 'antd';
import { Icons } from '@blocksx/ui';


interface PanelTooltipProps {
    children: any;
    name: string;
    title?: string,
    subtitle?: string;
    $type?: string;
    description: string;
    examples?: any[];
    parameters?: any[]; 
    returns ?: any;
    value?: any;
    onOpenChange?: Function;
    icon?: any;
    subname?: string;
    other?: any[];
    message?: any;

}
interface PanelTooltipState {
    message?: any;
    currentIndex: number;
}
export default class PanelTooltip extends React.Component<PanelTooltipProps, PanelTooltipState> {
    public constructor(props: any) {
        super(props);
        this.state = {
            message: props.message,
            currentIndex: -1
        }
    }
    public UNSAFE_componentWillReceiveProps(nextProps: Readonly<PanelTooltipProps>, nextContext: any): void {
        if (nextProps.message != this.state.message) {
            this.setState({
                message: nextProps.message
            })
        }
    }
    public renderBody() {
        let { description , parameters, examples, returns = {}, other } = this.props;

        if (returns.dataType && !Array.isArray(returns.dataType)) {

            returns.dataType = [returns.dataType || returns.type]
        }
        
        return (
            <div 
                className='ui-function-tips-inner'
                onMouseDown={(e)=> {
                    e.preventDefault();
                }}
            >
                
                <div className='ant-popover-title'>
                    {this.getDefaultTitle()}
                </div>
                <div className='ui-function-info'>
                    <p>{description}</p>

                    {examples && examples.length>0 && <dl className='ui-scope-tooltip'>
                        <dt>Examples</dt>
                        <dd className='ui-scope-examples'><ul>{examples.map((item, index)=> {
                            return (
                                <li><div title={`Call ${this.props.name}() function `}>{this.props.name}({item.map((it, index)=> {
                                    return <span className={classnames({
                                        'ui-selected': index == Math.min(this.state.currentIndex, item.length - 1)
                                    })}>{JSON.stringify(it)}</span>
                                })})</div><div title="Return values." className='rv'>{JSON.stringify(ScopeManger.callScope(this.props.name,item))}</div></li>
                            )
                        })}</ul></dd>
                    </dl>}

                    {parameters && parameters.length>0 && <dl>
                        <dt>Parameters</dt>
                        {parameters.map((it, index)=> {
                            if (it.type =='rest') {
                                return (
                                    <dd  className={classnames({
                                        'ui-selected': index == Math.min(this.state.currentIndex, parameters.length - 1)
                                    })} onMouseEnter={()=>{this.setState({currentIndex: index})}} onMouseLeave={()=> {this.setState({currentIndex: -1})}}>... optional({it.maxLength - index}) parameters  {"<" + it.dataType +">"}</dd>
                                )
                            } else {
                                return (
                                    <dd className={classnames({
                                        'ui-selected': index == Math.min(this.state.currentIndex, parameters.length - 1)
                                    })} onMouseEnter={()=>{this.setState({currentIndex: index})}} onMouseLeave={()=> {this.setState({currentIndex: -1})}}>
                                        {index+1}.  <span>{it.name}</span> <span>{"<"+it.dataType+">"}</span> <span>{utils.labelName(it.description)}</span>
                                    </dd>
                                )
                            }
                        })}
                    </dl>}
                    {returns && returns.dataType &&<dl>
                        <dt>Returns</dt>
                        <dd>{'<'+returns.dataType.join('|')+'>'}</dd>
                        {returns.description  &&<dd>{utils.labelName(returns.description)}</dd>}
                    </dl>}

                    { other && other.map(it => {
                        return (
                            <dl><dt>{it.name}{it.subname&&<span>{it.subname}</span>}</dt><dd>{utils.labelName(it.description)}</dd></dl>
                        )
                    })}

                </div>
                
            </div>
        );
    }
    private getPopTitle = ()=> {
        let { parameters, name = "" } = this.props;
        let tname: any = (name || "").split('.');
        if (parameters) {
            
            return (<div className='ui-tooltip-title'>
                <p>{tname[0]}</p>
                {parameters.length==0 ?<p>{name}</p> : <p>{name}
                    {'(' +parameters.map(it=> {
                        if (it.type !=='rest') {
                            return it.name;
                        } else {
                            return '...'
                        }
                    }).join(',') + ')'}
                </p>}
            </div>)
        }
        return <div className='ui-tooltip-title'>
            <p>{this.props.title || tname[0]}</p>
            <p>{this.props.subtitle}</p>
        </div>
    }

    private getTitleIcon() {
        
        if (this.props.icon) {
            return this.props.icon;
        }

        switch(this.props.$type) {
            case 'function':
                return <Icons.FunctionOutlined/> 
            case 'scope':
                return <Icons.FlowUtilityOutlined/>;
            default:
                return <Icons.VariableUtilityOutlined/>;

        }
        
    }
    private getDefaultTitle() {
        return (
            <>
                {this.getTitleIcon()}
                {this.getPopTitle()}
                {this.props.subname && <span>{this.props.subname}</span>}
            </>
        )
    }
    public render() {
        return (
            <Popover
                overlayClassName='ui-scope-panel-tooltip'
                mouseEnterDelay={.5}
                title={''} 
                content={this.renderBody()}
                placement='left'
                onOpenChange={(v)=> this.props.onOpenChange && this.props.onOpenChange(v)}
            >
                {this.props.children}
            </Popover>
        )
    }
}