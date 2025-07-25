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
import ReactMarkdown from '../../../Markdown';
import { utils } from '@blocksx/core';
import { DownOutlined, RightOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import TablerUtils from '../../../utils/tool';



import { IFormerObjectItem } from '../../typings';

interface TFormerObjectItem {
    switch: boolean;
    collapse: boolean;
    value:any;
    colspan: any;
    description?: string;
}
interface IFormerObjectItemS extends IFormerObjectItem {
    value: any;
    size: any;
    notice: any;
    dict?:any[];
    defaultValue?: any;
    onChangeValue: Function;

    renderTitlePortal?: any;
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
    private getDescriptionText() {
        let { dict, description } = this.props;
        let { value } = this.state;

        if (this.state.description) {
            return this.state.description
        }

        if (dict) {
            let matchDescription: any = dict.find(it => it.value == value);

            if (matchDescription && matchDescription.description) {
                return matchDescription.description
            }
        }

        return description;
    }
    public render() {
        
        let descriptionText: any = this.getDescriptionText();
        let tooltip: string = this.props.tooltip || this.props.notice;
        
        if (this.props.hidden) {
            return <div style={{display:'none'}}>{this.props.children}</div>;
        }
        return (
            <div 
                className={classnames('former-object-item', {
                    [`former-object-${this.props.size}`]: true,
                    [`former-object-hidden-item`]: this.props.hidden,
                    [`former-object-label-bold`]: this.props['x-label-bold'],
                    [`former-object-item-float-${this.props['x-float']}`]: this.props['x-float'],
                    [`former-object-item-clear`]: this.props['x-clear'],
                    'former-object-collapse': this.props['x-model-collapse'],
                    // 'former-object-half-width': this.props['x-half-width'],
                    [`former-object-colspan-${this.state.colspan}`]: this.state.colspan,
                    'former-object-collapse-on': this.state.collapse,
                    'former-object-label-indent': this.props['x-label-indent'] || this.props['x-indent'],
                    'former-object-content-indent': this.props['x-content-indent'] || this.props['x-indent'],
                    'former-object-required': this.props['x-validation'] ?  this.props['x-validation']?.required  : false,
                    [`former-object-align-${this.props['x-label-align']}`]: this.props['x-label-align'],
                    'former-object-label-hidden': this.props['x-label-hidden'] ,
                    'former-object-item-hidden': (this.props.conditionalDisplay && !this.state.value)
                })}
            >
                {this.props.title ? <div className="former-object-item-label">
                    {this.props['x-model-collapse'] && <span 
                        className="former-object-label-collapse"
                        onClick={this.onCollapse}
                    >{!this.state.collapse ? <DownOutlined/> : <RightOutlined/>}</span>}
                    <span className="former-object-label-title">
                        {this.props['x-label-icon'] && TablerUtils.renderIconComponent({icon: this.props['x-label-icon']})}
                        {this.props.title}
                    </span>
                    {this.props.renderTitlePortal && this.props.renderTitlePortal()}
                    {utils.isValidValue(tooltip) && <Tooltip arrow={{ pointAtCenter: true }} placement="topLeft" title={tooltip}><ExclamationCircleOutlined/></Tooltip> }
                    {utils.isValidValue(this.props['x-model-switch']) && <Checkbox className="model-switch" checked={this.state.switch} onChange={this.onSwitch}/>}
                    {this.props.oneOf ? <span className="former-object-label-menu">
                        {this.props.oneOf}
                    </span> : null}
                    {utils.isValidValue(descriptionText) && <span className='former-object-label-description'><ReactMarkdown>{descriptionText}</ReactMarkdown></span>}
                    
                </div> : null }
                {this.state.switch && <div className="former-object-item-content">{React.cloneElement(this.props.children, {
                    onDescriptionSwitch: (description:any) =>{
                        
                        this.setState({
                            description
                        })
                    }
                })}</div>}
            </div>
        )
    }
}