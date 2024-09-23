import React from 'react';
import classnames from 'classnames';
import { utils } from '@blocksx/core';
import { Popover, Button } from 'antd';

import * as Icons from '../../../Icons';
import ScopeUtils from './utils'
import FormerScopeValue from './components/value';
import ScopePanel from './components/panel';
import Context from './contexts';
import { ScopeType } from './types';
import ScopeLabel from './components/scope';


import './testmang';// TODO remove
import './style.scss';
import SmartRequest from '@blocksx/ui/utils/SmartRequest';



/**
 * 支持3种
 * 
 * 定义：
 * 1、支持函数，function
 * {
 *      type: 'function',
 *      name: 'Math.abs',
 *      description: '',
 *      parameters: [
 *          {
 *              dataType: 'String',
 *              description: ''
 *          },
 *          {
 *              type: 'rest', // ...d
 *              dataType: ['Array<String|Object>', 'Array<Object>']
 *          }
 *      ],
 *      return: {
 *          dataType: ['Array','String'],
 *          description: ''
 *      }
 * }
 * 2、支持变量，scope
 * 
 * {
 *  type: 'scope',
 *  scope: 'storge.igc'
 * }
 * 
 * 3、支持常亮，value
 */


interface FormerScopeProps {
    onChangeValue: Function;
    value: any;
    props: any;
    onFocus?: Function;
    former: any;
    onBlur?: Function;
    readonly?: boolean;
}
interface FormerScopeState {
    value: ScopeType[],
    focusIndex: number;
    open: boolean;
    focusopen: boolean;
    width: any;
    props: any;
    openTotal: number;
    currentDataType: any;
    disabled?: boolean;
    readonly?: boolean;
    disabledBlur?: boolean;
    loading?: boolean;
}

class FormerScopeViewer extends React.Component<FormerScopeProps, FormerScopeState> {
    public renderScope(scope: any) {
        switch(scope.$type) {
            case 'value':
                return (
                    <span>{scope.value}</span>
                )
            case 'scope':
                return (
                    <ScopeLabel {...scope} />
                )
        }
    }
    public render() {
        let { value =  [] } = this.props;
        
        return (
            <>
                {value.map(it => this.renderScope(it))}
            </>
        )
    }
}

export default class FormerScope extends React.Component<FormerScopeProps, FormerScopeState> {
    public static Viewer = FormerScopeViewer;
    private inputList: any;
    private inputScopeMap: any;
    private focusInput: any;
    private lastFocus: any;
    private lastFocusIndex: number;

    private timer: any;
    private innerRef: any;
    private defaultProps: any;
    public constructor(props: FormerScopeProps) {
        super(props);
        this.inputList = [];
        this.inputScopeMap = {}
        this.defaultProps = this.props.props || this.props['x-type-props'] || {}
        this.state = {
            focusIndex: -1,
            value: props.value,
            open: false,
            width: this.defaultProps.width,
            props: props.props,
            focusopen: false,
            openTotal: 1,
            currentDataType: null,
            disabled: false,
            readonly: props.readonly || false,
            disabledBlur: false,
            loading: false
        }

        this.innerRef = React.createRef();

    }

    public UNSAFE_componentWillReceiveProps(nextProps: Readonly<FormerScopeProps>, nextContext: any): void {
        if (nextProps.value !== this.state.value) {
            this.setState({
                value: nextProps.value
            })
        }

        if (typeof nextProps.props !== 'undefined') {
            if (nextProps.props !== this.state.props || (nextProps.props.width != this.state.width)) {
                this.setState({
                    props: nextProps.props,
                    ...nextProps.props
                })
            }
        } else {
            this.setState({
                props: this.defaultProps,
                ...this.defaultProps
            })
        }   
        if (nextProps.readonly != this.state.readonly) {
            this.setState({
                readonly: nextProps.readonly
            })
        }

    }
    public onGetDependentParameters(params: any = {}) {

        return this.props.former && this.props.former.props.onGetDependentParameters 
            ? this.props.former.props.onGetDependentParameters(params) : {}
    }
    private clearValue(val: any) {
        return Array.isArray(val) ? val.filter(it => {
            return !!it.value
        }) : val;
    }
    public doChangeValue(val?: any) {
        
        let value: any = this.clearValue(val);
        this.setState({
            value: utils.isUndefined(value) ?  utils.copy(this.state.value) : value
        }, () => {
            this.props.onChangeValue(this.state.value)
        })
    }

    private registerInput = (inputRef: any, scope: any) => {
        let inputUniq: any = inputRef.dataset.index;
        this.inputList.push(inputRef);

        this.inputScopeMap[inputUniq] = scope;
    }
    private findInputIndex = (inputRef: any) => {
        let sortCursor: any = this.getSortCursorList();

        return sortCursor.findIndex(it => inputRef == it);
    }
    private removeInput = (inputRef: any) => {
        let inputUniq: any = inputRef.dataset.index;
        this.inputList = this.inputList.filter(it => it != inputRef);

        delete this.inputScopeMap[inputUniq];
    }
    // 添加value到当前的scope
    public addValueIntoScope =  (scopeValue: any) => {
        let currentInput: any = this.lastFocus;

        if (currentInput) {

            let uniq: any = currentInput.dataset.index;
            let scope: any = this.inputScopeMap[uniq];
            if (scope) {
                let value: string = currentInput.innerText;
                let cursorPosition: number = ScopeUtils.getCursorPosition(currentInput);
                let serial: number = Math.max(0, parseInt(currentInput.dataset.serial, 10));

                scope.addValueIntoScope(cursorPosition, value, serial, scopeValue, this.findInputIndex(currentInput))
            }
        }

    }
    private findInputRange = () => {

        if (this.lastFocus) {
            return ScopeUtils.getSursorRange(this.lastFocus);
        }
    }

    private autoFocusByEvent(event: any) {
        let pageY: number = event.pageY;
        let pageX: number = event.pageX;

        // 先过滤出一排的
        let rowitem: any[] = this.inputList.map(it => {
            let rect: any = it.getBoundingClientRect();
            if (rect.top - 4 <= pageY && (rect.top + rect.height + 4) >= pageY) {
                return {
                    item: it,
                    rect
                };
            }
        }).filter(Boolean);

        if (rowitem.length > 0) {

            let sortitem: any = rowitem.sort((a, b) => {
                return a.rect.left > b.rect.left ? -1 : 1
            })

            let finditem = sortitem.find(it => {
                return it.rect.left < pageX
            });


            this.onFoucs(finditem ? finditem.item : sortitem.pop().item)

        } else {
            // 最后一个焦点
            this.onFoucs();
        }
    }
    private onFoucs = (current?: any, isAct?: any) => {
        if (this.state.readonly) {
            return;
        }

        if (this.timer) {
            clearTimeout(this.timer);
        }

        if (this.props.onFocus) {
            this.props.onFocus();
        }
        this.setState({ focusopen: true })

        this.timer = setTimeout(() => {
            this.timer = null;
            this.setState({ open: true, openTotal: this.state.openTotal + 1 });
        }, 200)

        if (isAct === true) {
            // cache 缓存的位置
            this.lastFocusIndex = ScopeUtils.getCursorPosition(current);
            return this.lastFocus = this.focusInput = current;
        }

        if (!utils.isUndefined(current)) {
            if (typeof current === 'number') {
                let currentIndex: any = current;
                let sortCursor: any = this.getSortCursorList();

                current = sortCursor[currentIndex] || sortCursor[currentIndex - 1];

                if (!current) {
                    current = sortCursor[sortCursor.length - 1];
                }
            }

        } else {

            current = this.inputList[this.inputList.length - 1];
        }


        if (current) {
            current.focus();
            if (current.innerText.length) {

                let position: number = utils.isUndefined(isAct) || isAct == -1 ? current.innerText.length : isAct;

                ScopeUtils.setCursorPosition(current, position)
            }
            this.lastFocusIndex = ScopeUtils.getCursorPosition(current);
            this.focusInput = current;

            this.lastFocus = current;
        }
    }
    private onDisabledBlur = (disabled: boolean = true) => {
       
        this.setState({
            disabledBlur: disabled
        })
        this.onFoucs(this.focusInput)
    }
    private onBlur = (current) => {
        if (this.state.readonly || this.state.disabledBlur) {
            return;
        }
        
        //this.focusInput = null;
        if (current == this.focusInput) {
            this.focusInput = null;
            if (this.timer) {
                clearTimeout(this.timer);
            }
            this.timer = setTimeout(() => {
                this.setState({
                    open: false,
                    focusopen: false
                })
                if (this.props.onBlur) {
                    this.props.onBlur();
                }
            }, 100)
        }

    }
    private getSortCursorList() {
        return this.inputList.sort((a, b) => {
            return parseInt(a.dataset.index, 10) > parseInt(b.dataset.index, 10) ? 1 : -1
        })
    }
    private getAfterBeforeInput(current: any, dir: string = 'before') {
        let currentIndex: number = current.dataset.index;
        let sortCursor: any = this.getSortCursorList();
        let findIndex: number = sortCursor.findIndex((it) => {
            return it.dataset.index == currentIndex;
        })

        if (dir == 'before') {
            if (findIndex > 0) {
                return sortCursor[findIndex - 1]
            }
        } else {
            if (findIndex < sortCursor.length) {
                return sortCursor[findIndex + 1]
            }
        }
    }

    private onForwardCursor = (current: any) => {
        let forwardInput = this.getAfterBeforeInput(current);
        if (forwardInput) {
            forwardInput.focus();
            if (forwardInput.innerText.length) {
                ScopeUtils.setCursorPosition(forwardInput, forwardInput.innerText.length)
            }
        }
    }
    private onBackwardCursor = (current) => {
        let forwardInput = this.getAfterBeforeInput(current, 'after');
        if (forwardInput) {
            forwardInput.focus();
        }
    }

    private isEmptyValue(value: any) {
        
        if (Array.isArray(value)) {
            if (value.length == 1) {
                return !value[0].value;
            }
            return value.length == 0;
        }

        return !value;
    }

    private isOneValue(value: any) {

        if (Array.isArray(value)) {
            //console.log(value, 3220019191)
            return value.length <= 1;
        }

        return true;
    }
    private renderPrefix(icon: string) {
        let IconView: any = Icons[icon]
        if (IconView) {
            return (
                <IconView />
            )
        }
        return null;
    }
    private getTypeProps() {
        return this.state.props || this.state.props || this.props['x-type-props'] || {};
    }
    public bindStorage = (e) => {
        let former: any = this.props.former;
        let typeProps: any = this.getTypeProps();
        let requetHelper: any = SmartRequest.makePostRequest(typeProps.bind.path)

        if (requetHelper) {
            this.setState({loading: true});
            former && former.setLoading(true);

            requetHelper({
                storageId: this.state.value
            }).then((res) => {
                this.setState({loading: false});
                if (former) {
                    former.resetSafeValue(res, undefined, (value) => {
                        former.stepFormer.setStepOne(false);
                    })
                    former.setLoading(false);
                    console.log(res,222)
                    //
                }
            }).catch(()=> {
                this.setState({loading: false})
                former && former.setLoading(false);
            })
        }
        
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
    private cansomStop(e: any) {
        e.preventDefault();
        e.stopPropagation();
    }
    public render() {
        let { value } = this.state;
        let typeProps: any = this.getTypeProps();
        let strict: boolean = utils.isUndefined(typeProps.strict) ? true : typeProps.strict;
        let width: any = this.state.width || typeProps.width;
        let isEmptyValue: boolean = this.isEmptyValue(value);
        let disabled: boolean = typeProps.struct ? !this.isOneValue(value) : false;
        let opened: any = this.state.disabled ? this.state.open : this.state.open;
        
        // dataType
        // 第一个节点
        return (
            <Context.Provider value={{
                findInputIndex: this.findInputIndex,
                registerInput: this.registerInput,
                removeInput: this.removeInput,
                onDisabledBlur: this.onDisabledBlur,

                onForwardCursor: this.onForwardCursor,
                onBackwardCursor: this.onBackwardCursor,
                onFocus: this.onFoucs,
                onBlur: this.onBlur,
                findInputRange: this.findInputRange,
                setDisabled: (disabled:boolean) => {
                    
                    this.setState({
                        disabled: !!disabled
                    })
                },
                setCurrentDataType: (dataType: any)=> {
                    this.setState({
                        currentDataType: dataType
                    })
                },
                getCurrentValue: () => {
                    return this.state.value;
                }
            }}>
            <Popover
                overlayClassName="ui-scope-panel"
                content={opened 
                    ? <ScopePanel 
                        iterator={typeProps.iterator}
                        disabled={this.state.disabled} 
                        readonly={this.state.readonly}
                        dataType={this.state.currentDataType} 
                        open={opened} 
                        strict={strict} 
                        panel={typeProps.panel}
                        total={this.state.openTotal} 
                        scope={this}
                        value = {value}
                        getFormerValue={()=> {
                            return this.props.former.getValue() 
                        }}
                        onGetDependentParameters={()=> this.onGetDependentParameters()}
                      />
                    : null
                }
                open={opened}
                placement={'left'}
            >
                <div
                    className={classnames('ui-scope', {
                        'ui-scope-focus':this.state.focusopen,
                        'ui-scope-more': !strict,
                        'ui-scope-visibility': this.state.width === 0,
                        'ui-scope-textarea': typeProps.type == 'textarea'
                    })}
                    style={{
                        width: width
                    }}
                    onMouseDown={(e: any) => {

                        if (e.target.getAttribute('contenteditable') !== 'true') {
                            this.autoFocusByEvent(e)
                            e.preventDefault();
                        }
                    }}
                    onMouseUp={(e: any) => {
                        if (!this.focusInput) {
                            this.onFoucs();
                        } else {

                            // 动态计算

                            if (!e.target.getAttribute('contenteditable')) {
                                this.autoFocusByEvent(e)
                            }
                            // 
                            //  this.lastFocus.focus();
                            //  ScopeUtils.setCursorPosition(this.lastFocus, this.lastFocusIndex);
                        }
                    }}
                >
                    <div className={classnames({
                        'ui-scope-inner': true,
                        'ui-scope-prefix': typeProps.prefix,
                        'ui-scope-bind': typeProps.bind
                    })} ref={this.innerRef}>
                        {this.renderPrefix(typeProps.prefix)}
                        <div className='ui-scope-content'>
                        {typeProps.placeholder && isEmptyValue && <div className='ui-scope-placeholder'>{typeProps.placeholder}</div>}
                        
                            {<FormerScopeValue 
                                readonly={this.state.readonly} 
                                prefix={typeProps.prefix} 
                                disabled={disabled} 
                                strict={strict} 
                                dataType={typeProps.dataType}
                                addValueIntoScope={this.addValueIntoScope}
                                onRemoveValue={() => { }} 
                                onChangeValue={(val) => {
                                    if (!this.state.readonly) {
                                        this.doChangeValue(val)
                                    }
                                    
                                }} 
                                value={value && value.length ? value :[{$type:'value', value: ''}]} 
                            />}
                        </div>
                        {typeProps.bind && <Button onMouseDown={this.cansomStop} onMouseUp={this.cansomStop} loading={this.state.loading} onClick={this.bindStorage} size='small' disabled={isEmptyValue} type='primary'>{typeProps.bind.text || 'Bind'}</Button>}
                    </div>
                </div>
            </Popover>
            </Context.Provider>
        )
    }
}