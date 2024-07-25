import React from 'react';
import { Popover } from 'antd';
import { Icons } from '@blocksx/ui';

interface PanelTooltipProps {
    children: any;
    name: string;
    type?: string;
    description: string;
    parameters?: any[]; 
    returns ?: any;
    value?: any;
    onOpenChange?: Function;
    icon?: any;
    subname?: string;
    other?: any[]
}
interface PanelTooltipState {

}
export default class PanelTooltip extends React.Component<PanelTooltipProps, PanelTooltipState> {
    public renderBody() {
        let { description , parameters, returns, other } = this.props;
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
                    {parameters && parameters.length>0 && <dl>
                        <dt>Parameters</dt>
                        {parameters.map((it, index)=> {
                            if (it.type =='rest') {
                                return (
                                    <dd>... {it.maxLength - index} rest parameters</dd>
                                )
                            } else {
                                return (
                                    <dd>
                                    {index+1}.  <span>{it.name}</span> <span>{"<"+it.dataType+">"}</span> <span>{it.description}</span>
                                    </dd>
                                )
                            }
                        })}
                    </dl>}
                    {returns &&<dl>
                        <dt>Returns {'<'+returns.dataType.join('|')+'>'}</dt>
                        {returns.description  &&<dd>{returns.description}</dd>}
                    </dl>}

                    { other && other.map(it => {
                        return (
                            <dl><dt>{it.name}{it.subname&&<span>{it.subname}</span>}</dt><dd>{it.description}</dd></dl>
                        )
                    })}
                </div>

            </div>
        );
    }
    private getPopTitle = ()=> {
        let { parameters } = this.props;
        if (parameters) {
            
            if (parameters.length==0) {
                return this.props.name
            }

            return (<>
                {this.props.name}
                {'('}
                {parameters.map(it=> {
                    if (it.type !=='rest') {
                        return it.name;
                    } else {
                        return '...'
                    }
                }).join(',')}
                {')'}
            </>)
        }
        return this.props.name
    }
    private getTitleIcon() {
        
        if (this.props.icon) {
            return this.props.icon;
        }

        switch(this.props.type) {
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
                onOpenChange={(v)=> this.props.onOpenChange && this.props.onOpenChange(v)}
            >
                {this.props.children}
            </Popover>
        )
    }
}