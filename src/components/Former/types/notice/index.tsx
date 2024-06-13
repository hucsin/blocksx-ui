import React from 'react';
import Markdown from '../../../Markdown';
import Avatar from '../avator';

import './style.scss';

export default class FormerNotice extends React.Component<{value: any, icon?: any, props?: any}, {color: any,icon:any,value: any}> {

    public static defaultProps ={
        icon: 'NotificationOutlined#ccc'
    }
    public constructor(props:any){
        super(props);

        this.state = {
            icon: this.getDefaultIcon(props),
            value: props.value,
            color: this.getDefaultColor(props)
        }
    }
    private getDefaultIcon(propsc: any) {
        let { props = { }, icon } = propsc;
        return icon || props.icon ;
    }
    private getDefaultColor(propsc: any) {
        let { props = { }, color } = propsc;
        return color || props.color ;
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
                {this.state.icon && <Avatar size={this.props.icon ? 36 :24} color={this.state.color} icon={this.state.icon}/>}
                <Markdown>{this.state.value}</Markdown>
            </div>
        )
    }
}