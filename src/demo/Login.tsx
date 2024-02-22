import React from 'react';

import LoginForm from '../components/LoginForm';

export default class Login extends React.Component {

    public render() {
        return (
            <LoginForm
                image="/img/bg.png"
                icon="Bytehubs"
                title="Bytehubs"
                subTitle="Login to start connecting to the app"
                oauths={[
                    {
                        icon: 'GithubOutlined',
                        name: 'github',
                        title: 'Github',
                        url: 'https://github.com/login/oauth/authorize?client_id=19cac121b19a95697e68'
                    }
                ]}
            ></LoginForm>
        )
    }
}