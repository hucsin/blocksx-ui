import React from 'react';
import Notice from '../../../Former/types/notice';
import Markdown from '../../../Markdown';
import { utils } from '@blocksx/core';

export interface ArticleContentProps {
    type: 'markdown' | 'text' | 'richtext',

    summary?: string;
    content?: string,
    template?: string,
    playload?: string
}

/**
 * 优先级，template > content
 */
export default class ArticleContent extends React.Component<ArticleContentProps> {

    public renderContent() {
        let { content = '', template , playload } = this.props;

        if (template) {
            content = utils.template(template, playload || {})
        } else {
            if (playload && content) {
                content = utils.template(content, playload)
            }
        }

        switch(this.props.type) {
            case 'markdown':
                return (
                    <Markdown>{content}</Markdown>
                )
            case 'text':
                return (
                    <pre>{content || <span className='ui-empty'>{"<null>"}</span>}</pre>
                )
            default:
                return content
        }
    }
    public render() {
        return (
            <>
                {this.props.summary && <Notice value={this.props.summary} />}
                <div className='ui-article-content'>{this.renderContent()}</div>
            </>
        )
    }
}