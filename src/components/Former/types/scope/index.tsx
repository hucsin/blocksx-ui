import React from 'react';
import classnames from 'classnames';
import { utils } from '@blocksx/core';
import { Popover } from 'antd';

import ScopeUtils from './utils'
import FormerScopeValue from './components/value';
import ScopePanel from './components/panel';
import Context from './contexts';
import { ScopeType } from './types';


import './testmang';// TODO remove
import './style.scss';



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
    onBlur?: Function;
}
interface FormerScopeState {
    value: ScopeType[],
    focusIndex: number;
    open: boolean;
    focusopen: boolean;
    width: any;
    props: any;
}

export default class FormerScope extends React.Component<FormerScopeProps, FormerScopeState> {
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
            focusopen: false
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

    }
    public doChangeValue(val?: any) {
        this.setState({
            value: val || utils.copy(this.state.value)
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
    public addValueIntoScope(scopeValue: any) {
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

        if (this.timer) {
            clearTimeout(this.timer);
        }

        if (this.props.onFocus) {
            this.props.onFocus();
        }
        this.setState({ focusopen: true })

        this.timer = setTimeout(() => {
            this.timer = null;
            this.setState({ open: true });
        }, 100)

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
    private onBlur = (current) => {
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



    public render() {
        let { value } = this.state;
        let tyepProps: any = this.state.props || this.state.props || this.props['x-type-props'] || {};
        let width: any = this.state.width || tyepProps.width;

        // 第一个节点
        return (
            <Popover
                overlayClassName="ui-scope-panel"

                content={<ScopePanel open={this.state.open} scope={this} />}
                open={this.state.open}
                placement={'left'}

            >
                <div
                    className={classnames('ui-scope', {
                        'ui-scope-focus': this.state.focusopen,
                        'ui-scope-visibility': this.state.width === 0
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
                    <div className='ui-scope-inner' ref={this.innerRef}>
                        <Context.Provider value={{
                            findInputIndex: this.findInputIndex,
                            registerInput: this.registerInput,
                            removeInput: this.removeInput,
                            onForwardCursor: this.onForwardCursor,
                            onBackwardCursor: this.onBackwardCursor,
                            onFocus: this.onFoucs,
                            onBlur: this.onBlur,
                            findInputRange: this.findInputRange
                        }}>
                            {<FormerScopeValue onRemoveValue={() => { }} onChangeValue={(val) => {
                                this.doChangeValue(val)
                            }} value={value} />}
                        </Context.Provider>
                    </div>
                </div>
            </Popover>
        )
    }
}