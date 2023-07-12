import React from 'react';
import Leaf from './leaf';
import { Drawer, Modal, Button, Popover, Tabs } from 'antd';
import { EventEmitter } from 'events';
import classnames from 'classnames';

import './style.scss';

export interface FormerProps {
  type?: string;
  value?: any;
  schema: any;
  classifyType?: 'tabs' | 'step' | 'verticalTabs';
  groupType?: 'accordion' | 'more',
  schemaClassifySort?: any;
  defaultClassify: string; // 默认分类
  onChangeValue?: Function;
  //onRelyParams: Function;
  // 获取 依赖的参数
  onGetDependentParameters?: Function;
  onSave?: Function;

  onInit?: Function;

  visible?: boolean;
  id?: any;
  title?: string;
  okText?: string;
  width?: number;
  onClose?: Function;
  keep?: boolean;
  size?: string;

  viewer?: boolean; // 标记视图模式，只展示

  column?: 'one' | 'two' | 'three' | 1 | 2 |  3 // 标记多少列

  children?: any;
}

interface FormerState {
  runtimeValue?: any;
  value: any;
  type?: string;
  schema: any;
  classify?: any;
  classifyValue?: any;
  classifyActiveKey?: string;
  visible?: boolean;
  title?: string;
  okText?: string;
  width?: number;
  id?: any;

  column: any;
  viewer?: boolean; // 标记视图模式，只展示
}
/**
 * 三种模式
 * 1、常规组件模式
 * 2、弹窗模式
 * 3、
 */
export default class Former extends React.Component<FormerProps, FormerState> {
  static defaultProps = {
    defaultClassify: '基础',
    keep: true,
    size: 'small',
    viewer: false,
    column: 'one'
  };
  private timer: any;
  private emitter: EventEmitter;
  private helper: any;

  public constructor(props: FormerProps) {
    super(props);
    this.state = {
      type: props.type || 'default', // default, drawer, modal
      value: props.value,
      schema: props.schema,
      visible: props.visible,
      width: props.width,
      title: props.title,
      okText: props.okText,
      classify: this.splitClassifySchema(props.schema),
      classifyValue: {},
      classifyActiveKey: '0',
      id: props.id,
      viewer: props.viewer,
      column: this.getDefaultColumn(props.column)
    };

    this.timer = null;

    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(1000);

    if (this.props.onInit) {
      this.props.onInit(this);
    }
  }
  public UNSAFE_componentWillReceiveProps(newProps: FormerProps) {
    
    if (newProps.schema != this.state.schema) {
      this.setState({
        schema: newProps.schema,
        classify: this.splitClassifySchema(newProps.schema)
      })
    }
    if (newProps.viewer != this.state.viewer) {
      this.setState({
        viewer: newProps.viewer
      })
    }
    if (newProps.value && newProps.value != this.state.value) {
      this.setState({
        value: newProps.value
      })
    }
    
    if (newProps.visible != this.state.visible) {
      this.setState({
        visible: newProps.visible
      })
    }

    if (newProps.title != this.state.title) {
      this.setState({
        title: newProps.title
      })
    }
    if (newProps.okText != this.state.okText) {
      this.setState({
        okText: newProps.okText
      })
    }
    if (newProps.id != this.state.id) {
      this.setState({
        id: newProps.id
      })
    }
  }
  private getDefaultColumn(column: any) {
    let defaultColumn: any = {
      '1': 'one',
      '2': 'two',
      '3': 'three'
    };

    return defaultColumn[column] || column;
  }
  /**
   * 拆分
   * @param schema 
   */
  private splitClassifySchema(schema: any) {
    let classifyName: string[] = [];
    let { defaultClassify, schemaClassifySort, classifyType } = this.props;
    let cacheName: any = {};

    if (classifyType) {
      let { properties = {} } = schema;

      if (Object.keys(properties).length > 0) {
        for (let prop in properties) {
          let item: any = properties[prop];
          let xclassify = item['x-classify'];

          if (xclassify) {
            if (!cacheName[xclassify]) {
              cacheName[xclassify] = {}
            }
            cacheName[xclassify][prop] = item
          } else {
            if (!cacheName[defaultClassify]) {
              cacheName[defaultClassify] = {}
            }
            cacheName[defaultClassify][prop] = item;
          }
        }
      }

      classifyName = schemaClassifySort || Object.keys(cacheName);

      if (classifyName && classifyName.length > 1) {
        return classifyName.map((it: string) => {
          return {
            type: 'object',
            title: it,
            properties: cacheName[it] || {}
          }
        })
      }
    }
    return false;
  }
  private onChangeValue = (value: any, type?: string) => {
    
    if (!type) {
      if (this.timer) {
        clearInterval(this.timer);
      }

      this.timer = setTimeout(() => {

        this.setState({
          value,
          runtimeValue:value
        });
        if (this.state.type === 'default') {
          if (this.props.onChangeValue) {
            this.props.onChangeValue(value);
          }
        }
      }, 200);
    }
  }
  private onSave = () => {

    let count: number = this.emitter.listenerCount('validation');
    let isBreak: boolean = false;

    if (count > 0) {
      if (this.helper) {
        this.emitter.removeListener('checked', this.helper)
      }

      this.emitter.on('checked', this.helper = (e) => {
        

        if (!e){
          isBreak = true;
        }


        if ( --count <= 0) {
          if (!isBreak) {
            this.doSave();
          }
          this.emitter.removeListener('checked', this.helper)
          this.helper = null;
        }
      });
      this.emitter.emit('validation');

    } else {

      this.doSave();
    }
  }
  private doSave() {

    this.onCloseLayer();
    // 值修改的时候上报
    if (this.props.onChangeValue) {
      this.props.onChangeValue(this.state.value);
    }
    // 在保存的时候直接提交值
    if (this.props.onSave) {
      this.props.onSave(this.state.value);
    }
  }

  private getUniqKey(schema: any) {
    return schema.type + schema.title + this.state.id + schema.name + schema['$$key'];
  }
  private renderClassify() {
    let { classifyType } = this.props;
    let { classify, classifyValue } = this.state;

    switch (classifyType) {
      case 'tabs':
      case 'verticalTabs':
        return (
          <Tabs
            activeKey={this.state.classifyActiveKey}
            onChange={(activeKey: string) => {
              this.setState({
                classifyActiveKey: activeKey
              })
            }}
            tabPosition={classifyType === 'tabs' ? 'top' : 'left'}
          >
            {classify.map((it: any, index: number) => {
              return (
                <Tabs.TabPane tab={it.title} key={index}>
                  <Leaf
                    key={this.getUniqKey(it)}
                    size={this.props.size}
                    runtimeValue={this.state.value}
                    value={classifyValue[index] || {}}
                    {...it}
                    rootEmitter={this.emitter}
                    
                    onChangeValue={this.onChangeValue}
                  ></Leaf>
                </Tabs.TabPane>
              )
            })}
          </Tabs>
        )
    }
  }
  private renderLeaf() {
    let { schema = {}, classify, visible, column } = this.state;


    if (!schema && !visible) {
      return null;
    }
    if (classify) {
      return this.renderClassify();
    }

    return (
      <div className={
        classnames({
          [`former-column-${column}`]: true
        })
      }>
        <Leaf
          key={this.getUniqKey(schema)}
          size={this.props.size}
          runtimeValue={this.state.value || {}}
          value={this.state.value}
          {...this.state.schema}
          rootEmitter={this.emitter}
          onChangeValue={this.onChangeValue}
          onGetDependentParameters={this.props.onGetDependentParameters}
          viewer={this.state.viewer}
          groupType={this.props.groupType}
        ></Leaf>
      </div>
    )
  }

  private renderPopoverLeaf() {
    return (
      <>
        {this.renderLeaf()}
        <div
          style={{
            textAlign: 'right',
            marginTop: '8px'
          }}
        >
          <Button size="small" onClick={this.onCloseLayer} style={{ marginRight: 8 }}>
            取消
          </Button>
          {!this.state.viewer ? <Button size="small" onClick={this.onSave} type="primary">
            {this.state.okText || '确定'}
          </Button>:null}
        </div>
      </>
    )
  }
  private onCloseLayer = () => {
    this.setState({
      visible: true
    });
    this.props.onClose && this.props.onClose();
  }
  public render() {
    switch (this.state.type) {
      case 'popover':
        return (
          <Popover
            title={this.state.title || '编辑数据'}
            content={this.renderPopoverLeaf()}
            placement="bottomRight"
            
            visible={this.state.visible}
            autoAdjustOverflow={true}
            
            onVisibleChange={(visible: boolean) => {
              if (!this.props.keep || visible) {
                this.setState({
                  visible
                })
              }
            }}
            overlayStyle={{
              maxWidth: this.state.width || 450,
              minWidth: this.state.width || 450
            }}
          >{this.props.children}</Popover>
        )
      case 'model':
        return (
          <Modal
            title={this.state.title || '编辑数据'}
            visible={this.state.visible}
            onOk={this.onSave}
            closable={false}
            onCancel={this.onCloseLayer}
            width={this.state.width || 500}
            okText={this.state.okText || '确认'}
            cancelText="取消"
            maskClosable={!this.props.keep}
          >
            {this.renderLeaf()}
          </Modal>
        )
      case 'drawer':
        return (
          <Drawer
            title={this.state.title || '编辑数据'}
            onClose={this.onCloseLayer}
            visible={this.state.visible}
            width={this.state.width || 450}
            maskClosable={!this.props.keep}
            footer={
              <div
                style={{
                  textAlign: 'right',
                }}
              >
                <Button onClick={this.onCloseLayer} style={{ marginRight: 8 }}>
                  取消
                </Button>
                {!this.state.viewer ? <Button onClick={this.onSave} type="primary">
                  {this.state.okText || '确定'}
                </Button> : null}
              </div>
            }
          >
            {this.renderLeaf()}
          </Drawer>
        )
      default:
        return this.renderLeaf();
    }
  }
}