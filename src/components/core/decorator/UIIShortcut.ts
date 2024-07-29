import UIIManger from '../manager/ManagerUII';
/**
 * 指定快捷键
 */
export const UIIShortcut = (...shortcut) => {

    return (target : any, name: string, descriptor?: any) => {
        let manger: UIIManger = UIIManger.findManger(target.constructor);
        manger.registerShortcut(name, shortcut);
    }
}

