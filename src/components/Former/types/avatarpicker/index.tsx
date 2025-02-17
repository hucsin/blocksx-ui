/**
 * 头像选择组件
 */
import  React  from 'react';
import classnames from 'classnames';
import { Popover } from 'antd';
import * as Icons  from '../../../Icons';
import TablerUtils from '../../../utils/tool';

import './style.scss';

interface AvatarPickerProps {
    value: string;
    props: any;
    avatar?: string;
    viewer?: boolean;
    avatars: string[];
    defaultAvatar?: string;
    onChangeValue: (value: string) => void;
}

interface AvatarPickerState {
    value: string;
}

export default class AvatarPicker extends React.Component<AvatarPickerProps, AvatarPickerState> {
    public static Viewer = AvatarPicker;
    public static defaultProps = {
        
        avatars: Array.from({length: 24}, (_, index) => 'Avator'+ new String(index + 1).padStart(2,'0')+'AvatorFilled'),
    }
    constructor(props: AvatarPickerProps) {
        super(props);
        this.state = {
            value: props.value,
        }
    }
    public onChangeValue =(value:string)=> {
        this.setState({value});
        this.props.onChangeValue && this.props.onChangeValue(value);
    }
    public UNSAFE_componentWillReceiveProps(nextProps: Readonly<AvatarPickerProps>, nextContext: any): void {
        
        if (nextProps.value != this.state.value ) {
            this.setState({
                value: nextProps.value
            })
        }
    }
    public clearIcon(icon: string = '') {
        return icon.replace(/\#[a-z0-9]+/ig, '')
    }
    public renderIcon() {
        let defaultAvatar: string = this.props.defaultAvatar || this.props?.props?.defaultAvatar || 'UserOutlined';
        let avatarType: string = this.props?.props?.type ;
        return (
            <div className={classnames({
                "avatar-picker": true,
                [`avatar-picker-type-${avatarType}`]: avatarType
            })}>
            { this.state.value 
                ? TablerUtils.renderIconComponent({icon:this.state.value}) 
                : <span className="avatar-empty">
                    {TablerUtils.renderIconComponent({icon:defaultAvatar})}
                    <div className="avatar-preview">
                        <Icons.EditOutlined />
                    </div>
                </span>
            }
            
        </div>
        )
    }
    public render() {
        let avatarTitle: string = this.props?.props?.title || 'System Avatar' ;
        let avatarType: string = this.props?.props?.type ;
        let avatars: any = this.props?.props?.avatars || this.props.avatars;
        return (
                this.props.viewer 
                ? this.renderIcon() 
                : ( <Popover title={avatarTitle} content={
                        <div className={classnames({
                            "avatar-list": true,
                            [`avatar-picker-type-${avatarType}`]: avatarType
                        })}>
                            {avatars.map((avatar) => {
                                return (
                                    <div key={avatar} className={classnames("avatar-item", {'selected': this.clearIcon(this.state.value) === avatar})} onClick={() => this.onChangeValue(avatar)}>
                                        {TablerUtils.renderIconComponent({icon:avatar})}
                                    </div>
                                )
                            })}
                        </div>
                    }>
                        {this.renderIcon()}
                    </Popover>)
            
        )
    }
}