import React from 'react';
import classnames from 'classnames';
import './style.scss';
import * as Icons from '../../../../../Icons';

import Markdown from '../../../../../Markdown';

interface DialogueFeedbackProps {
    status: 'success' | 'error';
    message: any;
}
interface DialogueFeedbackState {
    message: any;
}

export default class DialogueFeedback extends React.Component<DialogueFeedbackProps, DialogueFeedbackState> {
    render() {
        return (
            <div className={classnames('dialogue-feedback', {
                [`dialogue-feedback-${this.props.status}`]: true
            })}>
                <div className="dialogue-feedback-avatar">
                    {this.props.status === 'success' ? <Icons.CheckCircleFilled /> : <Icons.CloseCircleFilled />}
                </div>
                <div className="dialogue-feedback-content">
                    <Markdown>{this.props.message}</Markdown>   
                </div>
            </div>
        )
    }
}