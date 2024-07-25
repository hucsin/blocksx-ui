import React from 'react';
import classnames from 'classnames';
import { Button, Popover, Tooltip } from 'antd';
import * as Icons from '../../../../Icons';
import FunctionManger from '../core/ScopeManger';
import ScopeTooltip from './panel/tooltip'

interface FormerScopeFunctionProps {
    children: any;
    //index: number;
    name: string;
    parameters: any[]
    onAddParam: Function
}

interface FormerScopeFunctionState {
    //index: number;
    name: string;
    parameters: any[]
    hight: boolean;
    open:boolean;
}

export default class FormerScopeFunction extends React.Component<FormerScopeFunctionProps, FormerScopeFunctionState> {
    private schema: any ;
    public constructor(props: FormerScopeFunctionProps) {
        super(props);

        this.state = {
            //index: props.index,
            name: props.name,
            parameters: props.parameters,
            hight: false,
            open: false
        }
        this.schema = FunctionManger.get(props.name)
    }

    private getDisplayName(name: string) {
        let split: any[] = name.split('.');
        split.shift();
        return split.join('.')
    }

    public UNSAFE_componentWillReceiveProps(nextProps: Readonly<FormerScopeFunctionProps>, nextContext: any): void {
        if (nextProps.name != this.state.name) {
            this.setState({
                name: nextProps.name
            })
            this.schema = FunctionManger.get(nextProps.name)
        }

        if (nextProps.parameters != this.state.parameters) {
            this.setState({
                parameters: nextProps.parameters
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
        let { parameters, name} = this.state;
        let funcmeta: any = this.schema;


        let displayName: string = funcmeta.displayName || this.getDisplayName(name);
        let paramsmeta: any = funcmeta.parameters;
        let restParams: any = paramsmeta[paramsmeta.length -1];
        let maxParams: number = restParams.maxLength || paramsmeta.length;
        let hasAdd: boolean = restParams.type =='rest' && maxParams > parameters.length
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
                {hasAdd && <Button tabIndex={-1} size='small' onClick={()=> this.props.onAddParam()} type="text"><Icons.PlusOutlined/></Button>}
                {paramsmeta.length >0 &&<span 
                    className='ui-scope-keyword'
                    onMouseEnter={this.highlight}
                    onMouseLeave={this.unhighlight}
                >{')'}</span>}
            </span>
        )
    }

}