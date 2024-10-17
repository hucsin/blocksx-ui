import React from 'react';
import { utils } from '@blocksx/core';
import { Tree, Empty, Skeleton, Spin, Button } from 'antd';
import { Icons, SmartRequest, SplitPane, CombineIcon, ContextMenu, PopoverMenu, TablerUtils } from '@blocksx/ui';
import Manger from '../../core/SmartPageManger';
import SmartPageFormer from '../former';


import { getDefaultMenu } from './config/defaultMenu';

import './style.scss';

interface SmartPageTreeProps {
    schema: any;
    namespace?: string;
    pageMeta: any;
    path: string;
    triggerMap: any,
    reflush: any,
    router: any;
    mode: 'treeList' | 'resourceTree';

    treegroup?: any[];
    typeKey: string;

    viewer?: boolean;
    height: number;

    titleKey?: string;
    iconKey?: string;
    description?: string;
}
interface SmartPageTreeState {
    height: number;
    treeData: any;
    loading: boolean;
    fetching: boolean;
    formerType: 'Add' | 'Edit' | 'View',

    valueField: any;
    labelField: any;
    typeField: any;
    iconField: any;
    descriptionField: any;

    treegroup?: any[];

    namespace: string;

    selectKey: string;
    expandedKeys: string[];
    payload: any;
    value: any;
    
}
/**
 * tree 视图
 * 两种试图,
 * 视图1: 左边是tree,右边是表单的场景, default 
 * 视图2: 左边是tree,右边没有任何东西,tree上面带右键菜单
 * 
 * 都是直接查找出字段信息,然后做
 */

export default class SmartPageTree extends React.Component<SmartPageTreeProps, SmartPageTreeState> {

    public static defaultProps = {
        mode: 'treeList',
        viewer: false,
        typeKey: 'type'
    }
    private requestTreeList: any ;
    private requestTreeCreate: any;
    private requestTreeChildren: any;
    private requestTreeDelete: any;
    private rrequestTreeEdit: any;
    private defaultMenu: any = getDefaultMenu()

    public constructor(props: SmartPageTreeProps) {
        super(props);

        let schema: any = props.schema || {};
        
        //this.fields = schema.fileds;

        this.state = {
            height: props.height,
            treegroup: props.treegroup || props.pageMeta.treegroup || [],
            treeData:[],
            loading: false,
            formerType: props.viewer ? 'View' : 'Add',
            valueField:  this.getDefaultFieldByType(schema.fields, 'value') || { fieldKey: 'value'},
            labelField: this.getDefaultFieldByType(schema.fields, 'label') || { fieldKey: 'label'},
            typeField: schema.fields.find(it=>it.fieldKey == 'type'),
            iconField: this.getDefaultFieldByType(schema.fields, 'icon'),
            descriptionField: this.getDefaultFieldByType(schema.fields, 'description'),
            namespace: props.namespace || props.pageMeta.namespace || 'RESOURCE',
            selectKey: '',
            payload: {},
            fetching: false,
            value: null,
            expandedKeys: []
        }

        

        this.requestTreeList = SmartRequest.makeGetRequest(this.props.path + '/tree');
        this.requestTreeCreate = SmartRequest.makePostRequest(this.props.path + '/create');
        this.requestTreeChildren = SmartRequest.makeGetRequest(this.props.path + '/children');
        this.requestTreeDelete = SmartRequest.makePostRequest(this.props.path + '/delete');
        this.rrequestTreeEdit = SmartRequest.makePostRequest(this.props.path +'/update');
    }
    private getDefaultFieldByType(fields: any[], type: string) {
        if (fields) {
            let finder: any = fields.find(it => it.meta && it.meta.place == type);
            if (finder) {
               return  finder
            }
        }
    }

    public UNSAFE_componentWillReceiveProps(newProps: SmartPageTreeProps) {
        if (newProps.height != this.state.height) {
            this.setState({
                height: newProps.height
            })
        }
    }

    public componentDidMount() {
        this.fetchData();

    }

    public cleanAutoGroup(treeList:any, parent?: any) {
        let { treegroup = []} = this.state;
        let typeKey: string = this.props.typeKey || 'type';
        let groupCache: any = {};
        

        return treeList.map(node => {
            let type: any = node[typeKey];
            

            if (node.children)  {
                node.children = this.cleanAutoGroup(node.children, node)
            }

            // 当需要分组的时候,自动分组
            if (treegroup.indexOf(type) > -1) {

                if(!groupCache[type]) {
                    return groupCache[type] = this.mkGroupNode(node, parent)

                } else {
                    groupCache[type].children.push(node);
                    return false;
                }
            }
            return node;
        }).filter(Boolean);
    }

    private mkGroupNode(node: any, parent: any) {
        let {valueField, labelField, typeField ={} } = this.state;
        let typeKey: string = this.props.typeKey || 'type';
        let typevalue: any = node[typeKey];

        let dictList: any = typeField.dict || [];
        let dictObject: any =  dictList.find(it => it.value == node.type) || {};

        return {
            [valueField.fieldKey]: parent ? [parent.value, typevalue].join('_') : typevalue,
            
            [labelField.fieldKey]:dictObject.label,
            parent: parent,
            group: typevalue,
            type: typevalue,
            icon: {
                main: {
                    icon: 'FolderOutlined'
                },
                subscript: node
            },
            children: [
                node
            ]
        }
    }

    public fetchData() {
        this.setState({loading: true})
        this.requestTreeList({}).then((result: any) => {
            let firstNode: any = result[0];
            this.setState({
                treeData: this.cleanAutoGroup(result),
                loading: false,
                selectKey: this.state.selectKey || (firstNode ? firstNode.value : '' ),
                payload: this.state.selectKey ? this.state.payload : firstNode,
                formerType: firstNode ? 'View' : 'Add'
            })
        })
    }

    /**
     * onLoadChildren
     */
    private onLoadChildren = (evt) => {
        
        if (evt.group || evt.children) {
            return Promise.resolve();
        }
        return this.requestTreeChildren({})
    }
    private renderItemIcon = (iconField: any, item: any) => {

        if (item.icon && utils.isPlainObject(item.icon)) {

            return (
                <CombineIcon 
                    main={ TablerUtils.renderIconComponent(item.icon.main)}
                    subscript={this.renderItemIcon(iconField, item.icon.subscript)}
                />
            )

        } else {

            let dict: any = iconField.dict;

            if (dict && dict.length) {
                let fieldKey: string = iconField.fieldKey;
                
                let iconfind: any = dict.find(dic => {
                    if (dic.value == item[fieldKey]) {
                        return true;
                    }
                })

                if (iconfind && iconfind.icon) {
                    return TablerUtils.renderIconComponent(iconfind)
                }
            }
        }
    }
    private renderTreeItem =  (item:any) => {
        let { valueField, labelField, iconField, descriptionField } = this.state;
        
        return (
            <>  
                {iconField && this.renderItemIcon(iconField, item)}
                {item[labelField.fieldKey] || item[valueField.fieldKey]}
                
                {item.group && <span className='ui-total'>{item.children.length}</span>}
                
                <PopoverMenu 
                    menu={this.defaultMenu} 
                   // namespace={this.state.namespace}
                    payload={item} 
                    onMenuClick={this.onMenuClick}
                />
            </>
        )
    }
    
    private onMenuClick = (menu: any, payload: any) => {
        // 系统初始化参数
        
        if (menu.key.indexOf('record.')>-1) {
            switch(menu.type) {
                case 'create':
                    
                    this.setState({
                        value: !payload.group ? 
                                {
                                    parent: {
                                    value: payload.value,
                                    label: payload.label
                                }
                            } 
                            : {
                                parent: payload.parent,
                                type: payload.group
                        },
                        payload: payload,
                        formerType: 'Add'
                    })
                    break;
                case 'edit':
                    this.setState({
                        selectKey: payload.value,
                        payload: payload,
                        value: null,
                        formerType: 'Edit'
                    })
                    break;
                case 'delete':
                    
                    this.setState({
                        fetching: true,
                        selectKey: this.state.selectKey == payload.value ? '': this.state.selectKey
                    }, () => {
                        this.requestTreeDelete({id: payload.id}).then(() => {
                            let treeData: any = this.removeNodeById(payload.id);
                            this.setState({
                                treeData: treeData,
                                selectKey: treeData.length == 0 
                                    ? null 
                                    : this.state.selectKey === payload.value 
                                        ? treeData[0].value : this.state.selectKey,
                                value: null,
                                formerType: treeData.length == 0 ? 'Add': 'View',
                                payload: treeData.length == 0  ? {} : this.state.payload
                            })
                        }).finally(()=> this.setState({fetching: false}))
                    })
                    break;
            }
        } else {
            // TODO
        }
    }
    private renderTree() {

        let { treeData, valueField, labelField } = this.state;

        if (this.state.loading) {

            return (
                <Skeleton active />
            )

        } else {

            if (treeData.length) {
                
                return (
                    <Spin spinning={this.state.fetching}>
                        <ContextMenu
                            menu = {this.defaultMenu}
                            namespace = {this.state.namespace}
                            onMenuClick={this.onMenuClick}
                        />
                        <Tree
                            blockNode
                            fieldNames={
                                {
                                    key: valueField.fieldKey || 'value',
                                    title: labelField.fieldKey
                                }
                            }
                            
                            defaultExpandAll
                            onRightClick={(e)=> {
                                e.event.stopPropagation();
                                ContextMenu.showContextMenu(this.state.namespace, e.event, e.node)
                            }}
                            titleRender={this.renderTreeItem}
                            loadData = {this.onLoadChildren}
                            treeData = {treeData}

                            //expandedKeys={this.state.expandedKeys}
                            selectedKeys= {[this.state.selectKey]}
                            onExpand={(expandedKeys:any)=>{this.setState({expandedKeys: expandedKeys })}}
                            onSelect={(_: any, {node}) => {
                                
                                if (node.value && !node.group) {
                                    this.setState({
                                        selectKey: node.value,
                                        payload: node,
                                        formerType: 'View'
                                    })
                                }
                            }}
                        />
                    </Spin>
                )
            } else {
                return (
                    <Empty/>
                )
            }
        }
    }
    private getDefaultTitle() {
        let {pageType = 'tree record'} = this.props.pageMeta || {};
        let formerType: string = this.state.formerType;


        let icon: string = formerType == 'Add' ? 'FileAddOutlined' : formerType =='Edit' ?  'FormOutlined': 'FileOutlined'
        let IconView: any = Icons[icon];
        return (<>
            <IconView/>
            {this.state.formerType + ' the ' + pageType}
        </>)
    }
    private getDefaultOkText() {
        return this.state.formerType =='Add' ? 'Save' : 'Update'
    }
    private removeNodeById(id:number, menu?: any) {
        let treeNode: any = menu || this.state.treeData ;
        return treeNode.map(node => {
            if (node.id == id) {
                return false
            }
            if (node.children) {
                node.children = this.removeNodeById(id, node.children)
            }
            return node;
        }).filter(Boolean)
    }
    private addNodeByParent(parent: any, value: any, tree?: any) {
        let treeNode: any = tree || this.state.treeData || [];
        let treegroup:any = this.state.treegroup ||[];
        
        if (!parent || !parent.value) {
            return treeNode.push(value) , treeNode;
        }

        return treeNode.map(node => {
            if (node.value == parent.value) {
                if (!node.children) {
                    node.children = [];
                }
                node.isLeaf = false;
                // 需要分组
                if (treegroup.indexOf(value.type) > -1) {
                    if (parent.type == value.type) {

                        node.children.push(value);
                    } else {

                        let groupNode: any = this.mkGroupNode(value, parent);
                        let groupChildren: any = node.children.find(it=> it.value == groupNode.value);
                        
                        if (groupChildren && groupChildren.children) {
                            groupChildren.children.push(value)
                        } else {
                            node.children.push(groupNode);
                        }

                    }
                } else {
                    node.children.push(value);
                }
            } else {
                if (node.children) {
                    node.children = this.addNodeByParent(parent, value, node.children)
                }
            }

            return node;
        })
    }
    private updateNodeById(id: number,value:any, tree?: any) {
        let treeNode: any = tree || this.state.treeData ;
        return treeNode.map(it => {
            if (it.id == id) {
                it = Object.assign(it, value)
            } else {
                if (it.children) {
                    it.children = this.updateNodeById(id, value, it.children)
                }
            }
            return it;
        })
    }
    private onChangeValue = (value: any) => {
        let payload: any  = this.state.payload || {};
        let expandedKeys: any = this.state.expandedKeys;
        this.setState({ fetching: true })
        
        if (this.state.formerType == 'Add') {
            return this.requestTreeCreate(value).then((result) => {
                
                value.id = utils.isArray(result) ? result[0].id : result.id;
                
                value.isLeaf = true;
                payload.value && expandedKeys.push(payload.value);
                this.setState({
                   treeData: this.addNodeByParent(payload, value),
                   fetching: false,
                   expandedKeys,
                   formerType: 'View'
                })
            }).finally(() => this.setState({fetching: false}))
        // edit
        } else {
            return this.rrequestTreeEdit(value).then(()=> {

                this.setState({
                    treeData: this.updateNodeById(payload.id, payload),
                    formerType: 'View'
                })

            }).finally(() => this.setState({fetching: false})) 
        }
    }
    private renderTreeFormer() {

        return (
            <SmartPageFormer 
                //router={this.props.router}
                schema={this.props.schema}
                path={this.props.path}
                pageMeta={this.props.pageMeta}
                formerType={'default'}
                value={this.state.value || this.state.payload}
                viewer={this.state.formerType=='View'}
                title={this.getDefaultTitle()}
                okText={this.getDefaultOkText()}
                onChangeValue={this.onChangeValue}
                onClose={()=>{this.setState({formerType: 'View'})}}
            />
        )
    }
    /**
     * 左边是tree,有边是表单的视图
     */
    private renderTreeList() {
        let {pageType = 'Resource tree'} = this.props.pageMeta || {};
        return (
            <div style={{position:'relative', 'height': '100%'}}>
            <SplitPane minSize={240} size={320}  maxSize={450}>
                <SplitPane.Pane className="smartpage-tree-left smartpage-tree-wrapper">
                    <header>
                        {pageType}
                        <PopoverMenu 
                            menu={this.defaultMenu} 
                          //  namespace={this.state.namespace}
                            payload={{}} 
                            onMenuClick={this.onMenuClick}
                        >
                            <Button size='small' type='default' icon={<Icons.MenuUtilityOutlined/>}></Button>
                        </PopoverMenu>
                    </header>
                    {this.renderTree()}
                </SplitPane.Pane>
                <SplitPane.Pane >
                    
                    <div className="smartpage-tree-content">
                        
                        {this.renderTreeFormer()}
                        
                    </div>
                
                </SplitPane.Pane>
            </SplitPane>
            </div>
        )
    }
    private isTreeListMode() {
        return this.props.mode == 'treeList';
    }
    public render() {
        if (this.isTreeListMode()) {
            return this.renderTreeList();
        }
    }
}

Manger.registoryComponent('tree', SmartPageTree)