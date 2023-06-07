import React from 'react';
import Block from './types/block'
import './style.less';

/**
 * former json 编辑组件
 */
export interface EditorProps {
  value: any;
  onChange: Function;
}

export interface EditorState {
  value: any;
}

export default class FormerEditor extends React.PureComponent<EditorProps, EditorState> {
  public constructor(props: EditorProps) {
    super(props);

    this.state = {
      value: props.value
    }
  }
  private onChange =(value: any)=> {
    if (this.props.onChange) {
      this.props.onChange(value)
    }
    this.setState({
      value: value
    })
    
  }
  public render() {
    return (
      <div className='former-editor'>
        <Block 
          noTitle={true}
          value={this.state.value}
          onChange={this.onChange}
        />
      </div>
    );
  }
}