/*
 * @Author: wangjian366 wangjian366@pingan.com.cn
 * @Date: 2020-09-24 16:01:27
 * @LastEditors: wangjian366 wangjian366@pingan.com.cn
 * @LastEditTime: 2022-06-22 10:35:47
 * @FilePath: /blocksx/packages/design-components/src/diagram/node.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React from 'react';
import classnames from 'classnames';
import { ClusterOutlined } from '@blocksx/design-components/lib/icons';


interface DiagramNodeProps {
    onClick: any;
    onDoubleClick?: any;
    onContextMenu: any;

    style?: any;
    node?: any;
    type?: string;
    name: string;
    description?: string;
    processMap?: any;
    image?: string; // 图片地址 or base64
    title?: string; // 节点标题
}
interface DiagramNodeState {
    style?: any;
}

export default class DiagramItem extends React.Component<DiagramNodeProps, DiagramNodeState> {
    private node: any;
    public constructor(props: DiagramNodeProps) {
        super(props);
        this.state = {
            style: props.style || {}
        };
    }
    private onDoubleClick =(e:any)=> {
      
      let { processMap = {} } = this.props;

      if (processMap.isSubprocess) {
        if (this.props.onDoubleClick) {
          this.props.onDoubleClick(e, this.node);
        }
      }
    }
    public UNSAFE_componentWillReceiveProps(newProps: any) {
        
        if (newProps.style ) {
            let newStyle = newProps.style;
            let oldStyle = this.state.style;

            if (newStyle.left != oldStyle.left && newStyle.top != oldStyle.top ) {
                this.setState({
                    style: newProps.style
                })
            }
        }
    }
    
    public render() {
        let { processMap = {} } = this.props;

        return (
            <div 
                id={this.props.name}
                title={this.props.name}
                ref ={(ref) => this.node = ref}
                style = {this.state.style}
                className={classnames('design-diagram-node', {
                    [`design-diagram-${this.props.type}`]: this.props.type,
                    [`design-diagram-hasChildren`]: this.props.node && this.props.node.children
                })}

            >
              {processMap.isSubprocess ? <div className="design-diagram-subprocess"><ClusterOutlined/></div> : null}
              <div className="design-diagram-port design-diagram-port-left"></div>
              <div className="design-diagram-port design-diagram-port-top"></div>
              <div className="design-diagram-port design-diagram-port-right"></div>
              <div className="design-diagram-port design-diagram-port-bottom"></div>
              <div
                  onClick={(e) => this.props.onClick(e, this.node)}
                  onDoubleClick={this.onDoubleClick}
                  onContextMenu={(e) => this.props.onContextMenu(e, this.node)}
              >
                  <div className="design-diagram-center">
                      {
                          processMap.icon ? <img src={processMap.icon}/> : this.props.title || processMap.name
                      }
                  </div>
                  <div className="design-diagram-text">{this.props.description || processMap.name || this.props.title }</div>
              </div>
            </div>
        )
    }
}