/**
 * block 
 * 
 * 类型1: 
 *  左边介绍
 */

import React from "react";
import classnames from 'classnames';

import { BoxItem } from './interface';
import BoxManger from "./BoxManger";
import './types';
import './index.scss';

export interface BoxProps {
    toolbarRef?: any;
    meta?: any;
    size?: 'small' | 'default' | 'large';
    events?: any;
    dataSource: BoxItem[];
    value?: any;
}

interface BoxState {
    value?: any;
}


export default class Box extends React.Component<BoxProps, BoxState> {

    public constructor(props: BoxProps) {
        super(props);

        this.state = {
            value: props.value
        }
    }
    
    public UNSAFE_componentWillReceiveProps(nextProps: BoxProps) {
        if (nextProps.value !== this.props.value) {
            this.setState({
                value: nextProps.value
            })
        }
    }
    public renderChildren(it: BoxItem, index: number) {
        
        if (BoxManger.has(it.type)) {
            let View: any = BoxManger.get(it.type);
           
            return <View meta={this.props.meta} key={index} size={this.props.size} value={this.state.value} {...it} events={this.props.events} toolbarRef={this.props.toolbarRef}/>
        }

    }
    public render() {
        
        return (
            <div className="ui-block">

                {this.props.dataSource.map((it, index)=>{
                    return (
                        <div key={index} className={classnames({
                            "ui-block-item": true,
                            [`ui-block-item-name-${it.name}`]: it.name,
                            [`ui-block-item-theme-${it.theme}`]: it.theme,
                            [`ui-block-item-type-${it.type}`]: it.type
                        })}>
                            {this.renderChildren(it, index)}
                        </div>
                    )
                })}
            </div>
        )
    }
}
