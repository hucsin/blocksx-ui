
import React from 'react';
import classnames from 'classnames';
import { i18n } from '../utils';

import { SideHeader, SideFooter } from './fragment';
import SideMenu from './menu';
import { SidebarMenuItem, MenuGroupCache } from './typing';



export interface sidebarState {
    menu: MenuGroupCache[];
    favorites?: SidebarMenuItem[];
    children?: MenuGroupCache[];
}
export interface SidebarProps {

    menu: SidebarMenuItem[]; // 菜单
    favorites?: SidebarMenuItem[]; // 收藏夹
    roadmap?: SidebarMenuItem[]; // 功能路线图

    mode?: "Platform" | "Application"; // 平台模式 应用模式

    logo?: React.ReactElement; 

    current?: String;

    onChange?: Function; 
}

export default class Sidebar extends React.Component<SidebarProps, sidebarState> {


    public constructor(props:SidebarProps) {
        super(props);

        this.state = {
            menu: this.recombineGroupMenu(props.menu),
            favorites: props.favorites
        }
        
    }
    private recombineGroupMenu (menu: SidebarMenuItem[]) {
        let cacheMenu: MenuGroupCache[] =[];
        let cacheIndex: number = 0;
        let cache: any = {
            "": {
                group: "",
                index: -1,
                menu: []
            }
        };
        
        menu.forEach((item:any) => {
            let group: string = item.group || "";

            if (!cache[group]) {
                cache[group] = {
                    group: group,
                    index: group ? cacheIndex++ : -1,
                    menu: []
                }

                cacheMenu.push(cache[group])
            }

            if (item.children) {
                item.children = this.recombineGroupMenu(item.children);
            }
            console.log(cache[group], item, group)
            cache[group].menu.push(item)
        })

        cacheMenu.push(cache['']);

        return cacheMenu.sort((a:any, b:any) => {
            return a.index > b.index ? 1 : -1;
        });
    }
    public render () {

        let { favorites } = this.state;

        return (
            <div 
                className={classnames({
                    'hoofs-sidebar': true,
                    [`hoofs-sidebar-mode-${this.props.mode}`]: this.props.mode
                })}
            >
                <SideHeader />

                <div className='hoofs-sidebar-inner'>
                    <div className='hoofs-sidebar-menu'>
                        {
                            this.state.menu.map((it, i) => {
                                return <SideMenu key={i} name={it.group} menu={it.menu} ></SideMenu>;
                            })
                        }
                    </div>

                    {
                        this.state.children && favorites && favorites.length > 0 &&
                        <div className='hoofs-sidebar-favorites'>
                            <SideMenu name={i18n.translate('收藏')} menu={favorites}></SideMenu>
                        </div>
                    }
                </div>

                { 
                    this.props.roadmap && 
                    <div className='hoofs-sidebar-roadmap'>
                        <SideMenu menu={this.props.roadmap} />
                    </div>
                }

                { this.props.mode == 'Platform' && <SideFooter/>}
            </div>
        )
    }
}

