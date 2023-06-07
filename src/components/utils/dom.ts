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

export const removeNode = (dom: any) => {
    if ( dom ) {
        dom.parentNode.removeChild(dom)
    }
}

export const dataset = (dom: any, key: string) => {
    if (dom) {
        let dataset = dom.dataset || {};
        return dataset[key];
    }
}

export const isDisplayBlock = (dom: any) => {
    if (dom && dom.computedStyleMap) {
        let map = dom.computedStyleMap();
        let value = map.get('display');

        return value.value == 'block'
    }
}