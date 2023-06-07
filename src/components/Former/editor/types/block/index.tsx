import React from 'react';
import FieldTitle from '../fieldTitle';
import { utils } from '@blocksx/core';
import * as Types from '../index';

export interface FormerBlockProps {
  fieldKey?: string;
  value?: any;
  onChange?: Function;
  noTitle?: boolean;
  isAllowKey?: Function;
}

export interface FormerBlockState {
  fieldKey?: string;
  fieldName?: string;
  fieldType: string;
  value?: any;
}


export default class FormerBlock extends React.PureComponent<FormerBlockProps, FormerBlockState> {
  public constructor(props: FormerBlockProps) {
    super(props);

    let value: any = props.value;

    this.state = {
      fieldKey: props.fieldKey,
      fieldName: value.name,
      fieldType: value.type,
      value: value
    }

  }

  private onChange(fieldKey:string, fieldName: string) {
    this.setState({
      fieldKey: fieldKey,
      fieldName: fieldName
    })
  }
  private getView(fieldKey?: string) {
    let _fieldKey: string = fieldKey || this.state.fieldType;
    let staticViewType: string[] = ['array', 'object', 'oneOf'];
    if (staticViewType.indexOf(_fieldKey) > -1) {
      return Types[_fieldKey]
    }
    
    return Types.blank;
  }
  public renderView() {
    let View:any = this.getView();

    if (View) {
      return (
        <View 
          fieldKey={this.state.fieldKey}
          value={this.state.value}
        ></View>
      )
    }
    return null;
  }
  public render () {

    return (
      <div className='former-editor-block'>
        {!this.props.noTitle ? <FieldTitle 
          fieldKey={this.state.fieldKey}
          fieldType={this.state.fieldType}
          fieldName={this.state.fieldName}
          onChange={(fieldKey:string, fieldName:string) => {
            this.onChange(fieldKey, fieldName);
          }}
          isAllowKey={this.props.isAllowKey}
          onChangeType={(fieldType: string) => {
            let View:any = this.getView(fieldType);
            this.setState({
              fieldType: fieldType,
              value: utils.copy(View.defaultValue)
            })
          }}
        ></FieldTitle> : null}

        {this.renderView()}
      </div>
    )
  }


}