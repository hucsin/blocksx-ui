import React from 'react';
import { utils } from '@blocksx/core';

import { EditFilled , DownOutlined } from '../../../../Icons';
import { Input, Button, Dropdown, Menu, message } from 'antd';

export const DEFAULT_TYPES: any = [
  'string',
  'array',
  'object',
  '',
  'oneOf'
]

import './style.scss';

export interface FieldTitleProps {
  fieldKey?: string;
  fieldName?: string;
  fieldType?: string;
  typeList?:any[];
  onChange?: Function;
  onChangeType?: Function;
  isAllowKey?: Function;
}
export interface FieldTitleState {
  fieldKey?: string;
  fieldName?: string;
  fieldType?: string;

  editing: boolean;
  typeList: any[];
}


export default class FieldTitle extends React.PureComponent<FieldTitleProps, FieldTitleState> {
  public constructor(props:FieldTitleProps) {
    super(props);

    this.state = {
      fieldKey: props.fieldKey,
      fieldName: props.fieldName,
      fieldType: props.fieldType,
      editing: false,
      typeList: props.typeList || DEFAULT_TYPES
    }
  }
  public UNSAFE_componentWillReceiveProps(newProps: any) {
    if (newProps.fieldType != this.state.fieldType) {
        this.setState({
          fieldType: newProps.fieldType
        })
    }
}
  private onSave =()=> {
     // 判断关键字
    if (this.props.isAllowKey) {
      
      if (!this.props.isAllowKey(this.state.fieldKey)) {
        if (this.props.fieldKey != this.state.fieldKey) {
          return message.error('存在重复的字段标识');
        }
      }
    }

    this.setState({
      editing: false
    })
    if (this.props.onChange) {
      this.props.onChange(this.state.fieldKey, this.state.fieldName, this.state.fieldType)
    }
  }
  private onMenuClick =(e)=> {
    this.setState({
      fieldType: e.key
    })
    if (this.props.onChangeType) {
      this.props.onChangeType(e.key)
    }
  }
  private renderMenu() {
    let typeList: any[] = this.state.typeList;

    return (
      <Menu
        onClick={this.onMenuClick}
      >
        {typeList.map((it: any, index: number) => {
          if (!it) {
            return <Menu.Divider key={index} />
          }
          return (
            <Menu.Item key={it}>{it}</Menu.Item>
          )
        })}
      </Menu>
    )
  }
  public render() {
    let hasKey: boolean = !!this.state.fieldKey;

    return (
      <div className='former-field-title'>

        {!this.state.editing ? <React.Fragment>
          
          {hasKey ? <React.Fragment>
            <span className='former-field-title-key'>{this.state.fieldKey}</span> 
            <span className='former-field-title-space'>/</span> 
          </React.Fragment> : null}
          <span className='former-field-title-name'>{this.state.fieldName}</span>
          <span className='former-field-type'>
            <span className='former-field-type-arraw'>&lt;</span>
            <Dropdown 
               overlay={this.renderMenu()} 
               trigger={['hover']

            }>
              <span>{this.state.fieldType}<DownOutlined/></span>
            </Dropdown>
            <span className='former-field-type-arraw'>&gt;</span>
          </span>
          <EditFilled 
            className='former-field-icon'
            onClick={()=>{
              this.setState({
                editing: true
              })
            }}
          />
          
        </React.Fragment> : 
          <React.Fragment>
            <Input.Group compact>
              <Input 
                style={{ width: '80px' }} 
                value={this.state.fieldKey}
                onChange={(e:any)=> {

                  let key: string = (e.target.value || '').replace(/[^0-9a-z]/i, '')
                 
                  this.setState({
                    fieldKey: key
                  })
                }} 
                size="small"
                placeholder='字段标识' 
              />
              <Input 
                style={{ width: '80px' }} 
                value={this.state.fieldName} 
                onChange={(e:any)=> {
                  this.setState({
                    fieldName: e.target.value
                  })
                }} 
                size="small"
                placeholder='字段名称' 
              />
              <Button
                size="small" 
                type="default"
                onClick={this.onSave}
              >保存</Button>
            </Input.Group>
          </React.Fragment>
        }
      </div>
    )
  }
}