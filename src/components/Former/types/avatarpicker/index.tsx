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
        
        avatars: Array.from({length: 14}, (_, index) => 'Avator'+ new String(index + 1).padStart(2,'0')+'AvatorFilled'),
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
    public renderIcon() {
        let defaultAvatar: string = this.props.defaultAvatar || this.props?.props?.defaultAvatar || 'UserOutlined';
        return (
            <div className="avatar-picker">
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
        
        return (
                this.props.viewer 
                ? this.renderIcon() 
                : ( <Popover title="System Avatar" content={
                        <div className="avatar-list">
                            {this.props.avatars.map((avatar) => (
                                <div key={avatar} className={classnames("avatar-item", {selected: this.state.value === avatar})} onClick={() => this.onChangeValue(avatar)}>
                                    {TablerUtils.renderIconComponent({icon:avatar})}
                                </div>
                            ))}
                        </div>
                    }>
                        {this.renderIcon()}
                    </Popover>)
            
        )
    }
}