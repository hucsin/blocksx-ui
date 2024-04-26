import React from 'react';
import { IFormerBase } from '../../typings';

import { CloseCircleOutlined } from '@ant-design/icons';

interface IMapItem extends IFormerBase {
    value: any;
    index: number;
    onMapItemRemove: Function;
    children?:any;
}


export default class FormerMapItem extends React.Component<IMapItem, {}> {
    public constructor(props: IMapItem) {
        super(props)
    }
    // 删除项
    private onMapItemRemove =()=> {
        if (this.props.onMapItemRemove) {
            this.props.onMapItemRemove(this.props.index);
        }
    }
    public render() {
        let  children: any = this.props.children;

        if (children && children.length == 2 ) {
            return (
                <div className="former-map-item">
                    <div className="former-map-item-left">
                        {children[0]}
                    </div>
                    
                    <div className="former-map-item-right">
                        {children[1]}
                    </div>

                    <div className="former-map-item-remove" onClick={this.onMapItemRemove}><CloseCircleOutlined/></div>
                </div>
            )
        }
        return null;
    }
}