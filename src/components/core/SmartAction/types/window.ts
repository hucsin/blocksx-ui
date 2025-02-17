
import SmartRequest from '../../../utils/SmartRequest';
import { Encode, Decode} from '@blocksx/encrypt';


class SmartActionWindow {
    private getSelfCookie() {
        let match: any = document.cookie.match(/__=([^;]+)/)
       
        return match && Decode.decode(decodeURIComponent(match[1]))
    }
    private deleteSelfCookie() {
        document.cookie =  '__=; expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/; domain=.anyhubs.com;' 
    }
    private bindFocus(iSsuccess: Function, errorBack?: Function, caller?: Function) {
        let oldfocus = window.onfocus;
        window.onfocus = () => {   
            if (!iSsuccess()) {
                if (errorBack) {
                    errorBack()
                }
                oldfocus && oldfocus.call(window);
                window.onfocus = oldfocus;
                caller && caller();
            }
        }
    }
    public doAction(params: Record<string, any>, callback: Function, errorBack?: Function) {
        
        let screenWidth = window.screen.width;
        let screenHeight = window.screen.height;
        let windowWidth = Math.min(520, screenWidth -  300);
        let windowHeight = Math.min(600, screenHeight - 200);
        
        window.open(SmartRequest.getRequestURI(params.url), params.id, `width=${windowWidth},height=${windowHeight},top=${(screenHeight-windowHeight)/2},left=${(screenWidth-windowWidth)/2},menubar=no,toolbar=no,resizable=no,focus=1`)

        let timer = setInterval((message) => {
            iSsuccess(message);
        }, 200)

        const iSsuccess =  (message: any) => {
            if (message = this.getSelfCookie()) {
                clearInterval(timer);
                this.deleteSelfCookie()
                callback(message);
                return true;
            }
        }

        this.bindFocus(iSsuccess, errorBack, ()=> {
            clearInterval(timer)
        });
    }
}

const instance = new SmartActionWindow();

export default (params: any ,callback: Function, errorBack?: Function)=> {
    instance.doAction(params, callback, errorBack)
}