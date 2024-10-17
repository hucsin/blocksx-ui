import React from 'react';
import classnames from 'classnames'
import { Input, Form, Divider, Button, Checkbox, Spin } from 'antd';
import TablerUtils from '../utils/tool';
//import { UserOutlined, LockOutlined,GoogleOutlined, GithubOutlined } from '@ant-design/icons'
import * as Icons from '../Icons'

interface InputFormProps {
    type: string;
    logo?: any;
    defaultValue?: string;
    title: any;
    subTitle?: any;
    actions?: any;
    onSubmit: Function
    oauths?: any;
    loading?: boolean;
}

interface InputFormState {
    logo?: any;
    title: any;
    subTitle?: any;
    actions?: any;
    type: string;
    loading?: boolean;
    stay: boolean;
    agree: boolean;
}

export default class InputForm extends React.Component<InputFormProps, InputFormState> {
    public constructor(props: InputFormProps) {
        super(props);

        this.state = {
            type: props.type,
            logo: props.logo,
            title: props.title,
            subTitle: props.subTitle,
            actions: props.actions,
            loading: props.loading,
            stay: true,
            agree: true
        }
    }

    public UNSAFE_componentWillReceiveProps(newProps:InputFormProps) {
        if (newProps.logo != this.state.logo) {
            this.setState({
                logo: newProps.logo
            })
        }
        if (newProps.type != this.state.type) {
            this.setState({
                type: newProps.type
            })
        }
        if (newProps.title != this.state.title) {
            this.setState({
                title: newProps.title
            })
        }
        if (newProps.subTitle != this.state.subTitle) {
            this.setState({
                subTitle: newProps.subTitle
            })
        }
        if (newProps.actions != this.state.actions) {
            this.setState({
                actions: newProps.actions
            })
        }
        if (newProps.loading != this.state.loading) {
            this.setState({
                loading: newProps.loading
            })
        }
    }
    private getButtonText() {
        switch(this.state.type) {
            case 'login':
                return 'Login';
            case 'signup':
                return 'Signup and Login';
            case 'oauth':
                return 'Binding relationship or Signup'
        }
    }
    private onSubmit = (va)=> {
        
        if (this.props.onSubmit) {
            this.setState({loading: true});
            this.props.onSubmit({
                ...va,
                stay: this.state.stay
            }).then((res) => {
                this.setState({loading: false});
            }).catch(() => {
                this.setState({loading: false});
            })
        }
    }
    private onChangeStay =(v)=> {
        this.setState({
            stay: v.target.checked
        })
    }
    private onChangeAgree =(v)=> {
        this.setState({
            agree: v.target.checked
        })
    }
    private renderForm() {
        return (
            <Form
                onFinish={this.onSubmit}
            >
                <Form.Item
                    initialValue={this.props.defaultValue}
                    name="username"
                    rules={[
                        {required: true, message: " "},
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value.match(/[^@]+\@[a-z0-9_\-]{1,}\.[a-z0-9_\-]{1,}/)) {
                                    return Promise.reject('The username is a valid email address!')
                                }
                                return Promise.resolve()
                            },
                            })
                    ]}
                >
                    <Input size='large' name="username" placeholder='Please enter your login account' prefix={<Icons.UserOutlined className={'prefixIcon'} />} />
                </Form.Item>
                <Form.Item
                        name="password"
                        rules={[
                        {required: true, message: " "},
                        
                        ]}
                >
                    <Input.Password name="password" size='large' placeholder='Please enter the password' prefix={<Icons.LockOutlined className={'prefixIcon'} />} />
                </Form.Item>
                {this.state.type == 'signup' &&<Form.Item
                        name="repassword"
                        dependencies={['password']}
                        rules={[
                        {required: true, message: " "},
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                            if (!value || getFieldValue('password') === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('The new password that you entered do not match!'));
                            },
                        }),
                        ]}
                >
                    <Input.Password size='large' name='repassword' placeholder='Please enter verification password' prefix={<Icons.LockOutlined className={'prefixIcon'} />} />
                </Form.Item>}

                {this.state.type == 'login' && <Form.Item>
                    
                    <div className='input-checkbox'>
                    <Checkbox name="stay" onChange={this.onChangeStay}>Stay logged in</Checkbox>    
                        <Button type='link' >Forget password</Button>
                    </div>
                </Form.Item>}
                <Button loading={this.state.loading} type='primary' htmlType="submit" size='large' block>{this.getButtonText()}</Button>
            </Form>
        )
    }
    public render() {
        let login: any = window.location.href.match(/__DEB_DEV__/);
        return (
            <div className='ant-pro-form-login-container '>
                <div className='ant-pro-form-login-top'>
                    <div className='ant-pro-form-login-header '>
                        
                        <span className='ant-pro-form-login-title '>
                            {this.state.title}
                        </span>
                    </div>
                    <div className='ant-pro-form-login-desc '>
                        {this.state.subTitle}
                    </div>
                </div>
                <div className='input-form'>
                    <Spin spinning={this.state.loading}>
                        <Divider >This third-party  account</Divider>
                        <div className={classnames({
                            'input-other': true,
                            'input-other-disabled': !this.state.agree
                        })}>
                            {!login ? this.props.oauths.map(it => {
                                return <a href={this.state.agree ? it.url : '#'}>{TablerUtils.renderIconComponent(it)} {it.title}</a>
                            }): this.renderForm()}
                            
                        </div>
                        <div className='input-checkbox'>
                            <Checkbox name="stay" checked={this.state.stay} onChange={this.onChangeStay}>Stay logged in</Checkbox>
                            <Checkbox name="agree" checked={this.state.agree} onChange={this.onChangeAgree}>Agree <a href="https://www.anyhubs.com/article/privacy">Privacy Policy</a></Checkbox>
                        </div>
                    </Spin> 
                </div>
            </div>
        )
    }
}