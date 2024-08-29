import React from 'react';
import Context from '../contexts';
import utils from '../utils'

interface FormerScopeInputProps {
    context: any;
    value: string;
    //focus?: boolean;
    index: number;
    onRemoveValue: Function;
    onChangeValue: Function;
    parentScope: any;
    serial: number;
    dataType?: any;
    disabled?: boolean;
}
interface FormerScopeInputState {
    defaultValue: string;
    //focus: boolean;
    value: string;
    index: number;
    serial:number;
    dataType?: any;
    disabled?: boolean;
}


export default class FormerScopeInput extends React.Component<FormerScopeInputProps, FormerScopeInputState> {
    public static contextType = Context;
    public context: any;
    public ref: any;
    private timer: any ;
    private lastPostion: number;
    public constructor(props: FormerScopeInputProps) {
        super(props);

        this.state = {
            defaultValue: props.value,
            value: props.value,
            //focus: props.focus || false,
            index: props.index,
            serial: props.serial,
            dataType: props.dataType,
            disabled: props.disabled
        }

        this.ref = React.createRef();
    }

    public UNSAFE_componentWillReceiveProps(nextProps: Readonly<FormerScopeInputProps>, nextContext: any): void {
        
        if (nextProps.value != this.state.value) {
            this.setState({
                value: nextProps.value
            }, () => {
                this.ref.current.innerHTML = this.state.value;
            })
        }
        
        if (nextProps.index != this.state.index) {
            this.setState({
                index: nextProps.index
            })
        }

        if (nextProps.serial != this.state.serial) {
            this.setState({
                serial: nextProps.serial
            })
        }
        
        if (nextProps.dataType != this.state.dataType) {
            
            this.setState({
                dataType: nextProps.dataType
            })
        }

        if (nextProps.disabled != this.state.disabled) {
            this.setState({
                disabled: nextProps.disabled
            })
        }
    }
    public  componentDidMount(): void {
        
        this.context.registerInput(this.ref.current, this.props.parentScope)
    }
    public  componentWillUnmount(): void {
        this.context.removeInput(this.ref.current)
    }
    private doChangeValue(val: string) {
        this.setState({
            value: val
        }, ()=> {
            this.props.onChangeValue(this.state.value)
        })
    }
    private doRemoveCursor() {
        let index: number = this.context.findInputIndex(this.ref.current);
        
       if (false !==this.props.onRemoveValue(index)) {
            setTimeout(()=> {
                this.context.onFocus(Math.max(0,index -1))
            }, 0)
        }
    }
    private doForwardCursor() {
        this.context.onForwardCursor(this.ref.current)
    }
    private doBackwardCursor() {
        this.context.onBackwardCursor(this.ref.current)
    }
    
    public resetCursorPosition =(e)=> {
        
        let innerHTML: string = this.ref.current.innerText;
        
        
        if ([8,37,39].indexOf(e.keyCode) > -1) {
            
            setTimeout(()=> {
                
                //let spFirst: boolean = innerHTML.charCodeAt(0) === 8203;
                let currentPostion: number = utils.getCursorPosition(this.ref.current);
                
                if ((innerHTML.length == 0 || currentPostion <1 && this.lastPostion == currentPostion) ) {
                    if (37 == e.keyCode) {
                        this.doForwardCursor();
                    } else if (8 == e.keyCode){
                        this.doRemoveCursor();
                    } else if (39 == e.keyCode) {
                        this.doBackwardCursor()
                    }
                } else {
                    if (innerHTML.length <= currentPostion &&  this.lastPostion == currentPostion && 39 == e.keyCode) {
                        this.doBackwardCursor()
                    }
                }
                this.resetLastPosition(currentPostion)
            }, 0)
        } else {    
            if (!this.canInput() || e.keyCode ==13) {
                e.stopPropagation();
                return e.preventDefault();
            }
            this.resetLastPosition()
        }
    }
    private resetLastPosition(postion?: number) {
        this.lastPostion = typeof postion =='number' ? postion : utils.getCursorPosition(this.ref.current)
    }
    public doFocus() {
        if (this.ref.current) {
            this.ref.current.focus();
        }
    }
    /**
     * 判断是否能录入
     */
    public canInput() {
        let { dataType } = this.state;
        
        if(this.state.disabled) {
            return false;
        }

        if (dataType ) {
            if (!Array.isArray(dataType)) {
                dataType = [dataType]
            }
            return dataType.find(type => ['string', 'boolean', "number", 'date'].includes(type.toLowerCase()))
        }
        
        return true
    }
    public render() {
        
        return (
            <span 
                ref={this.ref} 
                data-index={this.state.index}
                data-serial={this.state.serial}
                className="ui-scope-input" 
                contentEditable="true" 
                onBlur={()=> { 
                    //this.setState({focus: false})
                    this.context.setDisabled(false);
                    this.context.onBlur(this.ref.current);
                    
                }} 
                onFocus={()=> {
                    //this.setState({focus: true})
                    this.context.setDisabled(this.state.disabled);
                    this.context.onFocus(this.ref.current, true);
                    this.context.setCurrentDataType(this.state.dataType);
                    
                    this.resetLastPosition();
                }}
                //onKeyDown={this.resetCursorPosition}
                onMouseUp={this.resetCursorPosition}
                
                onKeyDown={this.resetCursorPosition}
                onPaste ={(e)=> {
                    e.preventDefault();
                    const text = e.clipboardData.getData('text/plain');
                    utils.insertTextAtCursor(text)
                    return e.preventDefault();
                }}
                onInput={({ target }: any)=>{
                    let originValue: any = target.innerText.trim().replace(/\<[^\>]+\>/ig, '');
                    if (!originValue) {
                        //this.ref.current.innerHTML = '&#8203;';
                       // this.doFocus();
                    }
                    
                    this.doChangeValue(originValue);
                    this.resetLastPosition()
            }}>{this.state.defaultValue}</span>
        )
    }
}