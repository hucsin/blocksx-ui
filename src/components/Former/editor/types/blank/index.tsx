/*
 * @Author: wangjian366 wangjian366@pingan.com.cn
 * @Date: 2022-02-23 14:08:18
 * @LastEditors: wangjian366 wangjian366@pingan.com.cn
 * @LastEditTime: 2022-07-12 12:53:55
 * @FilePath: /blocksx/packages/design-components/src/former/editor/types/blank/index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React from 'react';
import Former from '../../../';
import * as TypeSchema from './schema';
import { utils } from '@blocksx/core';

export interface BlankProps {
  fieldKey: string;
  value: any
}
export interface BlankState {
  value: any;
}

export default class Blank extends React.PureComponent<BlankProps, BlankState> {
  static defaultValue: any = {
    type: 'string',
    title: '',
    properties: {}
  }

  public constructor(props: BlankProps) {
    super(props);
    this.state = {
      value: props.value || utils.copy(Blank.defaultValue)
    }
  }

  private getSchema() {
    let { type } = this.state.value;
    return TypeSchema[type];
  }

  private onChangeValue =(v)=> {
    console.log(v)
  }

  public render() {
    
    let schema: any = this.getSchema();

    return (
      <Former 
        column={'two'}
        groupType='more'
        onChangeValue={this.onChangeValue} 
        value={this.state.value} 
        schema={schema}
      />
    )
  }
}