import { Decode } from '@blocksx/encrypt';
import { utils } from '@blocksx/core'


class Session {
    private sessionKey: string = '_info';
    private cache: any;
    private sessionValue: any;
    private session: any;
    public constructor() {

        this.cache = {};
        this.resetSession();
    }
    public isDebugMode(p: string = 'AI') {
       
        return location.href.includes("__" + p + "BUG__")
    }
    public resetSession() {

        let match: any = document.cookie.match(/__token=([^;]+)/);
        if (match && match[1]) {

            try {
                let sekey: any = localStorage.getItem(this.sessionKey);
                let info: any = sekey ? JSON.parse(sekey) : {};

                let tokenstring: any = Decode.decode(decodeURIComponent(match[1]));
                let tokenvalue: any = utils.quickUnZIP(tokenstring.split('#')[0])

                this.session = {
                    user: utils.maskEmail(tokenvalue.u),
                    zone: tokenvalue.z,
                    plan: tokenvalue.p || 'free',
                    avatar: localStorage.getItem('setting.avatar') || 'UserOutlined',
                    agent: localStorage.getItem('setting.agent') || 'merlin',
                    agentname: localStorage.getItem('setting.agentname') || 'Bob',

                    ...info
                };

            } catch(e) {
                
                this.session = null;
            }
        } else {
            this.session = null;
        }
    }

    public resetSessionValue(value: any) {
        this.sessionValue = Object.assign(this.session || {}, value)
    }
    public hasLogin() {
        
        this.resetSession();
        let sessionValue: any = this.sessionValue || this.session;
        
        if (sessionValue && sessionValue.user && sessionValue.zone) {
            return true;
        }
    }
    public getUserPlan() {
        this.resetSession();
        if (this.session) {
            return this.session.plan;
        }
        return 'free'
    }
    public getUserSession() {
        this.resetSession();
        return this.getUserInfo();
    }
    public getUserInfo() {
        return this.sessionValue || this.session;
    }
    public doLogin(info) {
        localStorage.setItem(this.sessionKey, JSON.stringify(info))
    }

    public pushCache(key: string, cache: any) {
        if (!this.cache[key]) {
            this.cache[key] = [];
        }

        this.cache[key].push(cache)
    }

    public isConsoleLayout() {
        return location.origin.match(/console/)
    }

    public getCache(key: string) {
        return this.cache[key]
    }
}
// @ts-ignore
export default window.SessionHelper = new Session();