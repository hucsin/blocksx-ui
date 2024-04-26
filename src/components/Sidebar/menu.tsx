
import React from 'react';
import classnames from 'classnames';

import  * as HoofsIcons  from '../Icons';
import { SidebarMenuItem } from './typing';


interface SiderbarMenuProps {
    name?: String;
    menu?: SidebarMenuItem[];
    currentKey?: String;
    onSelectMenu?: Function;
}
interface SiderbarMenuState {
    currentKey?: String;
}

class SidebarRightShortcut extends React.Component {
    public render () {
        return (
            <span className='sidebar-shortcut-icon'>⌘K</span>
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
            <HoofsIcons.DotSuggestionOutlined />
        )
    }
}
class SiderbarRightLink extends React.Component {
    public render () {
        return (
            <HoofsIcons.OpenWindowUtilityOutlined />
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

        this.state = {
            currentKey: props.currentKey
        }
    }

    public componentWillReceiveProps( props: any) {
        
        if (props.currentKey != this.state.currentKey) {
            this.setState({
                currentKey: props.currentKey
            })
        }
    }
    public renderRight (it: SidebarMenuItem) {
        if (it.children || it.type) {
            let RightIcon: any = this.TypeMap[it.type as any] || SiderbarRightChildren;
            
            return (
                <span 
                    className='hoofs-sidebar-tool'
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

        return (
            <dl className='hoofs-sidebar-menu'>
                {name ? <dt>{name}</dt> : null}
                <>
                    {menu && menu.map((it: SidebarMenuItem) => {
                        let IconView: any = HoofsIcons[it.icon as any];

                        return (
                            <dd 
                                key={it.key}
                                className={classnames({
                                    'ui-select': it.key == this.state.currentKey
                                })}
                                onClick={()=> {
                                    it.onSelect && it.onSelect(it);
                                    
                                    this.props.onSelectMenu && this.props.onSelectMenu(it.key, it)
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