/**
 * 登录表单
 */
import React from 'react';
import { Space, Divider } from 'antd';
import { utils } from '@blocksx/core';

import {
    LoginForm,
    ProConfigProvider,
    ProFormCaptcha,
    ProFormCheckbox,
    ProFormText,
    setAlpha,
} from '@ant-design/pro-components';
import './style.scss'

import MircoAvatar from '../MircoAvatar';
import UtilsTool from '../utils/tool';
import {
    LockOutlined,
    UserOutlined,
    
} from '@ant-design/icons';

export interface LoginPageThreeParty {

    name: string;
    title: string;
    icon: string;
    url: string;
}

export interface LoginPageFormProps {
    image: string;
    icon: string;
    title: string;
    subTitle: string;

    // 第三方登录
    oauths: LoginPageThreeParty[]
}



export default class LoginPageForm extends React.Component<LoginPageFormProps> {
    private goTo =(e:any)=> {
        let url: string = utils.template(e.url || '', e)
        
        if (url) {
            window.location.href = url;
        }
    }
    private renderActions() {
        return (
            <React.Fragment>
                <Divider/>
                <Space>
                    Login With:
                    {this.props.oauths.map(it => {
                        return (<MircoAvatar 
                            key={it.icon} 
                            size='24' 
                            icon={it.icon} 
                            color='#ccc' 
                            onClick={()=>this.goTo(it)}
                        />);
                    })}
                </Space>
            </React.Fragment>
        )
    }
    public render() {
        return (
            <div className='login-form-wrapper'>
                <div className="login-logo">
                    <Space>
                    {UtilsTool.renderIconComponent(this.props)}
                    {this.props.title}
                    </Space>
                </div>
                <div className='login-form-bg'>
                    <img src={this.props.image} alt="login background img" />
                </div>
                <div className='login-form-input'>
                    <LoginForm
                        logo={UtilsTool.renderIconComponent(this.props)}
                        title={this.props.title}
                        subTitle={this.props.subTitle}
                        actions={this.renderActions()}
                    >
                        <div>
                        <Divider >This website account</Divider>
                        <ProFormText
                            name="username"
                            fieldProps={{
                                size: 'large',
                                prefix: <UserOutlined className={'prefixIcon'} />,
                            }}
                            placeholder={'please enter user name'}
                            rules={[
                                {
                                    required: true,
                                    message: ' ',
                                },
                            ]}
                        />
                        <ProFormText.Password
                            name="password"
                            fieldProps={{
                                size: 'large',
                                prefix: <LockOutlined className={'prefixIcon'} />,
                                /*strengthText:
                                    'Password should contain numbers, letters and special characters, at least 8 characters long.',
                                statusRender: (value) => {
                                    const getStatus = () => {
                                        if (value && value.length > 12) {
                                            return 'ok';
                                        }
                                        if (value && value.length > 6) {
                                            return 'pass';
                                        }
                                        return 'poor';
                                    };
                                    const status = getStatus();
                                    if (status === 'pass') {
                                        return (
                                            <div style={{ color: 'yellow' }}>
                                                Strength: medium
                                            </div>
                                        );
                                    }
                                    if (status === 'ok') {
                                        return (
                                            <div style={{ color: 'blue' }}>
                                                Strength: strong
                                            </div>
                                        );
                                    }
                                    return (
                                        <div style={{ color: 'red' }}>Strength: weak</div>
                                    );
                                },*/
                            }}
                            placeholder={'please enter user password'}
                            rules={[
                                {
                                    required: true,
                                    message: ' ',
                                },
                            ]}
                        />
                        </div>
                        <div
                            style={{
                            marginBlockEnd: 24,
                            }}
                        >
                            <ProFormCheckbox noStyle name="autoLogin">
                                Stay logged in
                            </ProFormCheckbox>
                            <a
                                style={{
                                    float: 'right',
                                }}
                            >
                                Forget password
                            </a>
                        </div>
                    </LoginForm>
                </div>
            </div>

        )
    }
}