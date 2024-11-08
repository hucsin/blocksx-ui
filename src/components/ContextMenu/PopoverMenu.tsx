import React from 'react';
import PluginManager from '../core/manager/ManagerPlugin';
import ContextMenuManger from '../core/manager/ManagerContextMenu';
import PopoverMenu from '../PopoverMenu'


interface PopoverContextMenuProps {
    children?: any;
    namespace: string;
    menu: any;
    payload: any;
    onMenuClick?: Function;
}
interface PopoverContextMenuState {
    menu: any;
    payload: any;
    namespace: string;
}

export default class PopoverContextMenu extends React.Component<PopoverContextMenuProps, PopoverContextMenuState> {
    public constructor(props: PopoverContextMenuProps) {
        super(props);
        this.state = {
            menu: props.menu || [],
            payload: props.payload || {},
            namespace: props.namespace
        }
    }
    private onMenuClick =(menu:any)=> {
       this.props.onMenuClick && this.props.onMenuClick(menu, this.state.payload)
    }

    private findMenuByContext() {
        
        let menu: any = ContextMenuManger.filter(this.props.menu || [], this.state.namespace, this.state.payload);
        let contextMenu: any = PluginManager.getContextMenu(this.state.namespace, this.state.payload) || [];

        return [
            ...menu,
            ...contextMenu
        ]
    }
    public render () {
        return (
            <PopoverMenu
                menu={this.findMenuByContext()}
                payload={this.state.payload}
                onMenuClick={this.onMenuClick}
            >{this.props.children}</PopoverMenu>
        )
    }
}