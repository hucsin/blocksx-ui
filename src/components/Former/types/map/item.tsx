import React from 'react';
import { IFormerBase } from '../../typings';

import { CloseCircleOutlined } from '@ant-design/icons';

interface IMapItem extends IFormerBase {
    value: any;
    index: number;
    onMapItemRemove: Function;
    children?:any;
    properties?: any;
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
        let { viewer, properties } = this.props;

        if (children && children.length == 2 ) {
            return (
                <div className="former-map-item">
                    <span className='number'>#{this.props.index+1}</span>
                    <div className="former-map-item-left">
                        {viewer && <span>{properties.key.fieldKey}:</span>}
                        {children[0]}
                    </div>
                    
                    <div className="former-map-item-right">
                        {viewer && <span>{properties.value.fieldKey}:</span>}
                        {children[1]}
                    </div>

                    {!this.props.viewer && <div className="former-map-item-remove" onClick={this.onMapItemRemove}><CloseCircleOutlined/></div>}
                </div>
            )
        }
        return null;
    }
}