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

export const getElementById = (id: any) => {
    return document.getElementById(id);
}

export const replaceClassName = (dom: any ,sourceClass: any, targetClass?: string) => {
    
        dom.className = targetClass 
            ?  dom.className.replace(sourceClass, targetClass) 
            :  Array.isArray(sourceClass) 
                ? sourceClass.join(' ')
                : sourceClass;
    
}

export const createEmptyElement = (className: any, nodeName = 'div')  => {
    let ele: any = document.createElement(nodeName);

    ele.className = className;
    return ele;
}


