/*
import React from 'react';


import { Sidebar } from '../components';

import { SidebarMenuItem } from '../components/Sidebar/typing';

let menu: SidebarMenuItem[] = [
    {
      
      key: 'seach',
      name: '搜索',
      type: 'Shortcut',
      icon: 'SearchOutlined'
    },
    {
      key: 'product',
      type: 'Action',
      name: '项目',
      icon: 'Folder'
    },
    {
      key: 'scheduled',
      name: '计划任务',
      icon: 'Scheduled'
    },
    {
      key: 'inbox',
      name: '收信箱',
      icon: 'Inbox'
    },
  
    {
      key: 'accessToken',
      name: '访问令牌',
      icon: 'AccessToken'
    },
    {
      key: 'setting',
      name: '设置',
      icon: 'Setting',
      children: [
        {
          key: 'user',
          name: '用户设置',
          group: '用户设置',
          icon: 'UserOutlined'
        },
        {
          key: 'datasource',
          name: '数据源',
          group: '开发设置',
          icon: 'Datasource'
        },
        {
          key: 'variable',
          name: '运行常量',
          group: '开发设置',
          icon: 'Variable'
        },
        {
          key: 'monitor',
          name: '环境',
          group: '开发设置',
          icon: 'Monitor'
        }
        
      ] as any
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
  let currentKey: any = 'setting.variable'


  export default class DemoSidebar extends React.Component {
    public render() {
        return (
            
            <Sidebar menu={menu} currentKey={currentKey} roadmap={roadmap} onChange={(key, type)=> {
                console.log('[console.log]', key,type)
              }} />
        )
    }
  }*/