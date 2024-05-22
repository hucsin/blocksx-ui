/**
 * block 
 * 
 * 类型1: 
 *  左边介绍
 */

import React from "react";
import classnames from 'classnames';

import { BlockItem } from './interface';
import BlockManger from "./BlockManger";
import './types';
import './index.scss';

export interface BlockProps {
    size?: 'small' | 'default' | 'large';
    events?: any;
    dataSource: BlockItem[];    
}

interface BlockState {

}


export default class Block extends React.Component<BlockProps, BlockState> {

    public constructor(props: BlockProps) {
        super(props);
    }
    public renderChildren(it: BlockItem, index: number) {
        if (BlockManger.has(it.type)) {
            let View: any = BlockManger.get(it.type);
           
            return <View key={index} {...it} size={this.props.size} events={this.props.events}/>
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
