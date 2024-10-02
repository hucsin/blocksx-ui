import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


export default class Markdown extends React.Component<{children}> {
    public render() {
        return (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{this.props.children}</ReactMarkdown>
        )
    }
}