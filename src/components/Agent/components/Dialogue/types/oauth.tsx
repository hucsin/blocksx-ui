import React from 'react';
import { Button } from 'antd';
import SmartRequest from '../../../../utils/SmartRequest';
import SmartAction from '../../../../core/SmartAction';
import { OpenWindowUtilityOutlined } from '../../../../Icons';

interface OAuthProps {
    onOAuthStart: () => void;
    onSuccessOAuth: () => void;
    onCancelOAuth: () => void;
    title: string;
    url: string;
}

interface OAuthState {  
    keep: boolean;
}
export default class OAuth extends React.Component<OAuthProps, OAuthState> {
    constructor(props: OAuthProps) {
        super(props);
        this.state = {
            keep: false
        }
    }
    public onClick = () => {
        this.props.onOAuthStart();
        this.setState({ keep: true });
        SmartAction.doAction({
            smartaction: 'window',
            url: SmartRequest.getRequestURI(this.props.url)
        }, (error) => {
            this.props.onSuccessOAuth();
            this.setState({ keep: false });
        }, ()=>{
            this.props.onCancelOAuth();
            this.setState({ keep: false });
        })
    }
    render() {
        let props: any = this.props;
        return (
                <Button loading={this.state.keep} icon={<OpenWindowUtilityOutlined/>} type="default" size="small" block onClick={this.onClick}>{props.title}</Button>
        )
    }
}
