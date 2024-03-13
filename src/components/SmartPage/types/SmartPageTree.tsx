import React from 'react';
import { Tree, Empty, Skeleton } from 'antd';
import SmartRequst from '../../utils/SmartRequest';
import SplitPane from '../../SplitPane';
import SmartPageFormer from './SmartPageFormer';

import './SmartPageTree.scss'

interface SmartPageTreeProps {
    schema: any;
    pageMeta: any;
    path: string;
    triggerMap: any,
    reflush: any,
    router: any;
    mode: 'treeList' | 'resourceTree';

    viewer?: boolean;
    height: number;
}
interface SmartPageTreeState {
    height: number;
    treeData: any;
    loading: boolean;
    formerType: 'Add' | 'Edit' | 'View'
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
        viewer: false
    }
    private requestTreeList: any ;
    private requestTreeCreate: any;

    public constructor(props: SmartPageTreeProps) {
        super(props);

        let schema: any = props.schema || {};
        
        //this.fields = schema.fileds;

        this.state = {
            height: props.height,
            treeData:[],
            loading: false,
            formerType: props.viewer ? 'View' : 'Add'
        }

        this.requestTreeList = SmartRequst.createPOST(this.props.path + '/tree');
        this.requestTreeCreate = SmartRequst.createPOST(this.props.path + '/create', true);

    }


    public UNSAFE_componentWillUpdate(newProps: SmartPageTreeProps) {
        if (newProps.height != this.state.height) {
            this.setState({
                height: newProps.height
            })
        }
    }

    public componentDidMount() {
        this.fetchData();

    }

    public fetchData() {
        this.setState({loading: true})
        this.requestTreeList({}).then((result: any) => {
            this.setState({
                treeData: result,
                loading: false
            })
        })
    }

    /**
     * onLoadChildren
     */
    private onLoadChildren = (evt) => {
        console.log(evt ,'loading')
    }

    private renderTree() {

        if (this.state.loading) {

            return (
                <Skeleton active />
            )

        } else {

            if (this.state.treeData.length) {
                return (
                    <Tree
                        onLoad = {this.onLoadChildren}
                        treeData = {this.state.treeData}
                    />
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

        return `${this.state.formerType} the ${pageType}`
    }
    private getDefaultOkText() {
        return this.state.formerType =='Add' ? 'Save' : 'Update'
    }
    private onChangeValue = (value: any) => {
        console.log(value)
        return this.requestTreeCreate(value).then(() => {

        })
    }
    private renderTreeFormer() {

        return (
            <SmartPageFormer 
                router={this.props.router}
                schema={this.props.schema}
                path={this.props.path}
                pageMeta={this.props.pageMeta}
                mode={''}
                value={{}}
                viewer={this.state.formerType=='View'}
                title={this.getDefaultTitle()}
                okText={this.getDefaultOkText()}
                onChangeValue={this.onChangeValue}
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
                <SplitPane.Pane className="smartpage-tree-left">
                    <header>{pageType}</header>
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