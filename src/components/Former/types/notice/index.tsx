import React from 'react';
import Markdown from '../../../Markdown';
import Avatar from '../avator';

import './style.scss';

export default class FormerNotice extends React.Component<{value: any, icon?: any, props?: any}, {icon:any,value: any}> {

    public static defaultProps ={
        icon: 'NotificationOutlined#ccc'
    }
    public constructor(props:any){
        super(props);

        this.state = {
            icon: this.getDefaultIcon(props),
            value: props.value
        }
    }
    private getDefaultIcon(propsc: any) {
        let { props = { }, icon } = propsc;
        return icon || props.icon ;
    }
    public  UNSAFE_componentWillReceiveProps(nextProps: any): void {
        if (nextProps.value != this.state.value) {
            this.setState({
                value: nextProps.value,
                icon: this.getDefaultIcon(nextProps)
            })
        }
    }
    public render() {
        
        return (
            <div className='ui-former-notice'>
                {this.state.icon && <Avatar size={24} icon={this.state.icon}/>}
                <Markdown>{this.state.value}</Markdown>
            </div>
        )
    }
}