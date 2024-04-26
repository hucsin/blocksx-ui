/*
 * @Descripttion: 
 * @Version: 1.0.0
 * @Author: uoeye
 * @Date: 2020-10-09 21:13:21
 */
export const addEvent = (dom: any, event: string, listener: Function) => {
    if ( dom ) {
        dom.addEventListener(event, listener, false);
    }
}
export const removeEvent = ( dom: any, event: string, listener: Function ) => {
    if ( dom ) {
        dom.removeEventListener(event,listener);
    }
}
