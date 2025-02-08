
import React from 'react';
import classnames from 'classnames';

import i18n from '@blocksx/i18n';

import  * as HoofsIcons  from '../Icons';

import { SideHeader, SideFooter } from './fragment';
import SideMenu from './menu';
import { SidebarMenuItem, MenuGroupCache } from './typing';

import './style.scss';

export interface sidebarState {
    menu: MenuGroupCache[];
    favorites?: SidebarMenuItem[];
    children?: MenuGroupCache[];
    folding: boolean;
    foldState?: boolean;
    firstMenu: SidebarMenuItem;

    currentKey?: string;
}
export interface SidebarProps {

    menu: SidebarMenuItem[]; // 菜单
    favorites?: SidebarMenuItem[]; // 收藏夹
    roadmap?: SidebarMenuItem[]; // 功能路线图

    currentKey?: string;

    mode?: "Platform" | "Application"; // 平台模式 应用模式


    onChange?: Function; 
}

export default class Siderbar extends React.Component<SidebarProps, sidebarState> {

    private menuMap: any;

    public constructor(props:SidebarProps) {
        super(props);

        this.menuMap = {};
        let { menu, firstMenu, currentKey, children } = this.recombineGroupMenu(props.menu, '', props.currentKey);
        
        this.state = {
            menu,
            firstMenu,
            favorites: props.favorites,
            folding: false,
            currentKey,
            children
        }
        
        
    }
    public componentDidMount() {
        this.onChange(this.state.currentKey, this.menuMap[this.state.currentKey as string]);
    }

    private getFirstMenu(menu: any) {
        let firstCache: any = menu[0];
        let firstItem: any = null;
        
        firstCache.menu.forEach((it) => {
            if (!firstItem && it.type !='Shortcut') {
                
                firstItem = it;
            }
        })

        return firstItem;
    }
    private recombineGroupMenu (menu: SidebarMenuItem[], parentKey:string, currentKey?:string) {
        let cacheMenu: MenuGroupCache[] =[];
        let cacheIndex: number = 0;
        let cache: any = {};
        let children: any = null;
        let firstMenu: any = null;
        let hash:any = (currentKey || '').split('.')
        
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
                let { menu } = this.recombineGroupMenu(item.children, item.key, currentKey);

                item.children = menu;
            }

            if (parentKey) {
                item.key = [parentKey, item.key].join('.');   
            }
            
            this.menuMap[item.key] = item;

            if (!firstMenu && item.type != 'Shortcut') {
                firstMenu = item;

                if (!currentKey) {
                    currentKey = item.key;
                }
            }
            
            if (hash && hash.length == 2 && hash[0] == item.key) {
                children = item.children;
            }

            cache[group].menu.push(item)
        });

        return { 
            menu: cacheMenu.sort((a:any, b:any) => {
                return a.index > b.index ? 1 : -1;
            }),
            currentKey,
            children,
            firstMenu
        }
    }

    public onChange(currentKey:any, current:any) {
        this.props.onChange && this.props.onChange(currentKey, current);

        if (current && current.autoFold) {
            this.setState({
                foldState: this.state.folding,
                folding: true
            })
        } else {
            if (this.state.foldState !== undefined) {
                this.setState({
                    folding: false,//this.state.foldState
                    foldState: undefined
                })
            }
        }
    }

    public goFirstMenu = ()=> {
        let { firstMenu } = this.state;
        this.setState({
            currentKey: firstMenu.key as any,
            children: undefined
        })
        this.onChange(firstMenu.key, firstMenu)
    }
    public onSelectMenu =(currentKey:string, it: any)=> {
        
        let current: any = it;

        if (['Shortcut', 'Link'].indexOf(current.type) == -1) {

            if (this.state.children) {

                this.setState({
                    currentKey: currentKey
                })
            } else {

                if (current.children) {
                    current = this.getFirstMenu(current.children);
                    currentKey = current.key;
                }

                this.setState({
                    currentKey: currentKey,
                    children: it.children
                })
            }
        }

        this.onChange(currentKey, current);
    }
    public render () {

        let { favorites, children, menu } = this.state;
        let menuItem:any = children || menu;

        return (
            <div 
                className={classnames({
                    'hoofs-sidebar': true,
                    'hoofs-sidebar-fold': this.state.folding,
                    [`hoofs-sidebar-mode-${this.props.mode}`]: this.props.mode
                })}
            >
                <div className='ui-sidebar-wrapper'>
                <SideHeader onFoldSwitch={()=>{
                    this.setState({
                        foldState: undefined,
                        folding: !this.state.folding
                    })
                }}/>

                <div className='hoofs-sidebar-inner'>
                    {   this.state.children && this.state.firstMenu && 
                        <dl>
                            <dd onClick={this.goFirstMenu}>
                                <HoofsIcons.ArrowLeftOutlined/>
                                <span className='hoofs-sidebar-menu-text'>{i18n.join(this.state.firstMenu.name)} </span>
                            </dd>
                        </dl>
                    }
                    <div className='hoofs-sidebar-menu'>
                        {
                            menuItem.map((it, i) => {
                                return <SideMenu  
                                         key={i}             
                                         currentKey={this.state.currentKey}  
                                         onSelectMenu={this.onSelectMenu}
                                            
                                         name={it.group} 
                                         menu={it.menu} 
                                        />;
                            })
                        }
                    </div>

                    {
                        !!this.state.children && favorites && favorites.length > 0 &&
                        <div className='hoofs-sidebar-favorites'>
                            <SideMenu 
                                currentKey={this.state.currentKey}  
                                name={i18n.translate('收藏')} 
                                onSelectMenu={this.onSelectMenu}
                                menu={favorites}
                            />
                        </div>
                    }
                </div>

                { 
                    this.props.roadmap && !this.state.children && 
                    <div className='hoofs-sidebar-roadmap'>
                        <SideMenu 
                            currentKey={this.state.currentKey} 
                            onSelectMenu={this.onSelectMenu}
                            menu={this.props.roadmap} 
                        />
                    </div>
                }

                { this.props.mode == 'Platform' && <SideFooter/>}
                </div>
            </div>
        )
    }
}

