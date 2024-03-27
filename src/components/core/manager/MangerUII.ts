/**
 * 管理用户交互行为数据
 */
import { utils } from '@blocksx/core'

export default class UIIManger {

    public static findManger(context: any): UIIManger {
        let constructor: any = utils.isFunction(context) ? context : context.constructor;
        return constructor.$$UII || (constructor.$$UII =  new UIIManger())
    }
    public static findContextMenu(context: any) {
        return UIIManger.findManger(context).findContextMenu()
    }

    public static findShortcut(context: any) {
        return UIIManger.findManger(context).findShortcut()
    }

    private contextMenuMap: any;
    private shortcutMap: any;
    private shortcutCache: any;

    public constructor() {
        this.contextMenuMap = [];
        this.shortcutMap = [];
        this.shortcutCache = {};
    }

    public registerContextMenu(key: string, contextmenu: any) {
        this.contextMenuMap.push({
            key,
            contextmenu
        })
    }
    public findContextMenu() {
        return this.contextMenuMap.map(menu => {

            if (this.shortcutCache[menu.key]) {
                menu.contextmenu.shortcut = this.shortcutCache[menu.key]
            }
            return menu;
        });
    }
    public findShortcut() {
        return this.shortcutMap;
    }
    public registerShortcut(key: string, shortcut: any) {
        this.shortcutCache[key] = shortcut;
        this.shortcutMap.push({
            key: key, 
            shortcut
        });
    }
}