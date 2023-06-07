/*
 * @Author: your name
 * @Date: 2021-10-18 16:10:17
 * @LastEditTime: 2022-03-02 17:09:52
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /designer/Users/iceet/work/hucsin/blocksx/packages/design-components/src/former/types/select/index.tsx
 */


import React from 'react';
import { IFormerBase } from '../../typings';

import UtilsDatasource from '../../../utils/datasource';
import { utils } from '@blocksx/core';
import { Select } from 'antd';

interface IFormerSelect extends IFormerBase {
  value: any,
  size: any,
  onChangeValue: Function,
  relyon: any;
  'x-type-props': any
  dataSource?:any;
}

import './style.less';


export interface SFormerSelect {
  value: any,
  dataSource: any[],
  relyon: any,
  loading: boolean,
  multiple: boolean
}

export default class FormerSelect extends React.Component<IFormerSelect, SFormerSelect> {
  public constructor(props: IFormerSelect) {
    super(props);
    let isMultiple: boolean = this.isMultiple();

    this.state = {
      value: isMultiple ? this.fixedMultipleValue(props.value) : props.value,
      dataSource: [],
      relyon: props.relyon || {},
      loading: false,
      multiple: isMultiple
    };

  }
  public componentDidMount() {

    this.fetchData();
  }
  public UNSAFE_componentWillReceiveProps(newProps: any) {
    if (newProps.value != this.state.value) {
      this.setState({
        value: this.isMultiple() ? this.fixedMultipleValue(newProps.value) : newProps.value
      })
    }
    
    if (newProps.relyon != this.state.relyon) {
      this.setState({
        relyon: newProps.relyon
      })
    }
  }

  private fixedMultipleValue(value) {
    if (!utils.isArray(value)) {
      return [value]
    }
    return value;
  }

  private isMultiple() {
    let typeProps: any = this.props['x-type-props'] || {};
   
    return !!typeProps['mode']
  }
  private onChange = (value: any) => {
    
    this.setState({
      value: value
    });

    this.props.onChangeValue(value);
  }
  
  private setLoading(loading: boolean) {
    this.setState({
      loading: loading
    })
  }

  private fetchData (data?: any) {
    let { dataSource } = this.props['x-type-props'] || {};
    let source: any = data || dataSource || this.props.dataSource;

    console.log()

    if (source) {
      this.setLoading(true);

      UtilsDatasource.getSource(source, this.state.relyon).then((data: any) => {
        this.setState({
          dataSource: data, 
          loading: false
        })
      })
    }
  }

  private renderRemarks(remarks: any) {
    if (remarks) {
      return (
        <span className='design-former-select-remarks'>({remarks})</span>
      )
    }
  }
  private renderChildren() {
    let dataSource: any[] = this.state.dataSource;

    return dataSource.map((it => {
      let value: any = it.value || it.key;
      let label: any = it.label || it.name;

      return (
        <Select.Option key={value} value={value}>{label}{this.renderRemarks(it.remarks)}</Select.Option>
      )
    }))
  }

  public render() {
    return (
      <Select
        {...this.props['x-type-props']}   
        onFocus={() => {
          this.fetchData();
        }}
        disabled={this.props.disabled}  
        loading={this.state.loading}
        onChange = {this.onChange}
        size={this.props.size}
        value={this.state.value}
      >
        {this.renderChildren()}
      </Select>
    )
  }
}
