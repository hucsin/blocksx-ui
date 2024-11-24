import { default as SmartActionWindow } from './types/window';
import { default as SmartActionLogout } from './types/logout';
import { default as SmartActionLink } from './types/link';

export default class SmartAction {
    private  static actionMap: any  = {};
    
    public static register (name: string, action: Function) {
        this.actionMap[name] = action;
    }
    public static find(params: any) {
        let type: string = typeof params == 'string' ? params :  params.smartaction;
        return this.actionMap[type];
    }
    public static doAction(params: any, callback?: Function, errback?: Function) {
        let action: any = this.find(params);

        if (typeof action == 'function') {
            action(params, callback, errback);
        }
    }
}

SmartAction.register('window', SmartActionWindow)
SmartAction.register('logout', SmartActionLogout)
SmartAction.register('link', SmartActionLink)