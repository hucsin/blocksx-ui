import React from 'react';
import { Drawer, Spin } from 'antd';
import { utils } from '@blocksx/core';
import ReactMarkdown from 'react-markdown';

import { BoxBehavior } from '../interface';

interface BehaviorWrapperProps {
    router?: any;
    children?: React.ReactNode;
    title?: string;
    content:  React.ReactNode | BoxBehavior;

    events?: {
        [event: string] : () => void;
    }
}

interface BehaviorWrapperState {
    open: boolean;
    content: string;
    loading: boolean;
}

export default class BehaviorWrapper extends React.Component<BehaviorWrapperProps, BehaviorWrapperState> {

    public constructor(props: BehaviorWrapperProps) {
        super(props);

        this.state = {
            open: false,
            content: '',
            loading: false
        }
    }
    public render() {

        if (utils.isPlainObject(this.props.content)) {
            let contentBehavior: BoxBehavior = this.props.content as any;

            switch(contentBehavior.type) {
                case 'markdown':
                    return this.renderMarkdown();
                case 'link':
                case 'router':
                    break;
                case 'video':
                    break;
            }
        }

        return this.renderContent();
    }
    // 调用此函数必须事this.props.content为对象引入的时候
    private fetchContent() {
        let boxBehavior: BoxBehavior = this.props.content as BoxBehavior;
        

        if (utils.isFunction(boxBehavior.content)) {

            let content = boxBehavior.content as Function;;
            this.setState({loading: false});

            let promiseResult = content(boxBehavior.params);

            if (utils.isPromise(promiseResult)) {
                promiseResult.then(data => {
                    this.setState({
                        content: data,
                        loading: false
                    })
                })
            } else {
                this.setState({
                    loading: false,
                    content: promiseResult
                })
            }

        } else {
            if (utils.isString(boxBehavior.content)) {
                this.setState({
                    content: boxBehavior.content as string
                })
            }
        }

    }
    private renderMarkdown() {
        return (
            <>
                {React.cloneElement(this.renderContent(), {
                    onClick: () => {
                        this.setState({
                            open: true
                        }, () => this.fetchContent())
                    }
                })}
                <Drawer
                    title={this.props.title}
                    width={'64%'}
                    open={this.state.open}
                    onClose={() => {
                        this.setState({open: false})
                    }}
                >
                    <Spin spinning={this.state.loading}>
                        <ReactMarkdown>{this.state.content}</ReactMarkdown>
                    </Spin>
                </Drawer>
            </>
        )
    }
    private renderContent(): any {
        
        return this.props.children;
        /*
        let { children , content } = this.props;
        let blockBehavior: BlockBehavior = content as BlockBehavior;


        return !utils.isPlainObject(content) && blockBehavior.content ? content : children;*/
    }
}