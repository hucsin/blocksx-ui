
import React from 'react';

export interface SidebarMenuItem {
    
    type?: "Shortcut" | "Action" | "Hot" | "Link"; // 类型: 快捷键 | 动作 | 热度 |  外链
    shortcut?: String;

    key: React.Key;
    name: String;

    icon: String;
    group?: String;

    onSelect?: Function;
    onAction?: Function;

    children?: SidebarMenuItem[] | MenuGroupCache[]
}

export interface MenuGroupCache {
    group?: string;
    index: number;
    menu: SidebarMenuItem[];
}
