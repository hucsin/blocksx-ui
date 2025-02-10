import React from 'react';
import classnames from 'classnames';
import * as Icons from '../../../Icons';
import { List, Typography } from 'antd';
import { BoxItem } from '../../interface';

import BehaviorWrapper from '../../utils/BehaviorWrapper';
import FormerAvatar from '../../../Former/types/avatar';
import BoxManger from '../../BoxManger';

import './style.scss';

export default class Card extends React.Component<BoxItem,{}> {
    
    public constructor(props: BoxItem) {
        super(props);
    }
    public static defaultProps  = {
        size: 'large',
        colspan: 4,
        layout: "left"
    }
    private getItemType(item: BoxItem) {
        if (item.image) {
            return 'image'
        }
        if (item.avatar || item.icon) {
            return 'avatar';
        }
        return item.type || 'default'
    }
    public renderAvatar(item: BoxItem, index: number) {
        
        if (!item.avatar && !item.image) {
            return  <FormerAvatar size={this.getDefaultAvatarSize()} text={''+(index+1)} />
        }
        
        if (item.image) {
            return (<div className='ui-cardlist-image'>
                <img src={item.image as any} />
            </div>)
        }
        
        switch(this.props.type) {
            case 'index':
            case 'item':
            default:
                return <FormerAvatar size={this.getDefaultAvatarSize()} color={item.color as string || '#fdfdfd'} icon={item.avatar as string} />
        }
    }
    private getDefaultAvatarSize() {
        
        if (this.props.theme == 'section') {
            return 64;
        }
        return 42;
    }
    private renderContent(item: any, index:number) {
    
        if (item.type == 'markdown') {
            return (
                <BehaviorWrapper
                    title={item.title}
                    content={{
                        type: 'markdown',
                        content: ()=> {
                            return Promise.resolve(`
# 11
**d **    
                            `)
                        }
                    }}
                >
                    <List.Item className='block-item-pointer' key={index}>
                        <List.Item.Meta avatar={this.renderAvatar(item, index)} title={item.title} description={item.description} />
                    </List.Item>
                </BehaviorWrapper>
            )
        } 

        return (
            <List.Item className={'block-item-type-'+ this.getItemType(item)} key={index}>
                <List.Item.Meta avatar={this.renderAvatar(item, index)} title={item.title} description={item.description} />
            </List.Item>
        )
    }

    private renderTitleIcon() {

        if (this.props.icon) {
            let IconView: any = Icons[this.props.icon as string];
            if (IconView) {
                return <IconView />
            }
        }
    }
    private getTitleLeval() {
        if (this.props.theme == 'section') {
            return 1;
        }
        return 1;
    }
    public render() {

        let theme: string = this.props.theme || 'border';
        let type: string = (this.props.type || 'index').replace(/(_[a-z]|[A-Z])$/g, '');
        let colspan: number = this.props.colspan || 3;

        return (
            <div 
                className={classnames({
                    'block-card-item': true,
                    [`block-card-layout-${this.props.layout}`]: this.props.layout,
                    [`block-card-type-${type}`]: type,
                    [`block-card-theme-${theme}`]: theme
                })}
            >
                <Typography.Title level={2}>{this.renderTitleIcon()}{this.props.title}</Typography.Title>

                {this.props.description && <Typography.Paragraph className='block-subtitle'>{this.props.description}</Typography.Paragraph>}

                <List
                    grid={{ 
                        gutter: 16, 
                        column: colspan,
                        xs: 1,
                        sm: 1,
                        md: 1,
            
                        lg: colspan> 2? colspan - 1 : colspan,
                        xl: colspan,
                        xxl: colspan
                    }}
                    dataSource={this.props.items}
                    className=''

                    renderItem={(item, index)=> this.renderContent(item, index)}
                />
            </div>
        );
    }
}

BoxManger.set('card', Card);