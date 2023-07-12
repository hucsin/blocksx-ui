/*
 * @Author: your name
 * @Date: 2022-02-28 10:49:35
 * @LastEditTime: 2022-07-12 12:53:43
 * @LastEditors: wangjian366 wangjian366@pingan.com.cn
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: /packages/design-components/src/former/types/more/index.tsx
 */
import React from 'react';
import classnames from 'classnames';
import { IFormerBase } from '../../typings';
import Former from '../../index';
import * as Icons from '../../../Icons';
import './style.scss';


interface FormerMoreProps extends IFormerBase {
    value: any;
    onChangeValue: Function;
    schema: any;
    'x-type-props': any;
}

interface FormerMoreState {
  visible: boolean;
  value: any;
}

export default class FormerMore extends React.PureComponent<FormerMoreProps, FormerMoreState> {

  public constructor (props: FormerMoreProps) {
    super(props);

    this.state = {
      visible: false,
      value: props.value
    }
  }
  private onClose =()=> {
    
    this.setState({
      visible: false
    })
  }
  private onChangeValue =(value)=> {
    this.setState({
      value
    })

    this.props.onChangeValue && this.props.onChangeValue(value);
  }

  private renderIcon(icon) {
    let View: any = Icons[icon];
    return View ? <View/> :null;
  }

  public render () {
    let { icon, text, schema, title = "编辑内容", colspan = 2 }  = this.props['x-type-props'];
    
    return (
      <React.Fragment>

        <Former
           type="drawer" 
           title={title}
           column={colspan}
           width={400}
           visible={this.state.visible}
           onClose={this.onClose} 
           onChangeValue={this.onChangeValue} value={this.state.value} schema={schema} 
        />
      
        <div 
          className='former-more'
          onClick={()=> {
            this.setState({
              visible: true
            })
          }}  
        >
          {icon && this.renderIcon(icon)}
          {text}
      </div>
      </React.Fragment>
    )
  }
}