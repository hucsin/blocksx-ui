import React from 'react';

import LoginForm from '../components/LoginForm';
import SmartRequest from '../components/utils/SmartRequest';

export default class Login extends React.Component {

    public render() {
        return (
            <LoginForm
                image="/img/bg.png"
                icon="Bytehubs"
                title="Bytehubs"
                subTitle={{
                    login: "Login to start connecting to the app",
                    oauth: "Establish a relationship between the {oauth} account and the website account",
                    signup: "Register an account to start the app connection journey"
                }}
                oauths={[
                    {
                        icon: 'GithubOutlined',
                        name: 'github',
                        title: 'Github',
                        url: 'https://github.com/login/oauth/authorize?client_id=19cac121b19a95697e68'
                    }
                ]}
                onSingup={SmartRequest.makePostRequest('/eos/user/signup')}
                onLogin={SmartRequest.makePostRequest('/eos/user/login')}
                onBinding={SmartRequest.makePostRequest('/eos/oauth/binding')}
            ></LoginForm>
        )
    }
}