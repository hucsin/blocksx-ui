import React from 'react';
import { IFormerBase } from '../../typings';
import './style.scss'
import utils from '../scope/utils'

interface FormerTextProps extends IFormerBase {
    value: any,
    pre?: boolean;
    onChangeValue: Function;
    onBlur: Function;
}
interface FormerTextState {
    value: any;
    
}

export default class FormerText extends React.Component<FormerTextProps, FormerTextState> {
    private ref: any;
    public constructor(props: FormerTextProps) {
        super(props);
        this.state = {
            value: props.value || ''
        }
        this.ref = React.createRef();
    }
    public UNSAFE_componentWillReceiveProps(nextProps: Readonly<FormerTextProps>, nextContext: any): void {
        if (nextProps.value != this.state.value) {
            this.setState({
                value: nextProps.value
            })
        }
    }
    private doChangeValue(val: string) {
        this.setState({
            value: val
        })

        this.props.onChangeValue && this.props.onChangeValue(val)
    }
    private resetLastPosition() {
        let currentNumber: number = utils.getCursorPosition(this.ref.current);
        //this.lastPostion = typeof postion =='number' ? postion : utils.getCursorPosition(this.ref.current)
        setTimeout(()=> {
            utils.setCursorPosition(this.ref.current, currentNumber)
        }, 0)
    }
    public render() {
        return (
            <span
                ref={this.ref}
                className='ui-former-text'
                contentEditable="true" 
                onBlur={()=> {this.props.onBlur()}}
                onInput={({ target }: any)=>{
                    let originValue: any = target.innerText.trim().replace(/\<[^\>]+\>/ig, '');
                    if (!originValue) {
                        //this.ref.current.innerHTML = '&#8203;';
                    // this.doFocus();
                    }
                    
                    this.doChangeValue(originValue);

                    this.resetLastPosition();
                }}
            >{this.state.value}</span>
        )
    }
}