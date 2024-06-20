

export interface SidebarMenuItem {
    
    type?: "Shortcut" | "Action" | "Hot" | "Link"; // 类型: 快捷键 | 动作 | 热度 |  外链
    shortcut?: string;

    key: string;
    name: string;

    autoFold?: boolean;

    icon: string;
    activeIcon?: string;
    group?: string;

    onSelect?: Function;
    onAction?: Function;

    children?: SidebarMenuItem[] 
}

export interface MenuGroupCache {
    group?: string;
    index: number;
    menu: SidebarMenuItem[];
}
