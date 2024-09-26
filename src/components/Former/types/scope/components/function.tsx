import React from 'react';
import classnames from 'classnames';
import { Button, Popover, Tooltip } from 'antd';
import * as Icons from '../../../../Icons';
import { ScopeManger as FunctionManger } from '@blocksx/eos';
import ScopeTooltip from './panel/tooltip'

interface FormerScopeFunctionProps {
    children: any;
    //index: number;
    value: string;
    parameters: any[]
    onAddParam: Function;
    strict?: boolean;
    readonly?: boolean;
}

interface FormerScopeFunctionState {
    //index: number;
    value: string;
    parameters: any[]
    hight: boolean;
    open:boolean;
    readonly?: boolean;
}

export default class FormerScopeFunction extends React.Component<FormerScopeFunctionProps, FormerScopeFunctionState> {
    private schema: any ;
    public constructor(props: FormerScopeFunctionProps) {
        super(props);

        this.state = {
            //index: props.index,
            value: props.value,
            parameters: props.parameters,
            hight: false,
            open: false,
            readonly: props.readonly || false
        }
        this.schema = FunctionManger.get(props.value)
    }
    
    private getDisplayName(name: string) {
        let split: any[] = name.split('.');
        split.shift();
        return split.join('.')
    }

    public UNSAFE_componentWillReceiveProps(nextProps: Readonly<FormerScopeFunctionProps>, nextContext: any): void {
        if (nextProps.value != this.state.value) {
            this.setState({
                value: nextProps.value
            })
            this.schema = FunctionManger.get(nextProps.value)
        }

        if (nextProps.parameters != this.state.parameters) {
            this.setState({
                parameters: nextProps.parameters
            })
        }

        if (nextProps.readonly != this.state.readonly) {
            this.setState({
                readonly: nextProps.readonly || false
            })
        }
    }
    private highlight =()=> {
        this.setState({
            hight: true
        })
    }
    private unhighlight =()=> {
        this.setState({
            hight: false
        })
    }
    public render() {
        let { children } = this.props;
        let { parameters, value} = this.state;
        let funcmeta: any = this.schema;


        let displayName: string = funcmeta.displayName || this.getDisplayName(value);
        let paramsmeta: any = funcmeta.parameters;
        let restParams: any = paramsmeta && paramsmeta[paramsmeta.length -1];
        let maxParams: number = restParams ? restParams.maxLength || paramsmeta.length : paramsmeta.length;
        let hasAdd: boolean = restParams && restParams.type =='rest' && maxParams > parameters.length
        let number: number = children.length;


        return (
            <span 
                className={classnames({
                    'ui-scope-function': true,
                    'ui-scope-function-hight': this.state.open || this.state.hight
                })}
            >   
                <ScopeTooltip 
                    {...this.schema}
                    onOpenChange={(open)=>this.setState({open})}
                >
                    <span 
                        className='ui-scope-keyword'
                        onMouseEnter={this.highlight}
                        onMouseLeave={this.unhighlight}
                    >
                        <Icons.FunctionOutlined/>
                        {displayName} {paramsmeta.length>0 &&'('}
                    </span>
                </ScopeTooltip>
                {React.Children.map(children, (children: any, index: number) => {
                    return (
                        <>
                            <Tooltip title={(paramsmeta[index]||restParams).description}>{React.cloneElement(children, {})}</Tooltip>
                            {index< number -1 &&  <span>{hasAdd && (index == number -1) ? ':':','}</span>} 
                        </>
                    )

                })}
                {hasAdd && <Tooltip title={`Add more rest parameters`}><Button tabIndex={-1} size='small' onClick={()=> this.props.onAddParam()} type="text"><Icons.EllipsisSuggestionOutlined/></Button></Tooltip>}
                {paramsmeta.length >0 &&<span 
                    className='ui-scope-keyword'
                    onMouseEnter={this.highlight}
                    onMouseLeave={this.unhighlight}
                >{')'}</span>}
            </span>
        )
    }

}