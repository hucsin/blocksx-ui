import { Decode } from '@blocksx/encrypt';


class Session {
    private sessionKey: string = '_info';
    private cache: any;
    private session: any;
    public constructor() {

        this.cache = {};
    }
    public resetSession() {

        let match: any = document.cookie.match(/__token=([^;]+)/);
        if (match && match[1]) {
            try {
                let sekey: any = localStorage.getItem(this.sessionKey);
                let sess: any = JSON.parse(Decode.decode(decodeURIComponent(match[1])));
                let info: any = sekey ? JSON.parse(sekey) : {};
                
                this.session = {
                    user: sess.u,
                    zone: sess.z,
                    avatar: 'UserOutlined',
                    ...info
                };
            } catch(e) {
                this.session = null;
            }
        } else {
            this.session = null;
        }
    }
    public hasLogin() {
        
        this.resetSession();
        
        if (this.session && this.session.user && this.session.zone) {
            return true;
        }
    }
    public getUserInfo() {
        return this.session;
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