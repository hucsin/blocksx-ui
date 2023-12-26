
import React from 'react';

export interface SidebarMenuItem {
    
    type?: "Shortcut" | "Action" | "Hot" | "Link"; // 类型: 快捷键 | 动作 | 热度 |  外链
    shortcut?: String;

    key: string;
    name: String;

    autoFold?: boolean;

    icon: String;
    group?: String;

    onSelect?: Function;
    onAction?: Function;

    children?: SidebarMenuItem[] 
}

export interface MenuGroupCache {
    group?: string;
    index: number;
    menu: SidebarMenuItem[];
}
