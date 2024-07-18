/*
 * @Author: your name
 * @Date: 2020-09-01 21:39:28
 * @LastEditTime: 2021-10-26 09:30:51
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /designer/Users/iceet/work/hucsin/blocksx/packages/design-components/src/former/types/input/index.tsx
 */
import React from 'react';
import classnames from 'classnames';
import { IFormerBase } from '../../typings';
import TablerUtils from '../../../utils/tool';
import SmartRequest from '../../../utils/SmartRequest';
import Drawer from './drawer';
import { Button, Popover, Space, List, Spin } from 'antd';
import * as Icons from '../../../Icons';
import Avatar from '../avatar';
import SmartAction from '../../../utils/SmartAction';
import { pick } from 'lodash';

import './style.scss';

interface IFormerInput extends IFormerBase {
    value: any,
    props: any;
    fieldName?:string;
    size: any,
    disabled?: boolean,
    former?: any;
    onChangeValue: Function
}

interface FormerInputState {
    value: any,
    values: any;
    open: boolean,
    props: any;
    title: string;
    description: string;
    color: string;
    icon: string;
    subtitle?: string;
    emptyNotice: string;
    loading?: boolean;
    
}

export default class FormerButton extends React.Component<IFormerInput,  FormerInputState> {
    public static Viewer:any = FormerButton;
    private actionRequestHelper: any;
    private viewRequestHelper;
    public constructor(props: IFormerInput) {
        super(props);
        let typeProps: any = props['x-type-props'];
        
        this.state = {
            title: typeProps.title || typeProps.name,
            values: [],
            description: typeProps.description,
            emptyNotice: typeProps.emptyNotice,
            icon: typeProps.icon,
            color: typeProps.color,
            value: props.value,
            open: false,
            loading: false,
            props: props['x-type-props']
        };

        console.log(3333)

        if (typeProps.actionURI) {
            this.actionRequestHelper = SmartRequest.createPOST(typeProps.actionURI)
        }

        if (typeProps.viewURI) {
            this.viewRequestHelper = SmartRequest.createPOST(typeProps.viewURI)
        }
    }
    private getCacheKey() {
        return ['view', this.props.fieldName].join('.')
    }
    private refreshCache(value:any) {
        
        let former: any = this.props.former;
        former.refreshCache(this.getCacheKey(), {
            value: value,
            ...value
        });
    }

    public componentDidMount(): void {
        let { props } = this.state;
        if (props.type == 'meta') {
            if (this.viewRequestHelper) {
                let { props } = this.state;
                let { rowKey = 'id' } = props;
                let former: any = this.props.former;

                let cache: any = former.getCache(this.getCacheKey());
                
                if (cache) {

                    //this.onSelectedItem(cache.value);
                    this.setState({
                        value: cache.value[rowKey],
                        ...cache.value,
                        values: cache.values
                    })

                } else {

                    this.updateView(this.state.value)
                }
            } else {
                // 从former 获取value
                let { former } = this.props;

                if (former && this.state.value) {
                    this.setState({
                        ...former.getValue(),
                        value: this.state.value
                    })
                }
            }
        }
    }
    private updateView(value: string) {
        let former: any = this.props.former;

        former.loading(true);
        this.viewRequestHelper(this.getDefaultParams({
            actionType: 'init',
            value: value
        })).then(({current, values = []}: any) => {

            if (Array.isArray(values)) {
                // 只有一条的时候绑定
                if (!current && (values.length == 1)) {
                    current = values[0]
                } else {
                    this.setState({
                        values: values
                    })
                }
            }

            former.setCache(this.getCacheKey(), {
                value: current,
                values
            })
            former.loading(false);

            this.onSelectedItem(current)
        }).catch(()=> {
            former.loading(false);
        })
    }
    public UNSAFE_componentWillReceiveProps(newProps: any) {
        if (newProps.value != this.state.value) {
            this.setState({
                value: newProps.value
            })
        }
    }
    
    private renderIcon() {
        let { props = {} } = this.props;

        return TablerUtils.renderIconComponent(props);
    }

    private renderButton() {
        let { props = {} } = this.props;
        return (
            <Button type='link' icon={this.renderIcon()} onClick={()=> {this.setState({open: true})}} size="small" >{props.text}</Button>
        )
    }

    // link ,router, smartpage


    public renderDefaultButton() {
        let { props = {} } = this.props;
        
        if (props.type == 'smartpage') {
            return (
                <>
                    <Drawer onClose={()=>{this.setState({open: false})}} meta={props} record={this.props['recordValue']}  open={this.state.open} />
                    {this.renderButton()}
                </>
            )
        }

        return this.renderButton();
    }

    private renderAvatar() {
        let { props = {} } = this.props;
        let hasValue: boolean = !!this.state.value;
        let connectAvatarColor = props.connectAvatarColor || '#4d53e8'

        if (props.avatarType == 'connect') {
            return (
                <Space size="small">
                    <Avatar size={48} icon={props.connectAvatar} color={hasValue ?connectAvatarColor: '#ccc'}/>
                    {hasValue ? <Icons.ConnectionsDirectivityOutlined/>:<Icons.UnlinkUtilityOutlined/> }
                    <Avatar size={48} icon={this.state.icon} color={hasValue ? props.color : '#ccc'}/>
                </Space>
            )
        }

        return <Avatar size={64} icon={this.state.icon}/>;
    }
    private getDefaultParams(params: any = {}) {
        let { former } = this.props;
        let { props } = this.state;

        if (former.props.onGetDependentParameters) {
            Object.assign(params, former.props.onGetDependentParameters())
        }

        if (Array.isArray(props.paramsKeys)) {
            Object.assign(params, pick(props,props.paramsKeys))
        }
        
        return params;
    }
    private doMetaAction(data: any = {}) {

        let params: any =  this.getDefaultParams(data)

        if (this.actionRequestHelper) {
            this.loading(true)
            this.actionRequestHelper({
                ...params,
                actionType: 'new'
            }).then((data) => {

                if (data.smartaction) {
                    SmartAction.doAction(data, (value: any)=> {
                        //alert(333)
                        console.log(value)
                        if (value) {
                            this.updateView(value)
                            this.loading(false)
                        }
                    })
                } else {
                    this.loading(false)
                    this.onSelectedItem(data)
                }
            }).catch(()=> {
                this.loading(false)
            })
        }
    }
    private onSelectedItem(value: any) {
        let { props } = this.state;
        let { rowKey = 'id' } = props;

        if (value && value[rowKey]) {    
            this.setState({
                ...value,
                value: value[rowKey]
            })
            // TODO 
            if (this.props.former) {
                this.props.former.resetSafeValue({
                    ...value,
                    [`${this.props.fieldName}`]: value[rowKey]
                })
            }
        }
    }
    private renderValuesButton() {
        let { values,props, value } = this.state;
        let rowKey: string = props.rowKey || 'id';

        return (
            <List
                itemLayout="horizontal"
                dataSource={values}
                renderItem={(item:any, index) => (
                    <List.Item
                        onClick={()=> {
                            this.onSelectedItem(item);
                            this.refreshCache(item)
                        }}
                        className={classnames({
                            'ui-selected': item[rowKey] === value
                        })}
                    >
                        <List.Item.Meta
                            avatar={<Avatar icon={props.icon} color = {props.color}/>}
                            title={<Space>{item.title}<span>{item.subtitle}</span></Space>}
                            description={item.description}
                            
                        />
                        {item[rowKey] === value && <Icons.CheckOutlined/>}
                    </List.Item>
                )}
            />

        )
      
    }
    private loading(loading: boolean) {
        
        this.setState({
            loading
        })
    }
    private doAction() {
        
        this.props.former.validationValue((val) => {
            this.doMetaAction(val);
        }, {
            noValidationField: this.props.fieldName
        })
    }
    public renderMetaButton() {
        let { props, values } = this.state;
        let MetaButton: any = (
            <div className={classnames({
                    'ui-meta-button': true,
                    'ui-meta-empty': !this.state.value
                })}
                onClick={() => {
                    if (!this.state.value) {
                        this.doAction()
                    }
                }}
                onMouseEnter={()=> {
                    if (!this.state.value) {
                        this.setState({
                            open: true
                        })
                    }
                }}
            >
                <div className='ui-meta-button-meta'>
                    <div className='ui-meta-avatar'>
                        {this.renderAvatar()}
                    </div>
                    <div className='ui-meta-content'>
                        <h3><Space>{this.state.title}<span>{this.state.subtitle}</span></Space></h3>
                        <p>{this.state.description} {!this.state.value && this.state.emptyNotice}</p>
                    </div>
                    
                </div>
                { this.viewRequestHelper ? <Button onMouseEnter={()=> {
                    if (this.state.value) {
                        this.setState({open: true})
                    }
                }} 
                onClick={() => {
                    if (this.state.value) {
                        this.doAction()
                    }
                }}
                icon={this.state.value ?<Icons.SwapOutlined/> : <Icons.PlusOutlined/>}>NEW</Button> : null}
            </div>
        );

            
        return values && values.length > 0 ? (
            <Popover 
                open={this.state.open} 
                title={props.valuesTitle || 'CHOOSE ITEM'} 
                overlayClassName="ui-former-button-metapop" 
                content={this.renderValuesButton()}
                onOpenChange={(open: any)=>{
                    this.setState({open: false})
                }}
            >
                <Spin spinning={this.state.loading}>{MetaButton}</Spin>
            </Popover>
        ) : <Spin spinning={this.state.loading}>{MetaButton}</Spin>
        
    }


    public render() {
        let { props } = this.state;

        switch(props.type ) {
            case 'meta':
                return this.renderMetaButton();
            default:
                return this.renderDefaultButton()
        }
    }
}