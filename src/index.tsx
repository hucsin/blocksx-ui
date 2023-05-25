import React from 'react';
import { createRoot } from "react-dom/client";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";

import { Sidebar } from './@hoofs';

import { SidebarMenuItem } from './@hoofs/sidebar/typing';

import './style.css';

const rootElement = document.getElementById("root");
const root = createRoot(rootElement!);
// /general/product
// /setting/other
let menu: SidebarMenuItem[] = [
  {
    type: 'Action',
    key: 'action',
    name: '苹果',
    icon: 'AppleOutlined'
  },
  {
    key: 'action1',
    name: '系统变量',
    icon: 'AppleOutlined'
  },
  {
    key: 'action2',
    name: '顾天',
    group: '系统设置',
    icon: 'AndroidOutlined'
  },
  {
    key: 'action3',
    name: '棉花棒',
    group: '系统设置',
    icon: 'AndroidOutlined'
  },
  {
    key: 'action4',
    name: '顾天1',
    group: '系统设置',
    icon: 'AndroidOutlined'
  },
  {
    key: 'action5',
    name: '棉花棒1',
    group: '系统设置',
    icon: 'AndroidOutlined'
  }
];
let roadmap:SidebarMenuItem[] = [
  
  {
    key: 'action6',
    name: '系统设置1',
    
    icon: 'AndroidOutlined'
  },
  {
    key: 'action7',
    name: '系统设置',
    type: 'Link',
    icon: 'AndroidOutlined'
  }
]
root.render(
  <div className="demo-wraper">
    <Sidebar menu={menu}  roadmap={roadmap} />
  </div>
);
