import React from 'react';

import { Alert } from 'antd';

interface ErrorMessageProps {
    errorMessage: any;
}

export default class ErrorMessage extends React.Component<ErrorMessageProps> {
    public constructor(props: ErrorMessageProps) {
        super(props)
    }
    public renderDescription() {
        if (Array.isArray(this.props.errorMessage)) {
            return  this.props.errorMessage.map((it, index) => {
                return <p key ={index}>{it}</p>
            })
        }
        return this.props.errorMessage
    }
    public render() {
        
        return (
            <Alert 
                message="Error"  
                type="error" 
                showIcon  
                description= {this.renderDescription()}
            />
        )
    }
}