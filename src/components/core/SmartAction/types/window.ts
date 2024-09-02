import SmartRequest from "@blocksx/ui/utils/SmartRequest";

import { Encode, Decode} from '@blocksx/encrypt';


class SmartActionWindow {
    private getSelfCookie() {
        let match: any = document.cookie.match(/__=([^;]+)/)
        return match && Decode.decode(decodeURIComponent(match[1]))
    }
    private deleteSelfCookie() {
        document.cookie =  '__=; expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/; domain=.anyhubs.com;' 
    }
    public doAction(params: Record<string, any>, callback: Function) {
        
        let screenWidth = window.screen.width;
        let screenHeight = window.screen.height;
        let windowWidth = Math.min(1000, screenWidth -  300);
        let windowHeight = Math.min(700, screenHeight - 200);
        
        window.open(SmartRequest.getRequestURI(params.url), params.id, `width=${windowWidth},height=${windowHeight},top=${(screenHeight-windowHeight)/2},left=${(screenWidth-windowWidth)/2},menubar=no,toolbar=no,resizable=no,focus=1`)

        let timer = setInterval((message) => {
            if (message = this.getSelfCookie()) {
                callback(message);
                clearInterval(timer);
                
                this.deleteSelfCookie()
            }
        }, 200)
    }
}

const instance = new SmartActionWindow();

export default (params: any ,callback: Function)=> {
    instance.doAction(params, callback)
}