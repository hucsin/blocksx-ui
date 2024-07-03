import React from 'react';
import classnames from 'classnames';
import './style.scss';
import { FetchMap } from '../typing';
import NodeConfigure from '../NodeConfigure';
import { DomUtils, FormerTypes, ContextMenu, Icons, SmartPage, PluginManager } from '@blocksx/ui';

import i18n from '@blocksx/i18n';
import { PlusOutlined } from '@ant-design/icons';
import { omit } from 'lodash';



interface IMircoFlowNode {
    name: string;
    id?: number;
    bytethinkingId?: number;
    type: string;
    left: number;
    top: number;
    color: string;
    icon?: string;
    props: any;
    isNew?: boolean;
    fetchMap: FetchMap;
    mircoFlow:any;
    isViewer?: boolean;

    onUpdateNode?: Function;
    onAddNodeChildren?: Function;
    onAddTriggerNode?: Function;
    
    getFormerSchema(type: string):any;
    onChangeProps(value: any):any;

}

interface SMircoFlowNode {
    left: number;
    top: number;
    color: string;
    type: string;
    isNew?: boolean;
    props: any;
    cacheProps: any;
    openSetting: boolean;
    hasChanged: boolean;
    settingMode?: string
}

export default class MircoFlowNode extends React.Component<IMircoFlowNode, SMircoFlowNode> {
    
    private defaultColor: string = '#cccccc';
    private mircoFlow: any;
    
    private getContextMenuMap: any = (type: string, state: any) => {
        let noDelete: boolean = type == 'router';
        let isTrigger: boolean = type == 'go';
        
        return [
            {
                name: i18n.t('Configuration'),
                type: 'configuration',
                icon: 'ConfigurationUtilityOutlined'
            },
            'empty'!=type && {
                name: i18n.t('Setting'),
                type: 'setting',
                icon: 'SettingUtilityOutlined'
            },
            {
                type: 'divider'
            },
            {
                name: i18n.t('Add a module'),
                type: 'add',
                icon: 'PlusOutlined'
            },
            /*{
                name: i18n.t('Clone the {name}', { name: type =='go' ? 'trigger' : 'module' }),
                type: 'clone',
                icon: 'CopyOutlined'
            },*/
            !isTrigger ? false : {
                type: 'divider'
            },
            
            !isTrigger ? false : {
                name: i18n.t('Add a trigger'),
                type: 'addTrigger',
                icon: 'PlusOutlined'
            },
            /*
            noDelete ? false : {
                type: 'divider'
            },*/
            noDelete ? false : {
                name: i18n.t('Delete {name}', { name: type == 'go' ? 'trigger' : 'module'}),
                type: 'delete',
                icon: 'DeleteOutlined',
                danger: {
                    errTips: i18n.t('Quietly delete the last start node, keep at least one start node'),
                    condition:(_, nodeName: string) => {
                        let starts:any = state.miniFlow.getStartNodes();
                        let nodeInfo: any = state.miniFlow.getNodeByName(nodeName);
                        let targets: any = state.miniFlow.getConnectorBySourceName(nodeName);

                        return targets.length == 0 ? true : nodeInfo.type != 'go' || (!starts || starts.length > 1);
                    }
                }
                
            }
        ].filter(Boolean);
    }
    public constructor(props: IMircoFlowNode) {
        super(props);

        let cprops: any = props.props || {};

        this.state = {
            left: props.left,
            top: props.top,
            color: props.color,
            type: props.type,
            isNew: props.isNew,
            props: cprops,
            cacheProps: JSON.stringify(cprops),
            openSetting: false,
            hasChanged: false
        };

        this.mircoFlow = props.mircoFlow;
    }

    public componentWillUpdate(newProps: IMircoFlowNode) {
        
        if (newProps.left != this.state.left) {
            this.setState({
                left: newProps.left
            })
        }  

        if (newProps.top != this.state.top) {
            this.setState({
                top: newProps.top
            })
        }

        if (newProps.color != this.state.color) {
            this.setState({
                color: newProps.color
            })
        }
        if (newProps.type != this.state.type) {
            this.setState({
                type: newProps.type
            })
        }
        if (newProps.isNew != this.state.isNew) {
            this.setState({
                isNew: newProps.isNew
            })
        }
        if (newProps.props) {
            let props: any = JSON.stringify(newProps.props);
            if (props != this.state.cacheProps) {
                this.setState({
                    props: newProps.props,
                    cacheProps: props
                })
            }
        }
    } 
    
    private getColor() {
        let color: string = this.state.color;
        
        return color || this.defaultColor;

    }
    private getIcon() {
        let { props ={} } = this.state;
        let subicon: string ;

        if (this.state.type == 'empty') {
            return ['PlusOutlined']
        } 
        if (this.state.type =='router') {
            return ['RouterUtilityOutlined'];
        }

        if (props.icon) {
            if (typeof props.icon =='string') {
                subicon = props.icon;
            } else {
                subicon =  props.icon.icon;
            }
            return [this.props.icon, subicon]
        }
        
        return [this.props.icon];
    }
    private addRouterChildren =(event?: any)=> {
        this.props.onAddNodeChildren 
            && this.props.onAddNodeChildren(this.props.name);

        this.consume(event)
    }
    private addTiggerNode = (event?: any)=> {
        this.props.onAddTriggerNode 
            && this.props.onAddTriggerNode(this.props.name);
            
        this.consume(event)
    }
    private consume(event?: any) {
        event && DomUtils.consume(event);
    }
    public renderDefaultNodeContent(icon: any, color: string) {
        let { props = {}} = this.state;
        return (
            <>
                <FormerTypes.avatar size={100}  icon={icon} color={color}/>
                {!this.props.isViewer &&<div className='ui-adder'  onClick={this.addRouterChildren}><PlusOutlined/></div>}
                {!this.props.isViewer && this.state.type == 'go' && <div className='ui-adder-router' onClick={this.addTiggerNode}><PlusOutlined/></div>}
                {props.description &&<div className='ui-title'>{props.description }</div>}
            </>
        )
    }
    public renderNodeContent(icon: string, color: string) {
        
        let defaultProps: any = this.props.props || {};
        
        switch (this.state.type) {
            case 'empty':
                return (
                    
                    <NodeConfigure 
                        open={this.state.openSetting}
                        onOpenChange={(v)=> this.setState({openSetting: v})}

                        onFetchRecoFilter={(parmas)=>{
                        
                            return this.props.fetchMap['programs']({...parmas}, 'notrigger')
                        }}
                        onClassifyClick={(row) => {
                            this.props.onUpdateNode && this.props.onUpdateNode(this.props.name, row);
                            //this.props.onAddNewNode(row, this.newRef.getBoundingClientRect())
                        }}
                    >
                       {this.renderDefaultNodeContent(icon, color)}
                    </NodeConfigure>
                )
            case 'router':
            case 'go':
            default:

                return (
                    <SmartPage
                        pageURI='/api/thinking/findPage'
                        id={[this.state.settingMode, defaultProps.componentName || 'router'].join('__')}
                        name={defaultProps.componentName || 'router'}
                        type="popover"
                        isViewer={this.props.isViewer}
                        simplicity
                        params={()=> {
                            return {
                                id: this.props.bytethinkingId,
                                nodeId: this.props.id,
                                mode: this.state.settingMode,
                                type: defaultProps.componentName ? 'module' : 'router'
                            }
                        }}
                        icon="SettingOutlined"
                        value={this.state.props || {}}
                        onChangeValue={(props)=> {
                            
                           // let pickvalue: any = pick(this.state.props, ['icon', 'color'])
                            //console.log(pickvalue, props, 222, this.state.props)
                            this.setState({
                                props: props,
                                hasChanged: true
                            })
                        }} 
                        noToolbar
                        open={this.state.openSetting}
                        onShow={()=>this.setState({openSetting: true})}
                        onClose={()=> this.onCloseLayer()}
                    >
                        {this.renderDefaultNodeContent(icon, color)}
                    </SmartPage>
                )
        }
        
    }
    private onCloseLayer() {
        if (this.state.hasChanged) {
            this.props.onUpdateNode && this.props.onUpdateNode(this.props.name, this.state.props, this)
        }

        this.setState({openSetting: false,hasChanged: false})
    }
    public getContextMenu(): any {

        return this.getContextMenuMap(this.state.type, this.mircoFlow);
    }

    public onContextMenu = (event)=> {
        
        ContextMenu.showContextMenu(this.props.name, event, {})
    }
    public onMenuClick =(item: any)=> {
        switch(item.type) {
            case 'setting':
                this.setState({openSetting: true, settingMode: 'setting'})
                break;
            case 'configuration':
                this.setState({openSetting: true, settingMode: 'configuration'})
                break;
            case 'add':
                this.addRouterChildren()
                break;
            case 'delete':
                this.mircoFlow.miniFlow.deleteNodeByName(this.props.name)
                break;
        }
    }
    public render () {
        
        let color: string = this.getColor();
        let icon: any = this.getIcon();

        // 
        return (
            <div 
                className={classnames({
                    'node-new': this.state.isNew,
                    'ui-mircoflow-node': true,
                    [`ui-mircoflow-type-${this.state.type}`] : this.state.type
                })} 
                id={this.props.name}
                style={{
                    '--color': color ,
                    '--hover-color': color + '66',
                    left: this.state.left,
                    top: this.state.top
                } as any}
                onContextMenu={this.onContextMenu}
            >
                {!this.props.isViewer &&<ContextMenu 
                    namespace={this.props.name} 
                    onMenuClick={this.onMenuClick} 
                   // type ={this.state.type} 
                    menu={this.getContextMenu()}
                />}
                {this.renderNodeContent(icon[0], color)} 
                {icon[1] && this.renderNodeSubIcon(icon[1])}
            </div>
        )
    }
    private renderNodeSubIcon(icon?: string) {
        let { props ={} } = this.state;

        let Iconview: any = Icons[icon || props.subicon];
        
        if (Iconview) {
            
            return <Iconview style={{backgroundColor: props.color}}/>
        }
        return null;
    }
}