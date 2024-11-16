/**
 * 人机对话框，支持集中模式
 */

import React from 'react';
import { utils } from '@blocksx/core';
import classnames from 'classnames';
import Markdown from '../../../Markdown';
import * as Icons from '../../../Icons';
import { Input, Popover, Space, Dropdown, Popconfirm } from 'antd'

import FormerAvatar from '../../../Former/types/avatar';
import * as DialogueTypes from './types';

import tools from '../../core/utils';
import TablerUtils from '../../../utils/tool';
import ValidMessage from './validMessage';
import MessageContext, { MessageBody } from '@blocksx/core/es/MessageContext';
import './style.scss'

interface DialogueProps {
    name: string;
    children: any;
    open: boolean;
    memoryDepth: number;
    onSubmit: (message: any, agentType: string) => Promise<any>;
    onOpenChange: (open: boolean) => void;
    //onMouseEnterx: () => void;
    efficiency?: any;
}

interface DialogueState {
    holder: boolean;
    messages: any;
    message: any;
    loading: boolean;
    canSend: boolean;
    errorMessage: string;
    open: boolean;
    efficiency: any[]
}

export default class Dialogure extends React.Component<DialogueProps, DialogueState> {
    public static defaultProps = {
        memoryDepth: 5 // 最大记忆深度
    }
    private scrollRef: any;
    private inputRef: any;
    private messageContext: MessageContext;

    public constructor(props: any) {
        super(props)

        this.state = {
            holder: false,
            messages: [],
            message: '',
            loading: false,
            canSend: false,
            errorMessage: '',
            efficiency: props.efficiency || [],
            open: props.open || false,
        }
        this.scrollRef = React.createRef();
        this.inputRef = React.createRef();

        this.messageContext = new MessageContext((tools.getStorage(`agent-messages`) || []).slice(-50));
        console.log(this.messageContext.getMessageList(), 3333, 'messageContext')

    }

    public UNSAFE_componentWillReceiveProps(nextProps: any) {
        if (nextProps.efficiency !== this.state.efficiency) {
            this.setState({ efficiency: nextProps.efficiency });
        }
        if (nextProps.open !== this.state.open) {
            this.setState({ open: nextProps.open });
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
                setTimeout(() => {
                    this.inputRef.current.focus();
                }, 0)
            }
        }
    }
    private relyScrollToBottom() {
        setTimeout(() => {
            this.scrollToBottom()
        }, 0)
    }
    private renderAvatar(type: string) {
        return (
            <FormerAvatar color={type === 'assistant' ? '#4d53e8' : ''} icon={type === 'assistant' ? 'AnyhubsBrandFilled' : 'UserOutlined'} />
        )
    }
    private renderMessageList() {
        let messages: MessageBody[] = this.messageContext.getMessageList();
        // 添加初始消息
        messages = [
            {
                role: 'assistant',
                content: `Hello, I am your assistant ${this.props.name}. How can I help you?`,
                pointless: true,
                display: {
                    type: 'efficiency',
                    dataSource: this.state.efficiency
                }
            },
            ...messages
        ];

        if (this.state.loading) {
            messages.push({
                role: 'assistant',
                pointless: true,
                display: {
                    type: 'thinking'
                }
            })
        }

        return (
            <div className='dialogue-message-list' ref={this.scrollRef}>
                {messages.map((it, index) => {
                    if (it.role === 'system') {
                        return (
                            <div className='dialogue-message-item'>
                                <div className='dialogue-message-system'>{it.content}</div>
                            </div>
                        )
                    }
                    return (
                        <div className={classnames('dialogue-message-item', { 'reverse': it.role === 'user' })}>
                            <div className='dialogue-message-item-avator'>{this.renderAvatar(it.role)}</div>
                            <div className={classnames({
                                'dialogue-message-item-content': true,
                                'dialogue-message-item-content-nofeedback': !it.content
                            })}>
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
                    <Popconfirm
                        title='Are you sure'
                        description='Clear the chat history?'
                        okText="I'm sure"
                        onConfirm={() => this.clearMessageList()}
                    ><Space ><Icons.DestroyUtilityOutlined />Clear Chat history</Space></Popconfirm>
                </div>}
            </div>
        )
    }
    private renderMessageContent(message: MessageBody, index: number) {

        if (this.messageContext.isCallConfirmedStatus(message)) {
            return <div className='dialogue-message-item-content-text'>
                <Space>
                    <Icons.MessageOutlined />
                    <span>The information you submitted is as follows:</span>
                </Space>

            </div>
        }

        if (message.content) {
            return <div className='dialogue-message-item-content-text'>{<Markdown>{message.content}</Markdown>}</div>
        }
    }

    private onSubmit(message: any) {

        return new Promise((resolve, reject) => {
            this.messageContext.addMessage(message);

            this.refreshMessagesAndScrollToEnd(() => {
                // 提交
                this.props.onSubmit(this.messageContext.getMessageContextList(), this.getAgentType(message)).then((message) => {
                    // 消息回信息
                    this.handleReplyMessages(message);
                    resolve(message);
                }).catch((error) => {
                    reject(error);
                }).finally(() => {
                    this.setState({ loading: false });
                })
            }, { loading: true });
        });
    }
    private getAgentType(message: MessageBody) {
        return (this.messageContext.isCallConfirmStatus(message)
            || this.messageContext.isCallConfirmedStatus(message))
            ? 'Writing'
            : Math.random() > .5 ? 'Searching' : 'Thinking';
    }

    private handleReplyMessages(message: MessageBody) {

        if (message.patch) {
            this.messageContext.patchMessage(message.patch);
            delete message.patch;
        }

        this.messageContext.addMessage(message);
        this.refreshMessagesAndScrollToEnd(() => {
            tools.setStorage(`agent-messages`, this.messageContext.getMessageList());
        }, { loading: false });
    }
    private refreshMessagesAndScrollToEnd(callback?: Function, props?: any) {
        this.setState({
            messages: this.messageContext.getMessageListLength(),
            ...props
        }, () => {
            this.scrollToBottom();
            callback && callback();
        });
    }
    private renderDisplay(display: any, index: number, item: any) {
        if (!display) {
            return null;
        }

        switch (display.type) {

            case 'former':
                return <DialogueTypes.former
                    value={item.value}
                    {...display}

                    onSubmit={(value, state) => {
                        // 添加用户信息
                        console.log(item.status)
                        return this.onSubmit({
                            role: 'user',
                            status: MessageContext.STATUS.CALL_CONFIRMED,
                            call: { ...display.call, prevStatus: item.status },
                            display: {
                                type: 'value'
                            },
                            value: utils.copy(value),
                            params: display.params,
                        }).then(() => {
                            this.messageContext.updateMessageByIndex(index, { value, state });
                        })
                    }}
                />
            case 'choose':
                return <DialogueTypes.choose
                    value={item.value}
                    {...display}
                    onSubmit={(value, item) => {

                        return this.onSubmit({
                            role: 'user',
                            status: MessageContext.STATUS.CALL_CONFIRMED,
                            value,
                            call: { ...display.call, prevStatus: item.status },
                            display: {
                                type: 'choose',
                                dataSource: display.dataSource,
                                app: display.app,
                                viewer: true
                            }
                        }).then((result) => {
                            this.messageContext.updateMessageByIndex(index, { value });
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
                                role: 'user',
                                content: assistant.question
                            }, {
                                role: 'assistant',
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
                return <DialogueTypes.feedback {...display} />
            case 'thinking':
                return <DialogueTypes.thinking />
            case 'value':
                return <DialogueTypes.value value={display.value || item.value} />
        }
    }

    public sendMessage = (e) => {
        if (!this.state.loading && this.state.canSend) {

            let message: MessageBody = {
                role: 'user',
                content: this.state.message
            }
            // 如果输入不合格
            // 自动回复
            if (!ValidMessage.isValidQuestion(this.state.message)) {
                //message.content = ValidMessage.getInvalidResponse();

                this.autoReplay({
                    ...message,
                    pointless: true
                }, {
                    role: 'assistant',
                    pointless: true,
                    content: ValidMessage.getInvalidResponse()
                });

            } else {

                this.onSubmit(message)
            }

            this.setState({ message: '' })
        }

        e.preventDefault();
        e.stopPropagation();
    }
    private autoReplay(message: any, systemMessage: any) {

        this.messageContext.addMessage(message);

        this.refreshMessagesAndScrollToEnd(() => {

            setTimeout(() => {
                this.handleReplyMessages(systemMessage);
            }, 1000)
        }, { loading: true });
    }
    private isCanSend(message?: string) {
        let { message: stateMessage } = this.state;

        if (!message) {
            message = stateMessage;
        }
        let trimMessage: any = message?.trim();

        if (trimMessage.length < 2) {
            return false;
        }

        return true;
    }
    /**
     * 清空消息列表
     */
    public clearMessageList() {

        this.messageContext.clearMessageList();
        this.setState({ messages: 0 });
        tools.setStorage(`agent-messages`, []);
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
                                icon: TablerUtils.renderIconComponent({ icon: it.icon })
                            }
                        }),
                        onClick: ({ item }: any) => {
                            this.onSubmit({
                                ...item.props.assistant,
                                role: 'user'
                            });
                        }
                    }}
                >
                    <Icons.EfficiencyUtilityOutlined className='more' />
                </Dropdown>
                <Input.TextArea
                    autoSize={{ minRows: 1, maxRows: 2 }}
                    maxLength={256}
                    ref={this.inputRef}
                    placeholder={`Send a message to ${this.props.name}.`}
                    size='large'
                    disabled={this.state.loading}
                    // suffix={}
                    value={this.state.message}
                    onChange={(e) => this.setState({ message: e.target.value, canSend: this.isCanSend(e.target.value) })}
                    onPressEnter={this.sendMessage}
                />
                <Icons.PublishUtilityFilled className={classnames({ 'disabled': !this.isCanSend() })} onClick={this.state.canSend ? this.sendMessage : undefined} />
            </div>
        )
    }
    private renderContent() {
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
                <Icons.AiUtilityOutlined />
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
                trigger={['focus','hover']}
                content={this.renderContent()}
                open={this.state.open}
                mouseLeaveDelay={1.2}
                onOpenChange={(open) => {
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