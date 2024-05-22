import React from 'react';
import classnames from 'classnames';
import { PlusCircleOutlined } from '@ant-design/icons';

import FormerMapItem from './item';
import { IFormerArray } from '../../typings';

import "./style.scss";

interface IFormerMap extends IFormerArray {
    value: any,
    onChangeValue: Function;
    'x-type-props'?: any;
    children?:any;
}

export default class FormerMap extends React.Component<IFormerMap, { value: any, originValue: any }> {

    static Item = FormerMapItem;

    public constructor(props: IFormerMap) {
        super(props);
        console.log(props, 33333)
        let value = props.value || {};
        
        this.state = {
            value: value,
            originValue: this.getKeyValueArray(value)
        };
    }
    public UNSAFE_componentWillReceiveProps(newProps:any) {
        if (newProps.originValue !== this.state.originValue) {
            this.setState({
                originValue: newProps.originValue || []
            })
        }
    }
    private getKeyValueArray(value: any) {
        let originValue:any = [];

        for(let p in value) {
            originValue.push({
                key: p,
                value: value[p]
            })
        }
        
        return originValue;
    }
    private getValueByOriginValue(originValue: any[]) {
        

        let value = {};

        originValue.forEach((it:any) => {
            value[it.key] = it.value;
        });

        return value;
    }
    private onMapItemRemove(index: number) {
        let originValue = this.state.originValue;
            originValue.splice(index, 1);

        let value = this.getValueByOriginValue(originValue);
        this.setState({
            originValue: originValue,
            value: value
        });

        this.props.onChangeValue(value, null, originValue);
    }
    
    private onMapItemAdd =()=> {
        let originValue = this.state.originValue;
        
        originValue.push({
            key: '',
            value: ''
        })

        let value = this.getValueByOriginValue(originValue);

        this.setState({
            originValue: originValue,
            value: value
        });

        this.props.onChangeValue(value, null, originValue);
    }
    private getChildren() {
        return React.Children.map(this.props.children, (it:any, index:number) => {
            
            let props = Object.assign({}, it.props);
            
            props.index = index;

            return React.cloneElement(it, Object.assign({
                index: index,
                onMapItemRemove: (index: number) => {
                    this.onMapItemRemove(index);
                }
            }))
        })
    }
    
    private getEmptyChildren() {
        return (
            <div  className="former-map-empty" onClick={this.onMapItemAdd}>点击新增数组项</div>
        )
    }

    public render() {
        let children:any  = this.props.children;
        let hasChildren = children && children.length > 0;

        return (
            <div className={
                classnames("former-map", {
                    
                })
            }>
                {hasChildren && <div className="former-map-add" onClick={this.onMapItemAdd}><PlusCircleOutlined/></div>}
                {hasChildren ? this.getChildren(): this.getEmptyChildren()}
            </div>
        )
    }
}