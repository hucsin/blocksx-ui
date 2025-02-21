/*
 * @Descripttion: 
 * @Version: 1.0.0
 * @Author: uoeye
 * @Date: 2020-12-12 10:56:47
 */
import { IFormerControl, IFormerValidation } from '../Former/typings'
import { SearchBarProps } from '../SearchBar';
/**
 * 功能检索条件定义
 */
export interface SearcherWhereKey {
  // 匹配  | 不匹配 | 包含 | 不包含 | 区间
  type: 'match' | 'unmatch' | 'include' | 'exclusive' | 'range';
  value?: any[] | any;
}
export interface SearcherWhere {
  [prop: string]: SearcherWhereKey
}
export interface RowOperate {
  control?: any;
  batch?: boolean | 'only'; // 是否支持批量, true | 'only'
  type: string; // edit/ view/ monont
  key: string; // 标识
  name: string; // 删除
  place?: string;
  disabled?: boolean;
  router?: string;
  motion?: Function;
  //operate?: Function;
  confirm?: string;// 是否确认

  searcher?: boolean; // 在batch模式下面，参数是否获取当前的检索条件的
  
  danger?: boolean;
  message?: string;
  control?: RowOperateControl | RowOperateControl[],
  align?: number;// 队列位置
  data?: any; // 操作数据
  
  page?: string; // page 模式下面的pageid
  remote?: any; // remote 模式下的remote对象
}

export interface RowOperateControl {
  type: 'auth' | 'rowValue' | 'state'; // auth, rowValue,两种类型，默认是rowValue
  key: string;
  value?: any[] | SearcherWhere | any
}

export interface LabelValue {
  label: any;
  value: any;
}

export interface TablerColumn {
  group?: string; // 分组列表
  editable?: boolean; // 是否可编辑，在表格行编辑的时候
  filter?: boolean; // 是否启用列过滤器
  width?: number,
  type?: string; // 列表展示组件

  state?: 'square' | 'origin', // 列表值状态，
  color?: Function | string[] | object;
}

export interface TablerField {
  key: string;
  name: string;
  uiType?: string;
  group?: string; // 分组信息

  tabler?: boolean | TablerFields | TablerProps; // 是否在表格里面显示

  tablerColumn?: TablerColumn;

  /*
  tablerColumnGroup?: string; // 列分组 只支持两级分组
  
  tablerColumnEditable?: boolean; // 是否可编辑
  tablerColumnColor?: Function | string[] | object; // 列的颜色配置 
  tablerColumnFilter?: boolean; // 列筛选
  tablerColumnState ?: 'square' | 'origin', // 列表值状态，
  tablerColumnWidth?: number; // 列宽
  tablerColumnType?: string; // 表格列暂时组件 process, */

  type: string; // 组件类型，input，select，tabler
  defaultValue?: any; // 默认值
  props?: any, // 组件的props
  dict?: LabelValue[] | Function, // 词典

  validation?: IFormerValidation;
  control?: IFormerControl
}
// 描述字段项的值
export interface TablerFields extends Array<any> {
  [index: number]: TablerField
}

/**
 * 如何区分本地模式和异步模式
 * 
 * datasource为数组的时候，标识为本地模式
 * datasource为函数的时候有如下几种情况
 *      1、存在 operate 的时候为异步分页
 *      2、不存在operate 但是datasource返回数据为非数组，为异步分页
 */
export interface TablerProps {
  
  type: 'table' | 'list';
  // 组件
  components?: {},
  rowKey: string; // 行关键key,默认是id
  formerSchema?: {
    [key: string]: any
  };
  
  formerType: string;
  formerColumn?: string;
  
  // 新增操作控制
  increase?: {
    [index: number]: {
      name: string;
      type: string;
      defaultValue: {
        [prop: string]: any
      }
    },
    forEach: Function
  };
  // 操作外引入,一旦引入operate就不是本地表格，就是外部表格了，
  operate?: {
    [operate: string]: Function
  },
  // 行操作配置
  rowOperate?: RowOperate[];
  rowSelection?: boolean;// 是否启用行选择，不支持单选，单选的话直接用操作按钮来实现

  multilineEdit?: boolean; // 单行编辑模式

  auth?: {
    view?: boolean; // 是否展示视图
    add?: boolean;
    edit?: boolean; // 是否可以编辑
    remove?: boolean;  // 是否可以新增
  };

  size?: 'small' | 'middle' | 'large' | undefined;
  searchSize?: any;
  fields: TablerFields;

  // 当传入未function 的时候有两种情况，第一种是函数返回数据，第二钟是函数返回promise对象
  dataSource: Function | any[];

  currentPage?: number;
  pagination?: boolean; // 是否开启分页， 不传入就自动，在本地模式的时候为不需要分页，在异步模式的时候为需要分页
  pageSize?: number; // 每页多少条，默认20
  resizeMaxColumns: number; // 启用拖动的最大列，默认为7列，
  // 检索区域配置
  searcher: SearchBarProps

  createText?: string;


  onEdit?: Function; // 编辑的时候
  onAdd?: Function; // 新增的时候
  onRemove?: Function; // 删除的时候
  onRowAction?: Function;// 单行操作
  onView?: Function;// 编辑的时候获取详细数据

  reflush?: any;

  onGetRequestParams?: Function;
  onResetDataSource?: Function;
  onChangePage?: Function;

  getDataSource?: Function;
  
  renderSearcher?: Function;
  renderOperater?: Function;
  
  noOperater?: boolean;
  noSearcher?: boolean;

  renderRowOperater?: Function;


  smartRequestMap?: any;

  searchRef?: any;
  toolbarRef?: any;
}