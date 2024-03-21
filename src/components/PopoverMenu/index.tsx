import React from 'react';
import { utils } from '@blocksx/core';
import * as Icons from '../Icons'
import Pick from '../Pick';
import { Popover, Menu,  Button } from 'antd';
import UtilTool from '../utils/tool'

import './style.scss'

interface PopoverMenuProps {
    children?: any;
    menu: any[];
    payload: any;

    onMenuClick: Function;
}
interface PopoverMenuState {
    menu: any;
    cacheKey: string;
    payload: any;
    currentItem: any;

    open: boolean;

    confirm: string;
}

export default class PopoverMenu extends React.Component<PopoverMenuProps, PopoverMenuState> {
    private itemCache: any;
    public constructor(props: PopoverMenuProps) {
        super(props);

        this.itemCache = {};
        this.state = {
            open: false,
            menu: this.cleanseMenu(props.menu || []),
            cacheKey: JSON.stringify(props.menu),
            payload: props.payload,
            confirm: '',
            currentItem: null
        };

        
    }
    public UNSAFE_componentWillUpdate(newProps: PopoverMenuProps) {
        let cacheKey: string = JSON.stringify(newProps.menu);
        if (cacheKey != this.state.cacheKey) {
            this.setState({
                cacheKey,
                menu: this.cleanseMenu(newProps.menu),
                payload: newProps.payload
            })
        }
    }
    private cleanseMenu(menu: any) {

        let treeMenu: any = menu.map(mu => { 
            if (utils.isString(mu.icon)) {
                mu.icon = UtilTool.renderIconComponent(mu);
            }

            if (mu.children) {
                mu.children = this.cleanseMenu(mu.children)
            }
            
            this.itemCache[mu.key] =  mu;

            return {
                ...mu,
                action: null,
                control: null
            };
        })

        if (treeMenu.length) {
            let lastNode: any = treeMenu[treeMenu.length-1];
            if (lastNode && lastNode.type == 'divider') {
               treeMenu.pop();
            }
        }

        return treeMenu;
    }
    private onMenuClick() {
        let currentItem: any = this.state.currentItem;
        if (currentItem.danger) {
            return this.setState({
                confirm: utils.isString(currentItem.danger) ? currentItem.danger : currentItem.confirm
            })
        }
        this.doAction();
    }
    private doAction() {
        this.props.onMenuClick && this.props.onMenuClick(this.state.currentItem)
    }
    private renderMenu() {
        return (
            <Menu 
                selectable={false}
                mode="vertical"
                items={this.state.menu}
                onClick={(e) => {
                    e.domEvent.stopPropagation();
                    
                    this.setState({
                        open: false,
                        currentItem: this.itemCache[e.key]
                    }, () => {
                        this.onMenuClick()
                    })

                    
                }}
            />
        )
    }
    public render() {
        let hasNoMenu: boolean = this.state.menu.length ==0;
        return (
            <>
                {this.state.confirm && <Pick 
                        type='confirm' 
                        visible={!!this.state.confirm} 
                        title={this.state.confirm}
                        danger
                        onConfirm={()=> {
                            this.doAction();
                        }}
                        onHidden={()=>{this.setState({confirm: '', currentItem: null})}}
                    />}
                <Popover

                    content={this.renderMenu()}
                    open={this.state.open}
                    overlayClassName="popover-menu-wrapper"
                    trigger="click"
                    onOpenChange={(vs)=> this.setState({open: hasNoMenu ? false :vs})}
                    placement="bottomRight"
                    arrow={{pointAtCenter:true}}
                >
                    { hasNoMenu ? null :(this.props.children || <Button size='small'  type="text"  icon={<Icons.MenuUtilityOutlined/>}></Button>)}
                </Popover>
            </>
        )

    }
}