/**
 * 登录表单
 */
import React from 'react';
import classnames from 'classnames';
import { Space, Divider, Button, message,Tooltip, Spin } from 'antd';

import querystring from 'querystring';
import { utils } from '@blocksx/core';
import i18n from '@blocksx/i18n';
import { ConnectionsDirectivityOutlined } from '../Icons';

import InputForm from './InputForm'
import './style.scss'

import MircoAvatar from '../Former/types/avatar';
import UtilsTool from '../utils/tool';


export interface LoginPageThreeParty {

    name: string;
    title: string;
    icon: string;
    color?: string;
    type: string;
    qrcode?: Function;
    getId?: Function;
    url?: string;
}
interface TitleMap {
    [key: string]: string;
}

export interface LoginPageFormProps {
    image: string;
    icon?: string;
    logo?: any;
    subLogo?: string | Function;
    title: string;
    subTitle: TitleMap;
    light?: any;

    // 第三方登录
    oauths: LoginPageThreeParty[] | null[];

    onPollcheck: Function;
    onSingup: Function;
    onLogin: Function;
    onBinding: Function;
    onGoWelcome: Function;
}

interface LoginPageFormState {
    message: string,
    type: string;
    orignType: string;
    email: string;
    oauth: string;
    loading: boolean;
    code: string;
}

export default class LoginPageForm extends React.Component<LoginPageFormProps, LoginPageFormState> {
    public noticeMap: any = {
        oauth: 'If the account you fill in does not exist, the account will be created first and then the binding will be completed.',
        signup: 'After the account is created, the login will be completed automatically.'
    }
    public constructor(props: LoginPageFormProps) {
        super(props);
        let oauths: any = props.oauths || [];
        let params: any = querystring.parse(window.location.search.replace(/\?/,''));
        
        this.state = {
            message: params.message,
            
            oauth: params.oauth,
            code: params.code,

            type: this.getDefaultType(oauths, params),
            orignType: this.getDefaultType(oauths, params),
            //oauth: this.getOAuthType(oauths, params.type),
            email: params.email,
            loading: false
        }
    }
    public componentDidMount() {
        if (this.state.message) {
            message.error(this.state.message);
        }

        if (this.state.oauth) {
            this.setState({loading: true})
            
            this.props.onBinding && this.props.onBinding({timezone: this.getTimezone(), oauth: this.state.oauth, code: this.state.code}).finally(()=> {
                this.setState({loading: false})
            })
        }
    }
    private getTimezone() {
        try {
            return Intl.DateTimeFormat().resolvedOptions().timeZone;
        }catch(e) {
            return 'Asia/Shanghai'
        }
    }
    private getOAuthType(oauths: any, type: string){
        
        return oauths.filter(it=> it.name==type).length ? type : ''
    }
    private getDefaultType(oauths: any, params: any) {
        let type: string = params.type;
        if (type) {
            
            if (oauths.filter(it => it.name == type).length) {
                return 'oauth'
            }
        }
        return 'login'
    }
    private getCurrentOAuth() {
        let oauths: any = this.props.oauths || [];
        return oauths.find(it => it.name == this.state.oauth)
    }
    private goTo =(e:any)=> {
        let url: string = utils.template(e.url || '', e)
        
        if (url) {
            window.location.href = url;
        }
    }
    
    private renderTitle(_type?: string) {
        let type: string = _type || this.state.type;
        if (type == 'oauth') {
            let oauthInfo: any = this.getCurrentOAuth();
            
            return (
                <Space>
                    {UtilsTool.renderIconComponent(oauthInfo)}
                    {oauthInfo.title}
                    
                    <span className='login-connections'><ConnectionsDirectivityOutlined /></span>
                    
                    {UtilsTool.renderIconComponent(this.props)}
                    {this.props.title}
                </Space>
            )
        }
        return (
            <Space>
                {this.renderLoginLogo()}
            </Space>
        )
    }
    private renderActions() {
        return (
            <React.Fragment>
                <Divider/>
                <Space>
                    Login With:
                    {this.props.oauths.map(it => {
                        return (
                        <Tooltip key={it.icon}  placement='bottom' title={it.title || it.name || it.icon}><MircoAvatar 
                            size='24' 
                            icon={it.icon} 
                            color='#ccc' 
                            onClick={()=>this.goTo(it)}
                        /></Tooltip>);
                    })}
                </Space>
            </React.Fragment>
        )
    }
    private getSubtitle(type: string) {
        let subTitle: any = this.props.subTitle || {};

        return utils.template(subTitle[type] || '', this.state)
    }
    public renderOAuthActions() {
       
        if (this.state.type == 'login') {
            return this.renderActions()
        } else {
            return (

                <React.Fragment>
                    <Divider/>
                    <span style={{opacity: .5}}>{i18n.t(this.noticeMap[this.state.type])}</span>
                </React.Fragment>
            )
        }
        
    }
    private onSubmit =(v)=> {
        
        switch(this.state.type) {
            case 'login':
                return this.props.onLogin(v).then((value)=> {
                    this.props.onGoWelcome(value)
                });
            case 'oauth':
                return this.props.onBinding(v);
            case 'signup':
                return this.props.onSingup(v).then((value)=> {
                    this.props.onGoWelcome(value)
                })
        }
    }
    private renderLoginLogo() {
        if (typeof this.props.subLogo == 'function')  {
            return this.props.subLogo();
        }
        if (this.props.subLogo) {
            return (
                <img src={this.props.subLogo}/>
            )
        }
        <>
            {UtilsTool.renderIconComponent(this.props)}
            {this.props.title}
        </>
    }
    public render() {
        let isOauthType: boolean = this.state.orignType =='oauth';
        return (
            <div className={classnames({
                'login-form-wrapper': true,
                'login-form-light': this.props.light
            })}>
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
                    <div className={classnames({
                        'login-form-inner': true,
                        'login-form-showback': this.state.type =='signup'
                    })}>
                        <div className='login-form-front'>
                            <InputForm
                                oauths={this.props.oauths}
                                title={this.renderTitle(isOauthType ? 'oauth' : 'login')}
                                defaultValue={this.state.email}
                                subTitle={this.getSubtitle(isOauthType ? 'oauth' : 'login')}
                                actions={isOauthType ? this.renderOAuthActions() : this.renderActions()}
                                type={isOauthType ? 'oauth' : 'login'}
                                onSubmit={this.onSubmit}
                                loading={this.state.loading}
                                onPollcheck= {this.props.onPollcheck}
                                onBinding = {(code: string) => {
                                    this.setState({
                                        loading: true
                                    }, ()=> {
                                        this.props.onBinding && this.props.onBinding({timezone: this.getTimezone(), code}).finally(()=> {
                                            this.setState({loading: false})
                                        })
                                    })
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

        )
    }
}