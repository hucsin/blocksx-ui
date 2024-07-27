import React from 'react';
import classnames from 'classnames';
import { FormerTypes } from '@blocksx/ui';

interface ProcessNodeProps {
    left: number;
    top: number;
    name: string;
    icon: string;
    color: string;
    serial: number;
    props: any;
    disabled:boolean;
    onClick: Function;
    selected: boolean;
}
export default class ProcessNode extends React.Component<ProcessNodeProps, {selected: boolean;left: number, top: number}> {
    private timer: any;
    public constructor(props: ProcessNodeProps) {
        super(props);
        this.state ={
            left: props.left,
            top: props.top,
            selected: props.selected
        }
    }
    public UNSAFE_componentWillReceiveProps(nextProps: Readonly<ProcessNodeProps>, nextContext: any): void {
        if (nextProps.left != this.state.left || nextProps.top != this.state.top ) {
            this.setState({
                left: nextProps.left,
                top: nextProps.top
            })
        }

        if (nextProps.selected != this.state.selected) {
            this.setState({
                selected: nextProps.selected
            })
        }
    }
    public render () {
        let { name, icon, color, props ={}, disabled } = this.props;
        if (disabled) {
            color = '#ccc'
        }
        return (
            <div 
                id ={name}
                style={{
                    '--color': color,
                    '--hover-color': color + '66',
                    left: this.state.left,
                    top: this.state.top,
                } as any}
                className={classnames({
                    "ui-scope-process-node": true,
                    'ui-scope-process-disabled': disabled,
                    'ui-scope-process-selected': this.state.selected
                })}
                onClick={()=> {
                    if (!disabled) {
                        this.props.onClick()
                    }
                }}
                onMouseEnter={() => {
                    if (!disabled) {
                        //if (this.timer) {
                        //    clearTimeout(this.timer)
                        //}
                        //this.timer = setTimeout(()=> {
                        //    this.props.onClick();
                       //     this.timer = null;
                      //  },200)
                    }
                }}
                onMouseLeave={()=> {
                    //if (this.timer) {
                     //   clearTimeout(this.timer);
                    //}
                }}
            >
                <FormerTypes.avatar reverseColor={true} size={64}  icon={icon} color={color}/>
                {props && <div className='ui-scope-text'>{props.method}<span>{this.props.serial}</span></div>}
            </div>
        )
    }
}