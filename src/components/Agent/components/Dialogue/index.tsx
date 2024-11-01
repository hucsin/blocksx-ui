/**
 * 人机对话框，支持集中模式
 */

import React from 'react';
import { utils } from '@blocksx/core';
import classnames from 'classnames';
import Markdown from '../../../Markdown';
import * as Icons from '../../../Icons';
import { Input, Popover, Space, Dropdown } from 'antd'

import * as FormerTypes from '../../../Former/types';
import * as DialogueTypes from './types';

import  tools from '../../core/utils';
import TablerUtils from '../../../utils/tool';
import ValidMessage from './validMessage';

import './style.scss'

interface DialogueProps {
    name: string;
    children: any;
    open: boolean;
    memoryDepth: number;
    onSubmit: (message: any, agentType: string) => Promise<any>;
    onOpenChange: (open: boolean) => void;
    //onMouseEnterx: () => void;
    efficiency?:any;
}

interface DialogueState {
    holder: boolean;
    messages: any[];
    message: any;
    loading: boolean;
    canSend: boolean;
    errorMessage: string;
    open: boolean;
    efficiency: any[]
}

export default class Dialogure extends React.Component<DialogueProps, DialogueState>  {
    public static defaultProps = {
        memoryDepth: 5 // 最大记忆深度
    }
    private scrollRef: any;
    private inputRef: any;
    
    public constructor(props:any){
        super(props)

        this.state = {
            holder: false,
            messages: (tools.getStorage(`agent-messages`) || []).slice(-50),
            message: '',
            loading: false,
            canSend: false,
            errorMessage: '',
            efficiency: props.efficiency || [],
            open: props.open || false,
        }
        this.scrollRef = React.createRef();
        this.inputRef = React.createRef();
    }
    public UNSAFE_componentWillReceiveProps(nextProps: any) {
        if (nextProps.efficiency !== this.state.efficiency) {
            this.setState({efficiency: nextProps.efficiency});
        }
        if (nextProps.open !== this.state.open) {
            this.setState({open: nextProps.open});
            if (nextProps.open) {
                this.relyScrollToBottom()
            }
        }
    }
    public componentDidMount() {
        //this.scrollToBottom();
    }
    private scrollToBottom() {
        if (this.scrollRef.current) {
            this.scrollRef.current.scrollTop = this.scrollRef.current.scrollHeight;

            if (this.inputRef.current) {
                setTimeout(()=> {
                    this.inputRef.current.focus();
                }, 0)
            }
        }
    }
    private relyScrollToBottom() {
        setTimeout(()=> {
            this.scrollToBottom()
        }, 0)
    }
    private renderAvatar(type: string) {
        return (
            <FormerTypes.avatar color={type === 'assistant' ? '#4d53e8' : ''} icon={type === 'assistant' ? 'AnyhubsBrandFilled' : 'UserOutlined'} />
        )
    }
    private renderMessageList() {
        let messages = this.state.messages;
        // 添加初始消息
        messages = [
            {
                type: 'assistant',
                nonumber: true,
                content: `Hello, I am your assistant ${this.props.name}. How can I help you?`,
                display: {
                    type: 'efficiency',
                    dataSource: this.state.efficiency
                }
            },
            ...messages
        ];

        if (this.state.loading) {
            messages.push({
                type: 'assistant',
                nonumber: true,
                display: {
                    type: 'thinking'
                }
            })
        }

        return (
            <div className='dialogue-message-list' ref={this.scrollRef}>
                {messages.map((it, index) => {
                    if (it.type === 'system') {
                        return (
                            <div className='dialogue-message-item'>
                                <div className='dialogue-message-system'>{it.content}</div>
                            </div>
                        )
                    }
                    return (
                        <div className={classnames('dialogue-message-item', {'reverse': it.type === 'user', 'nonumber': it.nonumber})}>
                            <div className='dialogue-message-item-avator'>{this.renderAvatar(it.type)}</div>
                            <div className='dialogue-message-item-content'>
                                <div>
                                    
                                    {this.renderMessageContent(it, index - 1)}
                                    {this.renderDisplay(it.display, index - 1, it)}
                                </div>
                                <span className='arrow'></span>
                            </div>
                        </div>
                    )
                })}
                {messages.length >= 2 && !this.state.loading && <div className='dialogue-message-history-clear'>
                    <Space onClick={()=> this.clearMessageList()}><Icons.DestroyUtilityOutlined />Clear Chat history</Space>
                </div>}
            </div>
        )
    }
    private renderMessageContent(message: any, index: number) {
        
        if (message.reply) {
            return <div className='dialogue-message-item-content-text'>
                <Space>
                    <Icons.MessageOutlined />
                    <span>Reply to message <span className="parentheses" onClick={(e) => this.goToMessageByNumber(message.reply, e)}>#{message.reply}</span></span>
                </Space>
                
            </div>
        }
        if (message.content) {
            return <div className='dialogue-message-item-content-text'>{<Markdown>{message.content}</Markdown>}</div>
        }
    }
    private goToMessageByNumber(number: number, e: any) {
        
        if (this.scrollRef.current) {
            let tags: any = this.scrollRef.current.getElementsByClassName('dialogue-message-item');
            
            if (tags && tags[number + 1]) {
                tags[number + 1].scrollIntoView({behavior: 'smooth', block: 'center', inline: 'nearest'});
            }
        }
        e.stopPropagation();
        e.preventDefault();
    }
    private onSubmit(message: any) {
        
        let { messages = [] } = this.state;
        let agentType: string = message.reply ? 'Writing' : Math.random() > .5 ? 'Searching' : 'Thinking';
        
        return new Promise((resolve, reject) => {
            this.setState({messages: [...messages, this.clearMessage(message)], loading: true}, () => {
                this.scrollToBottom();

                this.props.onSubmit(this.findMemoryMessages(), agentType).then((message) => {
                    this.dealRelyMessages(message);
                    resolve(message);
                }).catch((error) => {
                    reject(error);
                }).finally(() => {
                    this.setState({loading: false});
                })
            });
        });
    }
    private clearMessage(message: any) {
        message.createAt = new Date().toLocaleString();
        return message;
    }

    private dealRelyMessages(message: any) {
        let { messages = [] } = this.state;

        messages.push(this.clearMessage(message));

        if (this.findFreeMemoryDepth(messages).length > this.props.memoryDepth && !this.isNeedUserSubmit(message)) {
            messages.push({
                type: 'system',
                content: 'Auto clear memory.',
                memoryClear: true
            })
        }

        this.setState({messages, loading: false}, ()=> {

            tools.setStorage(`agent-messages`, messages);
            this.scrollToBottom();
        });
        
    }
    private findMemoryMessages() {
        return this.findFreeMemoryDepth().map(it => {
            return {
                type: it.type,
                content: it.content,
                value: it.value
            }
        }).reverse();
    }
    private findFreeMemoryDepth(messages?: any[]) {
        let memoryList: any = messages || this.state.messages || [];
        let memoryDepth: any = [];
        memoryList.slice().reverse().some(it => {
            if (!it.invalid) {

                if (it.type !=='system' || !it.memoryClear) {                    
                    memoryDepth.push(it);
                } else {
                    return true;
                }
            }
        })

        return memoryDepth;
    }
    private updateMessageDisplay(props: any, index: number) {
        let { messages = [] } = this.state;

        let currentMessage = messages[index];

        Object.assign(currentMessage.display, props);
        
        this.setState({messages});
    }
    private renderDisplay(display: any, index: number, item: any) {
        if (!display) {
            return null;
        }

        switch (display.type) {
            
            case 'former':
                return <DialogueTypes.former 
                    {...display} 
                    onSubmit={(value) => {
                        return this.onSubmit({
                            type: 'user',
                            //content: 'My addition is as follows:',
                            reply: index + 1,
                            display: {
                                type: 'value',
                                value: utils.copy(value)
                            },
                            value: utils.copy(value)
                        }).then(() => {
                            this.updateMessageDisplay({value}, index);
                        })
                    }}
                />
            case 'choose':
                return <DialogueTypes.choose 
                    {...display}
                    onSubmit={(value, item) => {
                        
                        return this.onSubmit({
                            type: 'user',
                            //content: 'My selection is as follows:',
                            reply: index + 1,
                            value,
                            display: {
                                type: 'choose',
                                value,
                                dataSource: display.dataSource,
                                app: display.app,
                                viewer: true
                            }
                        }).then((result) => {
                            this.updateMessageDisplay({value}, index);
                            return result;
                        })
                    }}
                />
            case 'efficiency':
                return <DialogueTypes.efficiency 
                    dataSource={display.dataSource} 
                    onSubmit={(assistant) => {

                        if (assistant.answer && assistant.question) {
                            let answer = assistant.answer;
                            // 先提问，1秒后回答
                            this.autoReplay({
                                type: 'user',
                                content: assistant.question
                            }, {
                                type: 'assistant',
                                content: answer.content || 'I need you to provide the following information.',
                                ...answer
                            });
                            
                        } else {

                            this.onSubmit({
                                ...assistant,
                                type: 'user',
                            });
                        }
                    }}
                />
            case 'feedback':
                return <DialogueTypes.feedback {...display}  />
            case 'thinking':
                return <DialogueTypes.thinking />
            case 'value':
                return <DialogueTypes.value value={display.value} />
        }
    }
    private isNeedUserSubmit(message: any) {
        let { type, display = {} } = message;
        return type === 'assistant' && ['former', 'choose'].includes(display.type);
    }
    public sendMessage = (e) => {
        if (!this.state.loading && this.state.canSend) {

            let message: any = {
                type: 'user',
                content: this.state.message
            }
            // 如果输入不合格
            // 自动回复
            if (!ValidMessage.isValidQuestion(this.state.message)) {
                //message.content = ValidMessage.getInvalidResponse();
                
                this.autoReplay({
                    ...message,
                    invalid: true
                }, {
                    type: 'assistant',
                    invalid: true,
                    content: ValidMessage.getInvalidResponse()
                });

            } else {

                this.onSubmit(message)
            }

            this.setState({ message: ''})
        }

        e.preventDefault();
        e.stopPropagation();
    }
    private autoReplay(message: any,systemMessage: any) {
        let { messages = [] } = this.state;
        messages.push(message);

        this.setState({messages, loading: true}, ()=> {
            this.scrollToBottom();

            setTimeout(()=> {
                this.dealRelyMessages(systemMessage);
            }, 1000)
        });
    }
    private isCanSend(message?: string) {
        let { messages = [], message: stateMessage } = this.state;

        if (!message) {
            message = stateMessage;
        }
        
        let trimMessage: any = message?.trim();
        if (trimMessage.length === 0) {
            return false;
        }

        if (!/^[a-zA-Z0-9\.\,\s]{5,}$/.test(trimMessage)) {
            return false;
        }
        return true;
    }
    /**
     * 清空消息列表
     */
    public clearMessageList() {
        this.setState({messages: []});
        tools.setStorage(`agent-messages`, []);
    }   
    private isCanSendMessage() {
        
        let { messages = [], message: stateMessage } = this.state;

        // 如果最后一个message是需要用户提交的表单类型，则需要等待用户提交
        let lastMessage = messages[messages.length - 1];
        
        if (lastMessage && this.isNeedUserSubmit(lastMessage)) {
            return false;
        }
        return true;
    }
    public renderFooter() {
        return (
            <div className='dialogue-footer'>
                <Dropdown
                    arrow
                    placement='topLeft'
                    rootClassName='dialogue-efficiency-popover'
                    overlayClassName='dialogue-efficiency-popover'
                    
                    menu={{
                        forceSubMenuRender: true,
                        items: this.state.efficiency.map(it => {
                            return {
                                ...it,
                                icon: TablerUtils.renderIconComponent({icon: it.icon})
                            }
                        }),
                        onClick: ({item}:any) => {
                            this.onSubmit({
                                ...item.props.assistant,
                                type: 'user'
                            });
                        }
                    }}
                >
                    <Icons.EfficiencyUtilityOutlined className='more'/>
                </Dropdown>
                <Input.TextArea
                    autoSize={{ minRows: 1, maxRows: 2 }}
                    maxLength={256}
                    ref={this.inputRef}
                    placeholder={`Send a message to ${this.props.name}.`} 
                    size='large'
                    disabled={this.state.loading || !this.isCanSendMessage()}
                   // suffix={}
                    value={this.state.message}
                    onChange={(e) => this.setState({message: e.target.value, canSend: this.isCanSend(e.target.value)})}
                    onPressEnter={this.sendMessage}
                />
                <Icons.PublishUtilityFilled className={classnames({'disabled': !this.isCanSend()})} onClick={this.state.canSend ? this.sendMessage : undefined} />
            </div>
        )
    }
    private renderContent () {
        return (
            <div className='dialogue-content'>
                {this.renderMessageList()}
                {this.renderFooter()}
            </div>
        )
    }
    private renderTitle() {
        return (
            <Space>
                <Icons.AiUtilityOutlined/>
                <span>{this.props.name} Assistant</span>
            </Space>
        )
    }
    public render() {
        return (
            <Popover 
                placement='left' 
                title={this.renderTitle()} 
                overlayClassName='dialogue-popover'
                trigger='hover'
                content={this.renderContent()}
                open={this.state.open}
                
                onOpenChange={(open)=> {
                    if (open) {
                        
                        this.relyScrollToBottom()
                    }
                    this.props.onOpenChange(open);
                }}
            >
                {this.props.children}
            </Popover>
        )
    }
}