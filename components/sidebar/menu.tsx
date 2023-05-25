
import React from 'react';
import  * as HoofsIcons  from '../icons';
import { SidebarMenuItem } from './typing';


interface SiderbarMenuProps {
    name?: String;
    menu?: SidebarMenuItem[]
}
interface SiderbarMenuState {

}

class SidebarRightShortcut extends React.Component {
    public render () {
        return (
            <span>⌘K</span>
        )
    }
}
class SidebarRightAction extends React.Component {
    public render () {
        return (
            <HoofsIcons.PlusOutlined />
        )
    }
}
class SidebarRightHot extends React.Component {
    public render () {
        return (
            <HoofsIcons.Dot />
        )
    }
}
class SiderbarRightLink extends React.Component {
    public render () {
        return (
            <HoofsIcons.OpenNewWindow />
        )
    }
}
class SiderbarRightChildren extends  React.Component {
    public render () {
        return (
            <HoofsIcons.ArrowRightOutlined />
        )
    }
}


export default class SidebarMenu extends React.Component<SiderbarMenuProps, SiderbarMenuState> {
    private TypeMap: any = {
        'Shortcut': SidebarRightShortcut,
        'Action':SidebarRightAction,
        'Hot': SidebarRightHot,
        'Link': SiderbarRightLink
    }
    public constructor(props: SiderbarMenuProps) {
        super(props);
    }
    public renderRight (it: SidebarMenuItem) {
        if (it.children || it.type) {
            let RightIcon: any = this.TypeMap[it.type as any] || SiderbarRightChildren;

            return (
                <span 
                    className='hoofs-sidebar-menu'
                    onClick = {()=> {
                        if (['Shortcut', 'Action'].indexOf(it.type as any) > 0) {
                            it.onAction && it.onAction(it);
                            return false;
                        }
                    }}
                ><RightIcon/></span>
            )
        }
    }
    public render() {
        let { menu, name } = this.props;
        console.log(name, menu, 333)
        return (
            <dl className='hoofs-sidebar-menu'>
                {name ? <dt>{name}</dt> : null}
                <>
                    {menu && menu.map((it: SidebarMenuItem) => {
                        let IconView: any = HoofsIcons[it.icon as any];

                        return (
                            <dd 
                                key={it.key}
                                onClick={()=> {
                                    it.onSelect && it.onSelect(it);
                                }}
                            >
                                {IconView && <IconView/>}
                                {it.type == 'Link' 
                                  ? <a className='hoofs-sidebar-menu-text'>{it.name}</a>
                                  : <span className='hoofs-sidebar-menu-text'>{it.name}</span>
                                }

                                {this.renderRight(it)}
                            </dd>
                        )
                    })}
                </>
            </dl>
        )
    }
}