/*
 * @Author: your name
 * @Date: 2020-09-01 21:39:28
 * @LastEditTime: 2021-10-26 09:30:51
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /designer/Users/iceet/work/hucsin/blocksx/packages/design-components/src/former/types/input/index.tsx
 */
import React from 'react';
import classnames from 'classnames';

import { IFormerBase } from '../../typings';
import { IconMap } from '../../../Icons/iconmap/index';
import * as Icons from '../../../Icons';
import { Button,Space, Popover, Tabs, Collapse, Input, Tooltip } from 'antd';

import './style.scss';

interface IFormerIcon extends IFormerBase {
    value: any,
    size: any,
    disabled?: boolean,
    onChangeValue: Function
}

class FormerIconView extends React.Component<{value: string}> {
    public render() {
        let IconView: any = Icons[this.props.value];
        if (IconView) {
            return (
                <Tooltip title={this.props.value}><IconView/></Tooltip>
                
            )
        }
        return (<span className='ui-empty'>{'<empty>'}</span>)
    }
}

export default class FormerIcon extends React.Component<IFormerIcon, {open: boolean, searchValue: string, query: string, value: any, classify: string }> {
    public static Viewer: any = FormerIconView;  
    public static defaultProps = {
        type: 'string',
        size: 'small'
    }
    private defaultTab: any = [
        {
            key: 'All',
            label: 'All',
            content: ''
        },
        {
            key: 'Outlined',
            label: 'Outlined',
            content: ''
        },
        {
            key: 'Filled',
            label: 'Solid Filled',
            content: ''
        }
    ]
    public constructor(props: IFormerIcon) {
        super(props);
        this.state = {
            value: props.value,
            classify: 'Filled',
            open: false,
            query: '',
            searchValue: ''
        };
    }
    public UNSAFE_componentWillReceiveProps(newProps: any) {
        
        if (newProps.value != this.state.value) {
            
            this.setState({
                value: newProps.value
            })
        }
    }
    private onChange =(value: any)=> {
       
        this.setState({
            value: value,
            open: false
        });
        
        this.props.onChangeValue(value);
    }
    private getClassifyItems() {
        let keys: any = Object.keys(IconMap);
        let queryMatch: any = this.state.query ? new RegExp(this.state.query, 'igm') : ''

        return keys.map(it => {
            return {
                key: it,
                label: it,
                children: (
                    <div>
                        {IconMap[it].map(icon  => {
                            if (this.state.classify != 'All') {
                                if (icon.indexOf(this.state.classify) == -1) {
                                    return false;
                                }
                            }

                            if (queryMatch) {
                                if (!icon.match(queryMatch)) {
                                    return false;
                                }
                            }

                            let IconView: any = Icons[icon];

                            if (IconView) {
                                return (
                                    <Tooltip key={icon} title={icon}>
                                        <Button className={classnames({'ui-icon-selected': icon == this.state.value})} size='large' onClick={()=> this.onChange(icon)} icon={<IconView />} />
                                    </Tooltip>
                                )
                            }
                        }).filter(Boolean)}
                    </div>
                )
            }
        })
    }
    private renderPopoverContent() {

        return (
            <div className='former-icons-wrapper'>
                <Tabs
                    size="small"
                    key={1}
                    activeKey={this.state.classify}
                    onChange={(v)=> this.setState({classify: v})}
                    items={this.defaultTab}
                    tabBarExtraContent={<Input.Search size="small" value={this.state.query} onChange={(e)=> {this.setState({query:e.target.value})}} onSearch={(e)=> {this.setState({query:e})}} />}
                />
                <Collapse
                    ghost
                    key={2}
                    defaultActiveKey={Object.keys(IconMap)}
                    items={this.getClassifyItems()}
                />
            </div>
            
        )
    }
    public render() {
        let IconView: any = Icons[this.state.value];
        
        return (
            <div className='former-icons-input'>
                <Space.Compact>
                    <Input 
                       // allowClear
                       key={1}
                        prefix={ IconView? <IconView/> : null}
                        size={this.props.size} 
                        placeholder={'<empty>'}
                        readOnly 
                        value={this.state.value} 
                    />
                    <Popover 
                        autoAdjustOverflow
                        key={2}
                        open={this.state.open}
                        trigger={"click"}
                        placement="bottomRight"
                        onOpenChange={(v)=> {this.setState({open: v})}}
                        overlayClassName="former-icons-popover"
                        title="Select The Icon" 
                        content={this.renderPopoverContent()}
                    >
                        <Button size={this.props.size} ><Icons.AppstoreAddOutlined/></Button>
                    </Popover>
                </Space.Compact>
            </div>
        )
    }
}