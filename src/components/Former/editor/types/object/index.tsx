import React from 'react';
import { IFormerObject } from '../../../typings';
import Block from '../block';
import Blank from '../blank';
import Sortable from './sortable';

import { arrayMoveMutable } from 'array-move';
import { PlusOutlined, CloseOutlined, PlusCircleFilled } from '../../../../Icons';


import { utils } from '@blocksx/core';

import './style.scss'


export interface EditorObjectProps {
  fieldKey?: string;
  value: IFormerObject;
  onChange?: Function;
}

export interface EditorObjectState {
  value: any;
  properties: any;
  propertiesMap: any[]
}

export default class FormerEditorObject extends React.PureComponent<EditorObjectProps, EditorObjectState> {
  static defaultValue: any = {
    type: 'object',
    title: '',
    properties: {}
  }

  public constructor(props) {
    super(props);
    let value: any =  props.value || FormerEditorObject.defaultValue;

    this.state = {
      value: value,
      properties: value.properties || {},
      propertiesMap: this.getPropertiesMap(value.properties)
    }
  }

  private getPropertiesMap(properties: any): any[] {
    let propertiesMap: any[] = Object.keys(properties);

    return propertiesMap.sort((left: any, right:any) => {
      return left['x-index'] > right['x-index'] ? -1 : 1;
    })
  }
  
  private onChange() {
    if (this.props.onChange) {
      this.props.onChange();
    }
  }
  private getPrekey(num:number) {
    return ['field',num + 1].join('');
  }
  private getNewItemKey () {
    let propertiesMap:any[] = this.state.propertiesMap;
    let totalNumber: number = propertiesMap.length;
    let fieldKey: string = this.getPrekey(totalNumber);

    while(propertiesMap.indexOf(fieldKey) >-1) {
      fieldKey = this.getPrekey( ++totalNumber );
    }

    return {
      fieldKey: fieldKey,
      fieldName: ['字段' , totalNumber].join('')
    };
  }

  private onClickAdd =()=> {
    let { propertiesMap, properties } = this.state;
    let newKey: any = this.getNewItemKey();
    let newValue: any = Object.assign({
      'x-index': propertiesMap.length + 2
    } ,utils.copy(Blank.defaultValue))

    propertiesMap.push(newKey.fieldKey);
    properties[newKey.fieldKey] = newValue;

    this.setState({
      properties,
      propertiesMap: propertiesMap.splice(0, propertiesMap.length)
    }, ()=> {
      this.onChange()
    })
  }

  private onRemoveItem (item: string) {
    let { propertiesMap, properties } = this.state;
    let propertiesIndex: number = propertiesMap.indexOf(item);

    propertiesMap.splice(propertiesIndex, 1);
    delete properties[item];

    this.setState({
      properties,
      propertiesMap: propertiesMap.splice(0, propertiesMap.length)
    }, ()=> {
      this.onChange()
    })
    
  }

  private onChangeItem(value: any, index:number) {
    let { propertiesMap, properties } = this.state;
    let changeItem: any = propertiesMap[index];
   
    if ( changeItem ) {
      Object.assign(properties[changeItem], value)

      this.setState({
        properties
      }, () => {
        this.onChange();
      })
    }
  }
  private sortProperties (properties: any , propertiesMap: any[]) {

    propertiesMap.forEach((it: any, index:number)=> {
      properties[it] && (properties[it]['x-index'] = index + 1);
    })

    return properties;
  }
  private onSortEnd =({oldIndex, newIndex})=> {
    let { propertiesMap, properties } = this.state;

    arrayMoveMutable(propertiesMap, oldIndex, newIndex)
    
    this.setState({
      propertiesMap: propertiesMap.splice(0, propertiesMap.length),
      properties: this.sortProperties(properties, propertiesMap)
    }, () => {
      this.onChange();
    })
  }

  public render() {
    let { properties, propertiesMap } = this.state;

    return (
      <div className='former-object-wrapper'>
        <Sortable.SortableContainer onSortEnd={this.onSortEnd} useDragHandle>
          {propertiesMap.map((item: any , index: number) => {
            return (
              <Sortable.SortableItem key={`item-${item}`} index={index}>
                <CloseOutlined onClick={()=> {
                  this.onRemoveItem(item)
                }} />
                <Block 
                  fieldKey={item} 
                  value={properties[item]} 
                  isAllowKey={(key)=> {
                    if (propertiesMap.indexOf(key) > -1) {
                      return false;
                    }
                    return true;
                  }}
                  onChange={(value: any) => {
                    this.onChangeItem(value, index);
                  }}
                ></Block>
              </Sortable.SortableItem>
            )
          })}
        </Sortable.SortableContainer>
        <div 
          className='former-object-left'
          onClick={this.onClickAdd} 
        >
          <PlusCircleFilled />
        </div>
        {propertiesMap.length ==0 ?<div 
          className='former-object-adder'
          onClick={this.onClickAdd}
        >
          <PlusOutlined/> 新增一个字段
        </div>: null}
      </div>
    )
  }

}