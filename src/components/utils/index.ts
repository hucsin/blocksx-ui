import { utils } from '@blocksx/core';

class Utils {

    /**
     * 查找并自动打补丁
     * eg1:
     * object : [{a:1,b:4}, {a:2, b: 3}]
     * find : {a:1, b:4}
     * patch: {cc: 2}
     * 
     * return: [{a:1,b:4, cc: 2}, {a:2, b: 3}]
     * 
     * 
     * @param object 
     * @param find 
     * @param patch 
     */
    findArrayPatch(object: any[], find: object, patch: any) {
        if (Array.isArray(object)) {
            object.forEach(it => {
                if (this.isMatchObject(it, find)) {
                    // 
                    /**
                     * {
                     *   $patch: true,
                     *   target: string;
                     *   find: {},
                     *   patch: any
                     * }
                     */
                    if (patch && patch.$patch) {
                        // 追加模式
                        if (patch.$patch == 'append') {
                            if (Array.isArray(it[patch.target])) {
                                it[patch.target].push(patch.patch)
                            }
                            // 递归模式
                        } else {
                            this.findArrayPatch(it[patch.target], patch.find, patch.patch)
                        }
                    } else {
                        Object.assign(it, patch);
                    }
                }
            })
        }
    }
    /**
     * 查找并自动删除
     * 
     * @param object 
     * @param find 
     * @param patch 
     */
    findArrayRemove(object: any[], find: object, patch?: any) {
        if (Array.isArray(object)) {
            object.forEach((it: any, index: number) => {
                if (this.isMatchObject(it, find)) {
                    if (patch) {
                        /**
                         * {
                         *   $patch: true,
                         *   target: string;
                         *   find: {},
                         *   patch: any
                         * }
                         */
                        this.findArrayRemove(it[patch.target], patch.find, patch.patch)
                        // 删除内部元素
                    } else {
                        object.splice(index, 1)
                    }
                }
            })
        }
    }
    isMatchObject(object: any, find: object) {

        for (let p in find) {
            if (find[p] != object[p]) {
                return false;
            }
        }
        return true;
    }

    getClientWidth() {
        return document.body.clientWidth
    }
    getClientHeight() {
        return document.documentElement.clientHeight;
    }
    setStorageItem(key: string, data: any) {

        let string = JSON.stringify(data);
        localStorage.setItem(key, string)
    }
    getStorageItem(key: string) {
        var state = localStorage.getItem(key);
        if (state) {
            return JSON.parse(state)
        }
    }

    dispatchResizeEvent() {
        let evt: any = document.createEvent('UIEvents');
        evt.initUIEvent('resize')
        window.dispatchEvent(evt);
    }
    getOffsetXY(evt: any) {
        if (evt.offsetX && evt.offsetY) {
            return { x: evt.offsetX, y: evt.offsetY };
        }

        var ele = evt.target || evt.srcElement;
        var o = ele;

        var x = 0;
        var y = 0;
        while (o.offsetParent) {
            x += o.offsetLeft;
            y += o.offsetTop;
            o = o.offsetParent;
        }
        // 处理当元素处于滚动之后的情况
        var left = 0;
        var top = 0
        while (ele.parentNode) {
            left += ele.scrollLeft;
            top += ele.scrollTop;
            ele = ele.parentNode;
        }
        return { x: evt.pageX + left - x, y: evt.pageY + top - y };

    }

    withPromise(promise: any, resolve: Function, reject?: Function) {
        if (utils.isPromise(promise)) {
            promise.then(result => resolve(result)).catch(reject)
        } else {
            resolve(promise)
        }
    }
}

export default new Utils();