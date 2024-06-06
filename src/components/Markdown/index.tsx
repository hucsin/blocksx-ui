import React from 'react';
import ReactMarkdown from 'react-markdown';


export default class Markdown extends React.Component<{children}> {
    public render() {
        return (
            <ReactMarkdown>{this.props.children}</ReactMarkdown>
        )
    }
}