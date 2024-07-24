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
}
interface FormerScopeState {
    value: ScopeType[],
    focusIndex: number;
    open: boolean;
}
const defaultValue: any = [
    {
        type: 'value',
        value: 'ddd'
    },
    {
        type: 'function',
        name: "Math.abs",
        parameters: [
            {
                type: 'value',
                value: [
                    {
                        type: 'function',
                        name: 'Math.abs',
                        parameters: []
                    }
                ]
            }

        ]
    },
    {
        type: 'function',
        name: "Math.abs",
        parameters: [
            {
                type: 'value',
                value: [
                    {
                        type: 'function',
                        name: 'Math.abs',
                        parameters: []
                    }
                ]
            }

        ]
    }
];

export default class FormerScope extends React.Component<FormerScopeProps, FormerScopeState> {
    private inputList: any;
    private inputScopeMap: any;
    private focusInput: any;
    private lastFocus: any;
    public constructor(props: FormerScopeProps) {
        super(props);
        this.inputList = [];
        this.inputScopeMap = {}
        this.state = {
            focusIndex: -1,
            value: props.value || defaultValue,
            open: false
        }
    }
    public  UNSAFE_componentWillReceiveProps(nextProps: Readonly<FormerScopeProps>, nextContext: any): void {
        if (nextProps.value !== this.state.value) {
            this.setState({
                value: nextProps.value || defaultValue
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

    private registerInput = (inputRef: any, scope:any)=> {
        let inputUniq: any = inputRef.dataset.index;
        this.inputList.push(inputRef);

        this.inputScopeMap[inputUniq] = scope;
    }
    private findInputIndex =(inputRef: any) => {
        let sortCursor: any = this.getSortCursorList();
        
        return sortCursor.findIndex(it => inputRef == it);
    }
    private removeInput =(inputRef: any) => {
        let inputUniq: any = inputRef.dataset.index;
        this.inputList = this.inputList.filter(it=> it!= inputRef);

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
                let serial: number = Math.max(0, parseInt(currentInput.dataset.serial,10));
                
                scope.addValueIntoScope(cursorPosition, value, serial, scopeValue, this.findInputIndex(currentInput))
            }
        }

    }
    private findInputRange = () => {
        
        if (this.lastFocus) {
            return ScopeUtils.getSursorRange(this.lastFocus);
        }
    }
    private onFoucs = (current?: any, isAct?: any)=> {

        if (isAct === true) {
            
            return this.lastFocus = this.focusInput = current;
        }

        if (!utils.isUndefined(current)) {
            if (typeof current === 'number') {
                let currentIndex: any = current;
                let sortCursor: any = this.getSortCursorList();
                
                current = sortCursor[currentIndex] || sortCursor[currentIndex - 1];

                if (!current) {
                    current = sortCursor[sortCursor.length -1];
                }
            }
            
        } else {
            
            current = this.inputList[this.inputList.length -1];
        }

         
        if (current) {
            current.focus();
            if (current.innerText.length) {
                
                let position: number = utils.isUndefined(isAct) || isAct == -1 ? current.innerText.length: isAct;
                
                ScopeUtils.setCursorPosition(current, position)
            }
            
            this.focusInput = current;
            this.lastFocus = current;
            this.setState({
                open: true
            })
        }
    }
    private onBlur = (current)=> {
        //this.focusInput = null;
        
        if (current == this.focusInput) {
            this.focusInput = null;
            this.setState({
                open:false
            })
        }
    }
    private getSortCursorList() {
        return this.inputList.sort((a,b) => {
            return parseInt(a.dataset.index, 10) > parseInt(b.dataset.index, 10) ? 1 : -1
        })
    }
    private getAfterBeforeInput(current:any, dir: string = 'before') {
        let currentIndex: number = current.dataset.index;
        let sortCursor: any = this.getSortCursorList();
        let findIndex: number = sortCursor.findIndex((it) => {
            return it.dataset.index == currentIndex;
        })

        if (dir == 'before') {
            if (findIndex >0) {
                return sortCursor[findIndex - 1]
            }
        } else {
            if (findIndex < sortCursor.length) {
                return sortCursor[findIndex + 1] 
            }
        }
    }

    private onForwardCursor = (current: any)=> {
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
        // 第一个节点
        return (
            <Popover 
                overlayClassName="ui-scope-panel"
                title="" content={<ScopePanel scope={this}/>} open={this.state.open} placement={'left'}
            
            >
                <div 
                    className={classnames('ui-input ui-scope', {
                        'ui-scope-focus': this.state.open
                    })}
                    onMouseUp={()=>{
                        //if (!this.focusInput) {
                            this.onFoucs();
                        //}
                    }}
                >
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
                        {<FormerScopeValue onRemoveValue={()=> {}}  onChangeValue={(val)=> {
                            this.doChangeValue(val)
                        }} value={value} />}
                    </Context.Provider>
                </div>
            </Popover>
        )
    }
}