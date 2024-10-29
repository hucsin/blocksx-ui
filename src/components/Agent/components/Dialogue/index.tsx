/**
 * 人机对话框，支持集中模式
 */

import React from 'react';
import classnames from 'classnames';
import Markdown from '../../../Markdown';
import * as Icons from '../../../Icons';
import { Input, Popover, Space, Button } from 'antd'
import TablerUtils from '../../../utils/tool';
import * as FormerTypes from '../../../Former/types';
import * as DialogueTypes from './types';

import './style.scss'

interface DialogueProps {
    name: string;
    children: any;
}

interface DialogueState {
    holder: boolean;
    messages: any[];
    message: any;
    loading: boolean;
    canSend: boolean;
    errorMessage: string;
}

export default class Dialogure extends React.Component<DialogueProps, DialogueState>  {
    private scrollRef: any;
    public constructor(props:any){
        super(props)

        this.state = {
            holder: false,
            messages: [
                { 
                    type: 'user',
                    content: 'Hello, I am your assistant.',
                },
                {
                    type: 'assistant',
                    content: `Hello, I am your assistant ${this.props.name}. How can I help you?`,
                    display: {
                        type: 'value',
                        value: Array.from({length: 11}).map((_, index) => ({
                            userName: `user${index}@izao.cc`,
                            Avatar: 'https://avatars.githubusercontent.com/u/1024025?v=4',
                            Email: `user${index}@izao.cc`,
                            Phone: `1380013800${index}`,
                            Company: 'Anyhubs',
                            Department: 'Development',
                            Position: 'Developer',
                        }))
                    }
                },
                {
                    type: 'system',
                    content: 'Clear the chat memory.'
                },
                { 
                    type: 'user',
                    content: 'Hello, I am your assistant.',
                },
                {
                    type: 'assistant',
                    content: `Hello, I am your assistant ${this.props.name}. How can I help you?`,
                    display: {
                        type: 'value',
                        value: {
                            userName: 'user@izao.cc',
                            Avatar: 'https://avatars.githubusercontent.com/u/1024025?v=4',
                            Email: 'user@izao.cc',
                            Phone: '13800138000',
                            Company: 'Anyhubs',
                            Department: 'Development',
                            Position: 'Developer',
                        }
                    }
                    
                },
                { 
                    type: 'user',
                    content: 'Hello, I am your assistant.',
                },
                {
                    type: 'assistant',
                    content: `Hello, I am your assistant ${this.props.name}. How can I help you?`,
                    display: {
                        type: 'choose',
                        //tips: 'Please select one {name} below.',
                        dataSource: [{
                            value: '1',
                            label: '1333',
                            description: '1dddd',
                        },{
                            value: '13',
                            label: 'fdf',
                            description: 'addfdfd',
                        }],
                        app: {
                            name: 'GoogleSheet',
                            icon: 'GoogleSheetsBrandFilled',
                        }
                    }
                    
                },
                {
                    type: 'assistant',
                    content: `Hello, I am your assistant ${this.props.name}. How can I help you?`,
                    display: {
                        type: 'former',
                        app: {
                            name: 'Anyhubs',
                            icon: '',
                        },
                        first: {
                            name: 'ddid',
                            type: 'choose',
                            dataSource: []
                        },
                        value: {},
                        properties: {

                        }
                    }
                    
                },
                { 
                    type: 'user',
                    content: 'Hello, I am your assistant.',
                }
            ],
            message: '',
            loading: false,
            canSend: false,
            errorMessage: ''

        }
        this.scrollRef = React.createRef();
    }
    public componentDidMount() {
        this.scrollToBottom();
    }
    private scrollToBottom() {
        this.scrollRef.current.scrollTop = this.scrollRef.current.scrollHeight;
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
                content: `Hello, I am your assistant ${this.props.name}. How can I help you?`,
                
            },
            ...messages
        ]

        if (this.state.loading) {
            messages.push({
                type: 'assistant',
                display: {
                    type: 'thinking'
                }
            })
        }


        return (
            <div className='dialogue-message-list' ref={this.scrollRef}>
                {messages.map(it => {
                    if (it.type === 'system') {
                        return (
                            <div className='dialogue-message-item'>
                                <div className='dialogue-message-system'>{it.content}</div>
                            </div>
                        )
                    }
                    return (
                        <div className={classnames('dialogue-message-item', {'reverse': it.type === 'user'})}>
                            <div className='dialogue-message-item-avator'>{this.renderAvatar(it.type)}</div>
                            <div className='dialogue-message-item-content'>
                                <div>
                                    {it.content && <Markdown>{it.content}</Markdown>} 
                                    {this.renderDisplay(it.display)}
                                </div>
                                <span className='arrow'></span>
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }
    private renderDisplay(display: any) {
        if (!display) {
            return null;
        }
        switch (display.type) {
            case 'choose':
                return <DialogueTypes.choose {...display} />
            case 'thinking':
                return <DialogueTypes.thinking />
            case 'value':
                return <DialogueTypes.value value={display.value} />
        }
    }
    public sendMessage = (e) => {
        if (!this.state.loading && this.state.canSend) {
            let messages = this.state.messages || [];

            messages.push({
                type: 'user',   
                content: this.state.message
            });

            this.setState({loading: true, messages: messages, message: ''}, ()=> {
                this.scrollToBottom();
            });
            
            setTimeout(() => {
                this.setState({loading: false});



            }, 10000);
        }

        e.preventDefault();
        e.stopPropagation();
    }
    private isCanSend(message: string) {
        let trimMessage = message.trim();
        if (trimMessage.length === 0) {
            return false;
        }

        if (!/^[a-zA-Z0-9\.\,]{5,}$/.test(trimMessage)) {
            return false;
        }
        return true;
    }
    public renderFooter() {
        return (
            <div className='dialogue-footer'>
                
                <Input.TextArea
                    autoSize={{ minRows: 1, maxRows: 2 }}
                    maxLength={256}
                    placeholder={`Send a message to ${this.props.name}.`} 
                    size='large'
                    disabled={this.state.loading}
                   // suffix={}
                    value={this.state.message}
                    onChange={(e) => this.setState({message: e.target.value, canSend: this.isCanSend(e.target.value)})}
                    onPressEnter={this.sendMessage}
                />
                <Icons.PublishUtilityFilled className={classnames({'disabled': !this.state.canSend})} onClick={this.state.canSend ? this.sendMessage : undefined} />
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
                placement='leftTop' 
                open 
                title={this.renderTitle()} 
                overlayClassName='dialogue-popover'
                content={this.renderContent()}
            >
                {this.props.children}
            </Popover>
        )
    }
}