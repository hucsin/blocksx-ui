/**
 * 表格
 */


import React from 'react';

import { Request } from '@blocksx/swap';
import classnames from 'classnames';
import { IFormerBase } from '../../typings';
import { UnorderedListOutlined, InsertRowBelowOutlined } from '@ant-design/icons';
import { Table, Popover, Drawer, Button, Tooltip } from 'antd';
import Leaf from '../../leaf';

import { utils } from '@blocksx/core';

import './style.scss';

interface IFormerTable extends IFormerBase {
  
  properties: any;
  value: any;
  onChangeValue: Function;
  onGetDependentParameters?: Function;

  // props['x-type-props']
  /*
      mode: 'local' | 'remote'
      pagination: true,
      pageSize: 2,
      pageURI: string,
      addURI: string,
      viewURI: string,
      editURI: string,
      removeURI: string
  */
}
interface IFormerColumn {
  dataIndex: string;
  key: any;
  title: any;
  width?: number;
  fixed?: string;
  render?: Function;
  ellipsis?: boolean;
}
export default class FormerTable extends React.Component<IFormerTable, {
  isAdd: boolean,
  value: any,
  columns: any,
  visible: boolean,
  record: any,
  recordIndex?: number,
  props: any;
  pagination?: boolean;
  relyOnParams?: any;
  remoteMode: boolean;
  currentPage: number;
  pageSize: number;
  totalNumber?  : number;
  loading?: boolean;

  dataSource?: any[]
}> {
  public constructor(props: IFormerTable) {
    super(props);

    let _props: any = props['x-type-props'] || {};
    let _value: any = props.value || [];
    let remoteMode: boolean = _props['mode'] === 'remote';

    this.state = {
      remoteMode: remoteMode,
      value: _value,
      columns: this.getColumns(),
      visible: false,
      record: {},
      recordIndex: 0,
      isAdd: false,
      props: _props,
      loading: false,
      // 标记是否有分页控件
      pagination: _props.pagination,
      dataSource: [],
      pageSize: this.getDefaultPageSize(_props, remoteMode, _value.length),//_props['pageSize'] || 10,
      currentPage: 1,
      totalNumber: remoteMode ? 0 :  _value.length
    };
  }
  public componentDidMount() {
    this.resetDataSource(1);
  }

  

  public componentWillReceiveProps(newProps: any) {
    //if (newProps.value != this.state.value) {
    this.setState({
      value: newProps.value
    })
    //}
  }
  private resetDataSource(page?: number) {
    let { remoteMode, value, currentPage, pageSize } = this.state;
    if ( remoteMode ) {
      this.resetRemoteDataSource(page || currentPage)
    } else {
      // 本地模式
      let begin: number = (currentPage - 1) * pageSize;
      this.setState({
        dataSource: value.slice(begin, begin + pageSize )
      })
    }
  }
  private resetRemoteDataSource(page?: number) {
    let { pageURI } = this.state.props;
    let { currentPage, pageSize } = this.state;

    this.setState({
      loading: true
    });

    Request.auto(pageURI, {
      pageNumber: page || currentPage,
      pageSize: pageSize,
      $where: this.getRelyOnParams()
    }).then((result: any) => {
      let { data, total} = result;
      this.setState({
        dataSource: data,
        loading: false,
        totalNumber: total
      })
    })
  }

  private remoteAddOrUpdate(data:any, isAdd:boolean) {
    let { addURI, editURI } = this.state.props;
    let RequestURI: string = isAdd ? addURI : editURI;

    this.setState({
      loading: true
    });
    
    if (isAdd) {
      delete data.id;
    }

    Request.auto(
      RequestURI,
      data
    ).then(()=> {
      this.resetRemoteDataSource();
      this.onClose();
    })
  }

  private getDefaultPageSize(props:any, remoteMode: boolean, valueLength:number) {
    
    if (remoteMode || props.pagination) {
      return props['pageSize'] || 10;
    }
    
    return valueLength;
  }
  private getRelyOnParams () {
    let { params = {} } = this.state.props;

    if(this.props.onGetDependentParameters) {
      Object.assign(params, this.props.onGetDependentParameters(this.props) || {})
    }
    return params;
  }
  private getValue() {

    let value = this.state.value || [];
    value = value.slice(0, value.length);

    return value;
  }

  private canShow(it: any, columns: any[]) {
    // 当列数小于2的时候，强制显示
    if (columns.length <= 2) {
      return true;
    }

    return it['x-column'];
  }
  private getColumns() {
    let columns: IFormerColumn[] = [];
    let properties = this.props.properties;

    for (let prop in properties) {
      columns.push(Object.assign({
        key: prop
      }, properties[prop]));
    }
    // 排序重组
    columns = columns.sort((a: any, b: any) => {
      return a['x-index'] > b['x-index'] ? 1 : -1;
    }).filter((it:any) => {
      return this.canShow(it, columns)
    }).map((it: any, index: number) => {

      let props = it['x-type-props'] || {}

      return {
        title: it.title,
        key: index,
        dataIndex: it.key,
        width: it.width,
        ellipsis: true,
        render: (text: any, record: any, index: number) => {

          if (props.dataSource && !utils.isUndefined(text)) {
            text = props.dataSource.find((it: any) => it.value === text);
            return text.label;
          } else {
            if (it.type == 'boolean') {
              text = text ? '是' : '否'
            }
          }

          return text;
        }
      }
    });

    columns.push({
      title: (<Tooltip overlay="新增一行">
        <InsertRowBelowOutlined className="former-table-add" onClick={this.onTableAddClick} title="点击添加一行" />
      </Tooltip>),
      dataIndex: '',
      key: 'la',
      width: 20,
      fixed: 'right',
      render: (_: any, record: any, index: number) => {

        return (
          <div className="former-table-tool">
            <Popover
              overlayStyle={{
                zIndex: 10
              }}
              arrowPointAtCenter
              placement="bottomRight"
              content={<ul className="former-table-menu">
                <li onClick={() => this.onEditRow(record, index)}>编辑</li>
                <li onClick={() => this.onCopyRow(record, index)}>复制行</li>
                {!this.state.remoteMode ? <React.Fragment>
                  <li onClick={() => this.addRowValue(index)}>前面加一行</li>
                  <li onClick={() => this.addRowValue(index + 1)}>后面加一行</li>
                </React.Fragment>:null}
                <li onClick={() => this.removeRow(index)}><span color="red">删除</span></li>
              </ul>}
            >
              <UnorderedListOutlined />
            </Popover>
          </div>
        )
      }
    });


    return columns;
  }

  private onEditRow(record: any, index: number) {

    this.setState({
      record: utils.copy(record),
      recordIndex: index,
      visible: true
    })
  }
  private onCopyRow(record: any, index: number) {
    let newCopy = utils.copy(record);
    // 删除ID
    delete newCopy.id;

    this.addRowValue(index, newCopy)
  }
  private removeRow(index: number) {

    let value = this.getValue();
    value.splice(index, 1);
    this.props.onChangeValue(value);
  }
  private addRowValue(pos?: number, val?: any) {
    //let value = this.getValue();

    this.setState({
      isAdd: true,
      record: val || {},
      recordIndex: pos,
      visible: true
    })
  }
  private onTableAddClick = () => {
    this.addRowValue();
  }
  private onTableClick = () => {
    let value = this.state.value;
    if (!value || value.length < 1) {
      this.addRowValue();
    }
  }
  private onClose = () => {
    this.setState({
      visible: false,
      isAdd: false
    })
  }

  private onSaveRow = () => {
    let value = this.getValue();
    let { recordIndex, record, isAdd, remoteMode } = this.state;

    // 远程模式下面需要
    if ( remoteMode ) {
      this.remoteAddOrUpdate(record, isAdd)

    } else {
      // 新增
      if (isAdd) {
        if (utils.isUndefined(recordIndex)) {
          value.push(record)
        } else {
          value.splice(recordIndex as number, 0, record);
        }

      } else {
        if (recordIndex || recordIndex === 0) {
          value[recordIndex] = record;
        }
      }

      this.props.onChangeValue(value);
      this.onClose();
    }

  }
  private onChangeValue = (value: any, type: string) => {

    if (!type) {
      this.setState({
        record: value
      });
    }
  }
  private onPageChange(page: number) {

    this.setState({
      currentPage: page
    }, ()=>{
      this.resetDataSource();
    })
  }
  private getPaginationConfig(): any {
    let { pagination, totalNumber, pageSize, currentPage } = this.state;

    if ( false === pagination) {
      return false;
    }

    return {
      size: 'small',
      total: totalNumber,
      pageSize: pageSize,
      current: currentPage,
      onChange: (page: number) => {
        this.onPageChange(page)
      }
    }
  }

  private getDataSource() {
    return this.state.dataSource
  }
  public render() {
    return (
      <div className="former-table" >

        <div onClick={this.onTableClick}>
          <Table
            tableLayout="fixed"
            scroll={{ x: true }}
            pagination={this.getPaginationConfig()}
            rowKey={record => record.key}
            dataSource={this.getDataSource()}
            columns={this.state.columns}
            loading={this.state.loading}
            size="small"
            locale={{
              emptyText: '请点击添加数据行'
            }}
            onRow={(record, index: number) => {
              return {
                onDoubleClick: () => {
                  this.onEditRow(record, index)
                }
              }
            }}
          />
        </div>
        <Drawer
          title={this.state.isAdd ? '新增行数据' : '编辑行数据'}
          visible={this.state.visible}
          onClose={this.onClose}
          footer={
            <div
              style={{
                textAlign: 'right',
              }}
            >
              <Button onClick={this.onClose} style={{ marginRight: 8 }}>
                取消
              </Button>
              <Button onClick={this.onSaveRow} type="primary">
                {this.state.isAdd ? '新增' : '更新'}
              </Button>
            </div>
          }

        >
          
          <Leaf
            path="root"
            defaultValue={{}}
            value={this.state.record}
            onChangeValue={this.onChangeValue}
            type = "object"
            properties= {this.props.properties}
            
          />
        </Drawer>
      </div>
    )
  }
}