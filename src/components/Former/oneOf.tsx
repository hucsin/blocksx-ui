import React from 'react';
import { Popover, Menu } from 'antd';

import { utils } from '@blocksx/core';
import './oneOf.scss';

interface IOneOf {
    type: string;
    props: any;
    prop: any;
    value: any;
    onOneOfSelect?: Function;
}

export default class OneOf extends React.Component<IOneOf, {current: any; visible: boolean}> {
    public constructor(props: IOneOf) {
        super(props);

        this.state = {
            current: OneOf.getSelectKey(props.prop, props.props, props.value),
            visible: false
        }
    }
    public static symbol = '$$scope';
    public static systemMap:any = {
        // 系统提示
    }
    public static getProperties(prop:string, props:any, value:any, key?: string) {
        let oneOfValue = key || this.getSelectKey(prop, props, value);//value[`${OneOf.symbol}${prop}`];
        let items = props.items || [];

        /**
         * 
         * 切换的时候会往数据里面注入一个__oneOf___[prop]
         * 
         */
        if (!oneOfValue) {
            // 如果没有设置值的时候走第一个
            return items[0];
        }
        // 如果在系统里面的情况
        if (OneOf.systemMap[oneOfValue]) {
            return OneOf.systemMap[oneOfValue];
        }
        // 遍历 items 查找符合项
        return items.find((it: any) => {
            return  it.key === oneOfValue;
        }) || (props.type === 'oneOf' && items[0]);
    }
    
    public static matchTypeByTypeValue(type:string, value: any) {
        switch(type) {
            case 'object':
                return utils.isPlainObject(value);
            case 'array':
                return utils.isArray(value);
            case 'boolean':
                return utils.isBoolean(value);
            case 'string':
                return utils.isString(value);
            case 'number':
                return utils.isNumber(value);
        }
    }
    public static getSelectKey(prop: string, props: any, value:any) {
        let _value = value[prop];
        // 系统保留
        if(utils.isPlainObject(_value)) {
            if (_value[OneOf[`Symbol`]]) {
                return _value[OneOf[`Symbol`]]
            }
        }
        // 取oneOf 
        if (props.type === 'oneOf') {
            let { items = [] } = props;
            let match = items.find((it:any)=> {
                if (OneOf.matchTypeByTypeValue(it.type, _value)) {
                    return true;
                }
            });

            if (match) {
                return match.key;
            }
            return items[0].key;
        }
    }

    private onMenuSelect =(e: any)=> {
        let { key } = e;
        let { prop, props, value } = this.props;

        this.setState({
            current: key,
            visible: false
        });


        let schema = OneOf.getProperties(prop, props, value, key);

        if ( this.props.onOneOfSelect) {
            this.props.onOneOfSelect(schema)
        }
    }
    private onVisibleChange =(visible: boolean)=> {
        this.setState({
            visible
        })
    }
    private getOneOfMenu() {
        let { props = {} } = this.props;
        
        return (
            <Menu className="design-leaf-wraper" selectedKeys={[this.state.current]} onSelect={this.onMenuSelect}>
                {props.type == 'oneOf' ? 
                <Menu.ItemGroup title="切换为">
                    {props.items.map((it: any)=> {
                        return <Menu.Item key={it.key}>{it.title}</Menu.Item>
                    })}
                </Menu.ItemGroup> :null}
                {props['x-model-oneOf'] ? <Menu.ItemGroup title="系统预设"></Menu.ItemGroup> : null}
            </Menu>
        )
    }
    private canShow() {
        let { props } = this.props;
        return props.type === 'oneOf' || props['x-model-oneOf'];
    }
    public render() {
        if (this.canShow()) {
            if (this.props.type == 'object') {
                return (
                    <Popover 
                        overlayClassName="design-leaf-oneOf-popover" 
                        open={this.state.visible} arrow={{ pointAtCenter: true }} 
                        placement="bottomRight" 
                        content={this.getOneOfMenu()} 
                        trigger="hover"
                        onOpenChange={this.onVisibleChange}
                    >
                        <span className="design-leaf-oneOf"></span>
                    </Popover>
                )
            }
        }
        return null;
    }
}