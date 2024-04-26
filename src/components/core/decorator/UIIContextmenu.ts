import UIIManger from '../manager/MangerUII';
/**
 * 指定邮件菜单
 */
export interface UIIContextmenuProps {
    icon?: string;
    label: string;
    parent?: string;
}

export const UIIContextmenu = (props: UIIContextmenuProps, control?: Function) => {

    return (target : any, name: string, descriptor?: any) => {
        let manger: UIIManger = UIIManger.findManger(target.constructor);

        manger.registerContextMenu(name, {
            key: [target.constructor.name, name].join('.'),
            ...props,
            control: control
        })
    }
}