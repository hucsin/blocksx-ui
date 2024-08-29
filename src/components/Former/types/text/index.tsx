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
    private lastPos: number;
    public constructor(props: FormerTextProps) {
        super(props);
        this.state = {
            value: props.value || ''
        }

        this.ref = React.createRef();
        this.lastPos = 0;
    }
    public componentDidMount(): void {
        this.setValue(this.state.value)
    }
    private setValue(val: string) {
        if (this.ref.current) {
            this.ref.current.innerText = val;
            
            //setTimeout(()=> {
            this.lastPos && utils.setCursorPosition(this.ref.current, this.lastPos)
            //}, 0)
        }
    }
    public UNSAFE_componentWillReceiveProps(nextProps: Readonly<FormerTextProps>, nextContext: any): void {
        if (nextProps.value != this.state.value) {
            
            this.setState({
                value: nextProps.value
            }, ()=> {
               this.setValue(nextProps.value)
            })
        }
    }
    private doChangeValue(val: string) {
        this.setState({
            value: val
        })

        this.props.onChangeValue && this.props.onChangeValue(val)
    }
    
    public render() {
        return (
            <span
                ref={this.ref}
                className='ui-former-text'
                contentEditable="true" 
                onBlur={()=> {this.props.onBlur()}}
                autoFocus={false}
                onInput={({ target }: any)=>{
                    let originValue: any = target.innerText.trim().replace(/\<[^\>]+\>/ig, '');
                    if (!originValue) {
                        //this.ref.current.innerHTML = '&#8203;';
                    // this.doFocus();
                    }
                    
                    this.doChangeValue(originValue);
                    this.lastPos =  utils.getCursorPosition(this.ref.current);
                }}
            ></span>
        )
    }
}