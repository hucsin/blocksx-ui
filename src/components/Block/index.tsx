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
            console.log(it, 222)
            return <View key={index} {...it} />
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
