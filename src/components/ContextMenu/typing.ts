
export interface ContextMenuItem {
    key: string;
    place?: string; // 菜单所在的位置, 只在一级菜单有效果
    label?: string;
    type: string | 'div';
    icon?: string;
    danger?: boolean;
    control?: Function;
    action?: Function | string;
    children?: ContextMenuItem[]
    shortcut?: number[]
}