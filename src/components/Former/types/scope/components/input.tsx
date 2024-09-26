import React from 'react';
import Context from '../contexts';
import utils from '../utils'

interface FormerScopeInputProps {
    context: any;
    value: string;
    //focus?: boolean;
    index: number;
    onRemoveValue: Function;
    padding?: any;
    onChangeValue: Function;
    parentScope: any;
    serial: number;
    dataType?: any;
    disabled?: boolean;
    strict?: boolean;
    readonly?: boolean;
    addValueIntoScope: Function;
    getScopeValue?: Function;
    className?: string;
}
interface FormerScopeInputState {
    defaultValue: string;
    //focus: boolean;
    value: string;
    index: number;
    serial: number;
    dataType?: any;
    disabled?: boolean;
    strict?: boolean;
    readonly?: boolean;
}


export default class FormerScopeInput extends React.Component<FormerScopeInputProps, FormerScopeInputState> {
    public static contextType = Context;
    public context: any;
    public ref: any;
    private timer: any;
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
            disabled: props.disabled,
            strict: props.strict,
            readonly: props.readonly || false
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

        if (nextProps.strict != this.state.strict) {
            this.setState({
                strict: nextProps.strict
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

        if (nextProps.readonly != this.state.readonly) {
            this.setState({
                readonly: nextProps.readonly
            })
        }
    }
    public componentDidMount(): void {

        this.context.registerInput(this.ref.current, this.props.parentScope)
    }
    public componentWillUnmount(): void {
        this.context.removeInput(this.ref.current)
    }
    private doChangeValue(val: string) {
        this.setState({
            value: val
        }, () => {
            this.props.onChangeValue(this.state.value)
        })
    }
    private doRemoveCursor() {
        let index: number = this.context.findInputIndex(this.ref.current);

        if (false !== this.props.onRemoveValue(index)) {
            setTimeout(() => {
                this.context.onFocus(Math.max(0, index - 1))
            }, 0)
        }
    }
    private doForwardCursor() {
        this.context.onForwardCursor(this.ref.current)
    }
    private doBackwardCursor() {
        this.context.onBackwardCursor(this.ref.current)
    }
    public stop(e) {
        e.stopPropagation();
        e.preventDefault();
    }
    public resetCursorPosition = (e) => {
        let { dataType = [] } = this.props;
        let innerHTML: string = this.ref.current.innerText;

        // 非严格模式下，不支持输入，只支持删除
        if (false == this.props.strict) {
            if ([188].indexOf(e.keyCode) > -1) {
                this.props.addValueIntoScope({
                    $type: 'value',
                    value: utils.getCursorPosition(this.ref.current) == innerHTML.length ? ' ' : '',
                    padding: true
                });
                return this.stop(e);
            }
        } else {
            // 严格模式下面如果是nubmer
            if (dataType.includes('Number')) {

                if (190 == e.keyCode) {
                    if (innerHTML.match(/\./)) {
                        return this.stop(e)
                    }
                }

                if (![8, 37, 190, 39].includes(e.keyCode) && (e.keyCode < 48 || e.keyCode > 57)) {
                    return this.stop(e)
                }

                // 长度
                if (e.keyCode >= 48 && e.keyCode <= 57) {
                    if (!innerHTML.match(/^[0-9]{0,16}(?:\.[0-9]{0,12})?$/)) {
                        return this.stop(e)
                    }
                }

            }
        }

        if ([8, 37, 39].indexOf(e.keyCode) > -1) {

            setTimeout(() => {

                //let spFirst: boolean = innerHTML.charCodeAt(0) === 8203;
                let currentPostion: number = utils.getCursorPosition(this.ref.current);

                if ((innerHTML.length == 0 || currentPostion < 1 && this.lastPostion == currentPostion)) {
                    if (37 == e.keyCode) {
                        this.doForwardCursor();
                    } else if (8 == e.keyCode) {
                        this.doRemoveCursor();
                    } else if (39 == e.keyCode) {
                        this.doBackwardCursor()
                    }
                } else {
                    if (innerHTML.length <= currentPostion && this.lastPostion == currentPostion && 39 == e.keyCode) {
                        this.doBackwardCursor()
                    }
                }
                this.resetLastPosition(currentPostion)
            }, 0)
        } else {

            if (!this.canInput() || e.keyCode == 13) {
                e.stopPropagation();
                return e.preventDefault();
            }
            this.resetLastPosition()
        }
    }
    private resetLastPosition(postion?: number) {
        this.lastPostion = typeof postion == 'number' ? postion : utils.getCursorPosition(this.ref.current)
    }
    public doFocus() {
        if (this.ref.current) {
            this.ref.current.focus();
        }
    }
    private getScopeValue() {

        let scopeValue = this.props.getScopeValue
            ? this.props.getScopeValue()
            : this.context.getCurrentValue();

        return scopeValue;
    }
    /**
     * 判断是否能录入
     */
    public canInput(ig: boolean = false) {
        let { dataType } = this.state;

        if (!ig && dataType) {
            if (!Array.isArray(dataType)) {
                dataType = [dataType]
            }
            if (!dataType.find(type => ['string', 'boolean', "number", 'date', 'datetime'].includes(type.toLowerCase()))) {

                return false;
            }
        }
        // 严格模式
        if (this.state.strict) {

            let value: any = this.getScopeValue();

            return !Array.isArray(value) ? true : value.length == 1 && value[0].$type == 'value';
        }


        if (this.state.disabled) {
            return false;
        }

        return true
    }

    public render() {
        
        return (
            <span
                ref={this.ref}
                data-index={this.state.index}
                data-serial={this.state.serial}
                className={`ui-scope-input ${this.props.className}`}
                contentEditable={this.state.readonly ? false : true}
                {...utils.getOnEventProps(this.props)}
                onBlur={() => {
                    if (this.state.readonly) {
                        return;
                    }
                    //this.setState({focus: false})
                    this.context.setDisabled(false);
                    this.context.onBlur(this.ref.current);

                }}
                onFocus={() => {
                    if (this.state.readonly) {
                        return;
                    }
                    //this.setState({focus: true})
                    if (this.state.strict) {
                        this.context.setDisabled(!this.canInput(true) || !!this.state.value)

                    } else {
                        this.context.setDisabled(this.state.disabled);
                    }
                    this.context.onFocus(this.ref.current, true);
                    this.context.setCurrentDataType(this.state.dataType);

                    this.resetLastPosition();
                }}
                //onKeyDown={this.resetCursorPosition}
                onMouseUp={this.resetCursorPosition}

                onKeyDown={this.resetCursorPosition}
                onPaste={(e) => {
                    e.preventDefault();
                    const text = e.clipboardData.getData('text/plain');

                    utils.insertTextAtCursor(text)
                    this.doChangeValue(text);
                    return e.preventDefault();
                }}
                onInput={({ target }: any) => {
                    let originValue: any = target.innerText.trim().replace(/\<[^\>]+\>/ig, '');
                    if (!originValue) {
                        //this.ref.current.innerHTML = '&#8203;';
                        // this.doFocus();
                    }

                    if (this.canInput()) {

                        this.doChangeValue(originValue);
                        this.resetLastPosition()

                        if (this.state.strict) {
                            this.context.setDisabled(originValue)
                        }
                    }
                }}>{this.state.defaultValue}</span>
        )
    }
}