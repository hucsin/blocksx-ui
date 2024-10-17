/*
 * @Author: your name
 * @Date: 2022-03-02 21:14:00
 * @LastEditTime: 2022-07-06 11:08:49
 * @LastEditors: wangjian366 wangjian366@pingan.com.cn
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: /packages/design-components/src/former/types/code/index.tsx
 */
import React from 'react';
import classnames from 'classnames';
import { IFormerBase } from '../../typings';
import { Drawer, Button, message } from "antd";
import MonacoEditor from 'react-monaco-editor';

import { utils } from '@blocksx/core';
import './style.scss';

interface FormerCodeProps extends IFormerBase {
  title: string;
  value: any,
  language: string;
  comment?: any;
  onChangeValue: Function
}
interface FormerCodeState {
  visible: boolean;
  title: string;
  language: string;
  value: any;
}

export default class FormerCode extends React.PureComponent<FormerCodeProps, FormerCodeState> {
  public constructor(props: FormerCodeProps) {
    super(props);
    let _props: any = props['x-type-props'] || {};
    let language: any = props.language || _props.language || 'json';

    this.state = {
      value: this.getDefaultValue(props.value, language) || '',
      visible: false,
      title: props.title || _props.title,
      language: language
    }
  }
  private removeComment(comment:string){
    return comment.replace(/\/\*\*\![\w\W]*?\*\//m, '');
  }
  private getDefaultValue(value: any, language: any) {

    if (language == 'json' && value) {
      try {
        return JSON.stringify(value, null, 2);
      } catch(e) {}
    }
    return value;
  }
  private getComment () {

    let { value } = this.state;
    let comment: string = '';
    
    if (!value || !value.match(/\/\*\*\![\w\W]*?\*\//m)) {
      let _props: any = this.props['x-type-props'] || {};
      // 自动添加注释
      if (_props.comment) {
        if (utils.isArray(_props.comment)) {
          comment = _props.comment.map((it: string) => {
            return ' * ' + it;
          }).join('\n')
        } else {
          comment = [' * ' + _props.comment].join('')
        }
        return '/**!\n' + comment +'\n */\n'; 
      }
    }
    
    return comment;
  }
  private onShowEditor =()=> {
    this.setState({
      visible:true
    })
  }
  private onHideEditor =()=> {
    this.setState({
      visible: false
    })
  }
  private onChangeValue =(value: any)=> {
    this.setState({
      value: value
    })
  }

  private onSaveEditor =()=> {
    
    // json
    if (this.state.language == 'json') {
      try {
        let json: any = JSON.parse(this.removeComment(this.state.value));
        this.props.onChangeValue && this.props.onChangeValue(json);

      } catch(e) {
        message.error('请检查json格式')
      }
      
    // code
    } else {

      this.props.onChangeValue && this.props.onChangeValue(this.removeComment(this.state.value));
    }

    this.setState({
      visible: false
    })
  }

  public render() {
    let clientWidth = utils.getClientWidth();
    let clientHeight = utils.getClientHeight();
    
    let drawerWidth = Math.min(700,Math.max(clientWidth / 1.5, 500))
        
    let className = classnames({
        "former-code": true
    })

    let editorValue: string = this.getComment() + this.state.value;

    return (
        <React.Fragment>
            <div className={className} onClick={this.onShowEditor}>
                <div className="former-code-number"></div>
                <p>{this.removeComment(this.state.value)}</p>
                
            </div>
            <Drawer 
              title={this.state.title || "Editor code"}
              width={drawerWidth}
              className={"former-code-wraper"}
              onClose={this.onHideEditor}
              open={this.state.visible}
              maskClosable={true}
              closable={false}
            >
                <MonacoEditor
                  height={clientHeight - 41}
                  value={editorValue}
                  language={this.state.language || "javascript"}
                  theme="vs-dark"
                  onChange={this.onChangeValue}
                  options={{
                      selectOnLineNumbers: true,
                      minimap: {
                          enabled: false
                      }
                  }}
                ></MonacoEditor>
                <div className="former-code-tool">
                  <Button size="small" onClick={this.onHideEditor} style={{
                      marginRight: 8
                  }}>Cancel</Button>
                  <Button type="primary" size="small" onClick={this.onSaveEditor}>Save</Button>
                </div>
            </Drawer>
        </React.Fragment>
    )
  }
  
}