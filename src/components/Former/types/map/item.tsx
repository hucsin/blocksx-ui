import React from 'react';
import { utils } from '@blocksx/core'
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
    private renderChildren(item: any) {
        return React.cloneElement(item, Object.assign({}, item.props, {
            index: this.props.index,
            key: this.props.index
        }))
    }
    public render() {
        let  children: any = this.props.children;
        let { viewer, properties, index } = this.props;
        let keyProps: any = properties.key || {};
        let keyTitle: string = utils.labelName(keyProps.fieldName || keyProps.fieldKey || "Key");
        let valueProps: any = properties.value || {};
        let valueTitle: string = utils.labelName(valueProps.fieldName || valueProps.fieldName || 'Value')
        if (children && children.length == 2 ) {
            return (
                <div className="former-map-item">
                    <span className='number'>#{this.props.index+1}</span>
                    <div className="former-map-item-left">
                        {viewer && index == 0 && <span>{keyTitle}:</span>}
                        {this.renderChildren(children[0])}
                    </div>
                    
                    <div className="former-map-item-right">
                        {viewer && index == 0 && <span>{valueTitle}:</span>}
                        {this.renderChildren(children[1])}
                    </div>

                    {!this.props.viewer && <div className="former-map-item-remove" onClick={this.onMapItemRemove}><CloseCircleOutlined/></div>}
                </div>
            )
        }
        return null;
    }
}