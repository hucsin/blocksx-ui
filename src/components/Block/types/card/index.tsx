import React from 'react';
import classnames from 'classnames';
import * as Icons from '../../../Icons';
import { List, Typography } from 'antd';
import { BlockItem } from '../../interface';

import BehaviorWrapper from '../../utils/BehaviorWrapper';
import Former from '../../../Former';
import BlockManger from '../../BlockManger';

import './style.scss';

export default class Card extends React.Component<BlockItem,{}> {
    
    public constructor(props: BlockItem) {
        super(props);
    }
    public static defaultProps  = {
        size: 'large',
        colspan: 4,
        layout: "left"
    }
    private getItemType(item: BlockItem) {
        if (item.image) {
            return 'image'
        }
        if (item.avatar || item.icon) {
            return 'avatar';
        }
        return item.type || 'default'
    }
    public renderAvatar(item: BlockItem, index: number) {
        
        if (!item.avatar && !item.image) {
            return  <Former.FormerTypes.avatar size={this.getDefaultAvatarSize()} text={''+(index+1)} />
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
                return <Former.FormerTypes.avatar size={this.getDefaultAvatarSize()} color={item.color as string} icon={item.avatar as string} />
        }
    }
    private getDefaultAvatarSize() {
        
        if (this.props.theme == 'section') {
            return 64;
        }
        return this.props.size;
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
        return 2;
    }
    public render() {

        let theme: string = this.props.theme || 'border';
        let type: string = (this.props.type || 'index').replace(/(_[a-z]|[A-Z])$/g, '');

        return (
            <div 
                className={classnames({
                    'block-card-item': true,
                    [`block-card-layout-${this.props.layout}`]: this.props.layout,
                    [`block-card-type-${type}`]: type,
                    [`block-card-theme-${theme}`]: theme
                })}
            >
                <Typography.Title level={this.getTitleLeval()}>{this.renderTitleIcon()}{this.props.title}</Typography.Title>

                {this.props.description && <Typography.Paragraph className='block-card-subtitle'>{this.props.description}</Typography.Paragraph>}

                <List
                    grid={{ gutter: 16, column: this.props.colspan }}
                    dataSource={this.props.items}
                    className=''

                    renderItem={(item, index)=> this.renderContent(item, index)}
                />
            </div>
        );
    }
}

BlockManger.set('card', Card);