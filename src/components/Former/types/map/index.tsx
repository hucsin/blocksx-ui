import React from 'react';
import classnames from 'classnames';
import { Tooltip } from 'antd';
import { PlusCircleOutlined, PlusOutlined } from '@ant-design/icons';

import FormerMapItem from './item';
import { IFormerArray } from '../../typings';

import "./style.scss";

interface IFormerMap extends IFormerArray {
    value: any,
    onChangeValue: Function;
    'x-type-props'?: any;
    children?:any;
    fieldName?: any;
    readonly?: boolean;
    errorMessage?: string;
}

export default class FormerMap extends React.Component<IFormerMap, {errorMessage?: string, arrayMode: boolean,value: any, originValue: any, readonly: boolean }> {

    static Item = FormerMapItem;

    public constructor(props: IFormerMap) {
        super(props);
        let value = props.value || {};
        let typeProps:any  = props ['x-type-props'] || {};
        
        
        this.state = {
            value: value,
            originValue: this.getKeyValueArray(value, typeProps.mode == 'array'),
            readonly: props.readonly || false,
            arrayMode: typeProps.mode == 'array',
            errorMessage: props.errorMessage || ''
        };
    }
    public UNSAFE_componentWillReceiveProps(newProps:any) {

        if (newProps.originValue !== this.state.originValue) {
            this.setState({
                originValue: newProps.originValue || []
            })
        }
        if (newProps.readonly !== this.state.readonly) {
            this.setState({
                readonly: newProps.readonly || false
            })
        }
        if (newProps.errorMessage !== this.state.errorMessage) {
            this.setState({
                errorMessage: newProps.errorMessage || ''
            })
        }
    }
    private getKeyValueArray(value: any, arrayMode) {

        if (arrayMode) {
            return value;
        }

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
        let value = this.state.value;
            originValue.splice(index, 1);

        if (!this.state.arrayMode) {
        
            value = this.getValueByOriginValue(originValue);
        } else {
            value = originValue;
        }

        this.setState({
            originValue: originValue,
            value: value
        });

        this.props.onChangeValue(value, null, originValue);
    }
    
    private onMapItemAdd =()=> {
        if (this.props.viewer || this.state.readonly) {
            return;
        }
        let originValue = this.state.originValue;
        let value:any = originValue;

        if (this.state.arrayMode) {
            
            originValue.push([
                '',
                ''
            ]);
            value = originValue;
        } else {
            
            originValue.push({
                key: '',
                value: ''
            })
            value = this.getValueByOriginValue(originValue);

        }
        
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
                key: index,
                properties: this.props['properties'],
                viewer: this.props.viewer || this.state.readonly,
                onMapItemRemove: (index: number) => {
                    this.onMapItemRemove(index);
                }
            }))
        })
    }
    
    private getEmptyChildren() {
        return (
            <div  className={classnames({
                "former-map-empty": true,
                'former-map-disabled': this.props.viewer || this.state.readonly
            })} onClick={this.onMapItemAdd}>
                {!this.props.viewer && !this.state.readonly ? <><PlusOutlined/> Click to add {this.props.fieldName ?  this.props.fieldName.toLowerCase(): 'new item'}</> : ' Empty'}
            </div>
        )
    }

    public render() {
        let children:any  = this.props.children;
        let hasChildren = children && children.length > 0;

        return (
            <Tooltip title={this.state.errorMessage} placement='topLeft'>
                <div className={
                    classnames("former-map", {
                        'former-map-error': !!this.state.errorMessage,
                        'former-map-disabled': this.props.viewer || this.state.readonly
                    })
                }>
                    {hasChildren && !this.props.viewer && <div className="former-map-add" onClick={this.onMapItemAdd}><PlusCircleOutlined/></div>}
                    {hasChildren ? this.getChildren(): this.getEmptyChildren()}
                </div>
            </Tooltip>
        )
    }
}