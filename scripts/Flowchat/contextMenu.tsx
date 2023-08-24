/*
 * @Author: wangjian366 wangjian366@pingan.com.cn
 * @Date: 2020-09-30 15:24:57
 * @LastEditors: wangjian366 wangjian366@pingan.com.cn
 * @LastEditTime: 2022-06-14 13:38:20
 * @FilePath: /blocksx/packages/design-components/src/diagram/contextMenu.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import { Menu, Divider } from 'antd';



interface ContextMenuProps  {
    pageX: number,
    pageY: number,
    visible: boolean,
    onContextMenu: Function,
    type: string
}

interface ContextMenuState {
    pageX: number,
    pageY: number,
    type: string,
    visible: boolean,
}

export default class ContextMenu extends React.Component<ContextMenuProps, ContextMenuState> {
    public constructor(props:ContextMenuProps ) {
        super(props)
        this.state = {
            visible: props.visible,
            pageX: props.pageX,
            pageY: props.pageY,
            type: props.type
        }
    }
    public UNSAFE_componentWillReceiveProps (newProps: any) {
        if (newProps.visible != this.state.visible) {
            this.setState({
                visible: newProps.visible
            })
        }

        if (newProps.pageX != this.state.pageX || newProps.pageY != this.state.pageY) {
            this.setState({
                pageX: newProps.pageX,
                pageY: newProps.pageY
            })
        }
    }
    private renderMenuItem() {

        switch (this.props.type) {
            // 管道
            case 'pipe':
                return (
                    [<Menu.Item key="props">属性</Menu.Item>,
                        <Menu.Divider key="2"/>,
                        <Menu.Item key="remove"><span>删除</span></Menu.Item>]
                    
                )
            case 'paste':
                return (
                    <Menu.Item key="paste">粘贴</Menu.Item>
                )
            // node
            default:
                return (
                    [   
                        <Menu.Item key="props">属性</Menu.Item>,
                        this.props.type == 'children' ? <Menu.Item key="subprocess">子流程</Menu.Item> : null,
                        <Menu.Divider key="3"/>,
                        <Menu.Item key="copy">复制</Menu.Item>,
                        <Menu.Item key="cut">剪切</Menu.Item>,
                        <Menu.Divider key="2"/>,
                        <Menu.Item key="remove"><span>删除</span></Menu.Item>
                    ]
                )
        }
    }
    private renderMenu() {
        return (
            <div 
                className={classnames("diagram-comtextmenu", {
                    'diagram-contextmenu-hidden': !this.state.visible
                })}

                style = {{
                    left: this.state.pageX,
                    top: this.state.pageY
                }}
            >
                <Menu selectable={false} onClick ={(e)=> this.props.onContextMenu(e)}>
                    {this.renderMenuItem()}
                </Menu>
            </div>
        )
    }
    public render() {
        return ReactDOM.createPortal(this.renderMenu(), document.body)
    }
}
