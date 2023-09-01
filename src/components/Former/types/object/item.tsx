/*
 * @Author: your name
 * @Date: 2020-09-05 14:45:54
 * @LastEditTime: 2022-06-21 16:37:36
 * @LastEditors: wangjian366 wangjian366@pingan.com.cn
 * @Description: In User Settings Edit
 * @FilePath: /designer/Users/iceet/work/hucsin/blocksx/packages/design-components/src/former/types/object/item.tsx
 */
import React from 'react';
import classnames from 'classnames';

import { Checkbox, Tooltip } from 'antd';
import { utils } from '@blocksx/core';
import { DownOutlined, RightOutlined, ExclamationCircleOutlined } from '@ant-design/icons';



import { IFormerObjectItem } from '../../typings';

interface TFormerObjectItem {
    switch: boolean;
    collapse: boolean;
    value:any;
    colspan: any;
}
interface IFormerObjectItemS extends IFormerObjectItem {
    value: any;
    size: any;
    defaultValue?: any;
    onChangeValue: Function;
    'x-model-switch'?: boolean;

    hidden?:boolean;
    children?: any;

}

export default class FormerObjectItem  extends React.Component<IFormerObjectItemS, TFormerObjectItem> {

    public constructor(props: IFormerObjectItemS) {
        super(props);
        this.state = {
            switch: this.getSwitchOn(props.value),
            collapse: false,
            colspan: this.getDefaultColspan(props['x-colspan']),
            value: props.value,
        }
    }

    public UNSAFE_componentWillReceiveProps(newProps: any) {
        if (newProps.value != this.state.value) {
            this.setState({
                value: newProps.value
            })
        }
    }
    private getDefaultColspan(colspan: any) {
      let defaultColumn:any = {
        '1': 'one',
        '2': 'two',
        '3': 'three'
      };

      return defaultColumn[colspan] || colspan;

    }
    private getSwitchOn(value: any) {
        if (utils.isValidValue(this.props['x-model-switch'])) {
            //let defaultValue = utils.isUndefined(props.defaultValue) ? props.value : props.defaultValue;
            if (false === value ) {
                return false;
            }
            return !!this.props['x-model-switch']
        }
        return true;
    }

    private onSwitch =()=> {
        this.setState({
            switch: !this.state.switch
        });
        // 当switch为false的时候
        if (!!this.state.switch) {
            this.props.onChangeValue(false);
        } else {
            this.props.onChangeValue(this.props.defaultValue)
        }
    }
    private onCollapse =()=> {
        this.setState({
            collapse: !this.state.collapse
        })
    }
    public render() {
        return (
            <div 
                className={classnames('former-object-item', {
                    [`former-object-${this.props.size}`]: true,
                    'former-object-collapse': this.props['x-model-collapse'],
                    // 'former-object-half-width': this.props['x-half-width'],
                    [`former-object-colspan-${this.state.colspan}`]: this.state.colspan,
                    'former-object-collapse-on': this.state.collapse,
                    'former-object-label-indent': this.props['x-label-indent'] || this.props['x-indent'],
                    'former-object-content-indent': this.props['x-content-indent'] || this.props['x-indent'],
                    'former-object-required': this.props['x-validation'] ?  this.props['x-validation'].required  : false,
                    [`former-object-align-${this.props['x-label-align']}`]: this.props['x-label-align'],
                    'former-object-label-hidden': this.props['x-label-hidden']
                })}
            >
                {this.props.title ? <div className="former-object-item-label">
                    {this.props['x-model-collapse'] && <span 
                        className="former-object-label-collapse"
                        onClick={this.onCollapse}
                    >{!this.state.collapse ? <DownOutlined/> : <RightOutlined/>}</span>}
                    <span className="former-object-label-title">
                        {this.props.title}
                    </span>
                    {utils.isValidValue(this.props['description']) && <Tooltip arrowPointAtCenter={true} placement="topLeft" title={this.props['description']}><ExclamationCircleOutlined/></Tooltip> }
                    {utils.isValidValue(this.props['x-model-switch']) && <Checkbox className="model-switch" checked={this.state.switch} onChange={this.onSwitch}/>}
                    {this.props.oneOf ? <span className="former-object-label-menu">
                        {this.props.oneOf}
                    </span> : null}
                </div> : null }
                {this.state.switch && <div className="former-object-item-content">{this.props.children}</div>}
            </div>
        )
    }
}