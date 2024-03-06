/*
 * @Descripttion: 
 * @Version: 1.0.0
 * @Author: uoeye
 * @Date: 2020-10-09 21:13:21
 */
export const addEvent = (dom: any, event: string, listener: Function, iscap?:boolean) => {
    if ( dom && listener ) {
        dom.addEventListener(event, listener, iscap ? true : false);
    }
}
export const removeEvent = ( dom: any, event: string, listener: Function ) => {
    if ( dom && listener) {
        dom.removeEventListener(event,listener);
    }
}
export const consume = function(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
        e.preventDefault();
    }
    else {
        e.returnValue = false;
    }
}

let _downAt: any = {pageX: 0, pageY: 0};


addEvent(document, 'mousedown', (event)=> {
    _downAt.pageX = event.pageX || event.clientX;
    _downAt.pageY = event.pageY || event.clientY;
}, true)


export const downAt = () => {
    return _downAt;
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


export const addClass = (dom: any , className: string) => {
    if (dom) {
        if (dom.className.indexOf(className) == -1) {
            dom.className = [dom.className, className].join(' ')
        }
    }
}

export const removeClass = (dom: any, className: string) => {
    if (dom) {
        dom.className = dom.className.replace(className, '')
    }
}


export const createEmptyElement = (className: any, nodeName = 'div')  => {
    let ele: any = document.createElement(nodeName);

    ele.className = className;
    return ele;
}


export const getBoundingClientWidth = () => {
    let rect: any = document.body.getBoundingClientRect() || {};

    return rect.width;
}