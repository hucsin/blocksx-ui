import React from 'react';
import classnames from 'classnames'
import { Popover, Divider, Button, Checkbox, Spin } from 'antd';
import TablerUtils from '../utils/tool';
import { QRCodeCanvas } from 'qrcode.react';
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
    onPollcheck: Function;
    onBinding: Function;
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
    open: boolean;
    time: number;
}

export default class InputForm extends React.Component<InputFormProps, InputFormState> {
    public loptime: number;
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
            agree: true,
            open: false,
            time: 30
        }
        this.loptime = 0;
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
        return (<div></div>)
    }
    private renderQrCodeContent(item: any) {
        if (this.state.open) {
            let qrcode: string = typeof item.qrcode =='function' ? item.qrcode() : ''
            
            return (
                <div className='qrcode'>
                    <QRCodeCanvas size={200} level="M" value={qrcode} />
                    <div className='icon' style={{color: item.color}}> {TablerUtils.renderIconComponent(item)}</div>
                    <div className='button'>
                        <Button type="text" size="small" onClick={() => this.onCancelLogin()}>({this.state.time}s) Cancel login</Button> 
                        
                    </div>
                    <div className="loader"></div>
                </div>
            )
        } 
        return null;
    }
    private onCancelLogin=(back?: Function)=> {
        
        this.setState({
            open: false
        }, () => {
            back && back()
        })
    }
    private intervalPollcheck = (item, timeout: number = 6000) => {
        
        if (this.state.open) {
            this.props.onPollcheck({
                key: item.getId(),
                type: item.name
            }).then((result:any = {})=> {
                if (result.wait) {
                    setTimeout(()=> {
                        this.intervalPollcheck(item, 3500)
                    }, timeout)
                    
                } else {
                    if (result.login) {
                        this.onCancelLogin(()=> {
                            this.props.onBinding(result.login)
                        });
                    }
                }
            }).catch(e => {

            })
        }

    }
    // 设置定时器
    private intervalTimer() {
        if (this.state.open ){
            if (this.state.time) {
                setTimeout(()=> {
                    this.setState({
                        time: this.state.time - 1
                    }, ()=> {
                        this.intervalTimer();
                    })
                }, 1000)
            } else {
                this.onCancelLogin();
            }
        }
    }
    private onOpenChange = (open, item)=> {
        if (open) {
            // 开始登陆检查
            
            this.setState({
                open: true,
                time: 120
            }, () => {
                this.intervalPollcheck(item);
                this.intervalTimer();
            })
        }
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
                                
                                if (it.type =='qrcode') {
                                    return (
                                        <Popover
                                            trigger={'click'}
                                            open={!this.state.agree ? false :this.state.open}
                                            onOpenChange={(open) => this.state.agree && this.onOpenChange(open, it)}
                                            title={`Use ${it.name} to scan the QR code and send the login command`}
                                            overlayClassName='login-qrcode'
                                            content = {this.renderQrCodeContent(it)}
                                        >
                                            <span className='a'>
                                                {TablerUtils.renderIconComponent(it)} <span className='text'>{it.title}</span>
                                            </span>
                                        </Popover>
                                    )
                                }
                                return <a className='a' href={this.state.agree ? it.url : '#'}>{TablerUtils.renderIconComponent(it)} <span className='text'>{it.title}</span></a>
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