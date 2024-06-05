/**
 * 支持 
 * box
 * notice
 * former，
 * 
 */

import React from 'react';
import { Typography, Button, Space } from "antd";
import classnames from 'classnames';
import Manger from '../../core/SmartPageManger';
import * as FormerTypes from '../../../Former/types';

import TableUtils from '../../../utils/tool';

import './style.scss';

interface SmartPageActicleProps {
    schema: any,
    viewer?: boolean;
    pageMeta?: any,
    title?: string;
    icon?: string;
    path?: string;
    value?: any;
    size: string;
}

interface SmartPageActicleState {
    title?: string;
    icon?: string;
    value: any;
    loading?: boolean;
}

export default class SmartPageArticle extends React.Component<SmartPageActicleProps, SmartPageActicleState> {
    public static defaultProps = {
        size: 'default'
    }
    public constructor(props: SmartPageActicleProps) {
        super(props);

        this.state = {
            loading: false,
            value: props.value || {}
        }
    }
    private filterFields(place: string) {
        let { fields = []} = this.props.schema;
        
        return fields.filter((it) => {
            return it.meta &&(it.meta.slot === place || it.meta.place === place)
        })
    }
    private renderByPlace(place: string) {
        let { value = {}} = this.state;

        let title: any = this.filterFields(place);
        console.log(title, place)
        
        return title.map((it, index) => {

            let trueValue: any = value[it.fieldKey];

            if (place == 'avatar') {
                
                if (it.dict) {
                    let matchitem: any = it.dict.find(it=> it.value == trueValue);
                    if (matchitem) {
                        return (
                            <FormerTypes.avatar  key={'a'+index} icon={matchitem.icon} />
                        )
                    }
                } 

            } else {
                return (
                    <span key={index}>
                        {it.icon && TableUtils.renderIconComponent(it)}
                        {trueValue}
                    </span>
                )
            }
        })
    }
    private renderTitle() {
        
        return (
            <div className='ui-smartpage-article-title'>
                <Typography.Title level={4}>{this.renderByPlace('avatar')}{this.renderByPlace('title')}</Typography.Title>
                <div className='ui-smartpage-article-des'>{this.renderByPlace('summary')}</div>
                <div className='ui-smartpage-article-toolbar'>
                    <Space.Compact size='small' block>
                        <Button type='primary'>dd</Button>
                        <Button>dd</Button>
                    </Space.Compact>
                </div>
            </div>
        )
    }
    public render() {
        return (
            <div className='ui-smartpage-article'>
                {this.renderTitle()}
                <div className='ui-smartpage-article-content'>
                    d
                </div>
            </div>
        )
    }
}


Manger.registoryComponent('article', SmartPageArticle);
