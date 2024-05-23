import React from 'react';
import ReactDOM from 'react-dom';
import Leaf from './leaf';
import { Drawer, Modal, Space, Button, Popover, Tabs, Spin } from 'antd';
import { EventEmitter } from 'events';
import classnames from 'classnames';
import { utils as BUtils } from '@blocksx/core';
import * as ICONS from '../Icons';
import * as FormerTypes from './types';
import './style.scss';



export interface ExtraContentType {
    logo?: string | Function;
    extraContent?: string | Function
}

export interface FormerProps {
    type?: 'drawer' | 'modal' | 'popover';
    value?: any;
    schema: any;
    disabled?: boolean;
    extra?: ExtraContentType;
    className?: string;
    classifyType?: 'tabs' | 'step' | 'verticalTabs';
    groupType?: 'accordion' | 'more',
    schemaClassifySort?: any;
    defaultClassify: string; // 默认分类
    onChangeValue?: Function;
    autoclose?: boolean;

    operateContainerRef?: any;
    
    //onRelyParams: Function;
    // 获取 依赖的参数
    onGetDependentParameters?: Function;
    onBeforeSave?: Function;
    onSave?: Function;
    onView?: Function;
    onInit?: Function;


    visible?: boolean;
    id?: any;
    title?: any;
    okText?: string;
    cancelText?: string;
    width?: number;
    onClose?: Function;
    onVisible?: Function;
    keep?: boolean;
    size?: string;

    viewer?: boolean; // 标记视图模式，只展示

    column?: 'one' | 'two' | 'three' | 1 | 2 | 3 // 标记多少列

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
    cancelText?: string;
    width?: number;
    id?: any;

    column: any;
    viewer?: boolean; // 标记视图模式，只展示
    disabled?: boolean;
    loading?: boolean;
    fetching?: boolean;
    globalMessage?: string;
}
/**
 * 三种模式
 * 1、常规组件模式
 * 2、弹窗模式
 * 3、
 */
export default class Former extends React.Component<FormerProps, FormerState> {
    public static FormerTypes = FormerTypes;
    public static defaultProps = {
        defaultClassify: '基础',
        //classifyType: 'verticalTabs',
        keep: false,
        size: 'small',
        viewer: false,
        autoclose: true,
        column: 'one'
    };

    private timer: any;
    private emitter: EventEmitter;
    private helper: any;

    public constructor(props: FormerProps) {
        super(props);
        let { schema } = props;
        this.state = {
            type: props.type || 'default', // default, drawer, modal
            value: props.value || {},
            schema: schema,
            visible: props.visible,
            width: props.width,
            title: props.title || schema.title,
            okText: props.okText,
            cancelText: props.cancelText,
            classify: this.splitClassifySchema(props.schema),
            classifyValue: {},
            classifyActiveKey: '0',
            id: props.id,
            viewer: props.viewer,
            column: this.getDefaultColumn(props.column),
            disabled: props.disabled || false,
            loading: false,
            fetching: false
        };

        this.timer = null;

        this.emitter = new EventEmitter();
        this.emitter.setMaxListeners(1000);

    }
    public componentDidMount() {

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
        if (newProps.disabled != this.state.disabled) {
            this.setState({
                disabled: newProps.disabled
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
        if (newProps.cancelText != this.state.cancelText) {
            this.setState({
                okText: newProps.cancelText
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
                    globalMessage: '',
                    runtimeValue: value
                });

                this.emitter.emit('changeValue')
                
                //if (this.state.type === 'default') {
               
                //}
            }, 200);
        }
        if (this.props.onChangeValue) {
            this.props.onChangeValue(value);
        }
    }
    public validationValue(cb: Function) {
        let count: number = this.emitter.listenerCount('validation');
        let isBreak: boolean = false;

        if (count > 0) {
            if (this.helper) {
                this.emitter.removeListener('checked', this.helper)
            }

            this.emitter.on('checked', this.helper = (e) => {


                if (!e) {
                    isBreak = true;
                }


                if (--count <= 0) {
                    if (!isBreak) {
                        cb()
                    }
                    this.emitter.removeListener('checked', this.helper)
                    this.helper = null;
                }
            });
            this.emitter.emit('validation');

        } else {

            cb()
        }
    }
    private onSave = () => {
        if (this.props.onBeforeSave) {
            if (this.props.onBeforeSave() === false) {
                return;
            }
        }
        this.validationValue(() => {
            this.doSave()
        })
    }
    private doSave() {
        if (this.props.autoclose) {
            this.onCloseLayer();
        } else {
            this.setState({
                loading: true
            })
        }
        // 值修改的时候上报
        if (this.props.onChangeValue) {
            this.props.onChangeValue(this.state.value, true);
        }
        // 在保存的时候直接提交值
        if (this.props.onSave) {
            let saveresult: any = this.props.onSave(this.state.value, this);

            if (BUtils.isPromise(saveresult)) {
                saveresult.then(()=> {
                    this.setState({
                        loading: false
                    })
                }, (err) => {
                    this.setState({
                        globalMessage: err,
                        loading: false
                    })

                    setTimeout(() => {
                        this.setState({
                            globalMessage: ''
                        })
                    }, 4000)
                })
            }
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
                <Spin spinning={this.state.fetching}>
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
                </Spin>
            </div>
        )
    }

    private renderPopoverLeaf() {
        return (
            <>
                {this.renderLeaf()}
                <div
                    style={{
                        textAlign: 'left',
                        marginTop: '8px'
                    }}
                >
                    {this.renderOperateButton()}
                </div>
            </>
        )
    }
    public onCloseLayer = () => {
        this.setState({
            visible: true,
            loading: false
        });
        this.props.onClose && this.props.onClose();
    }

    private renderExtraLogo() {
        let { extra = {} } = this.props;
        if (extra.logo) {
            if (BUtils.isString(extra.logo)) {
                let View: any = ICONS[extra.logo as string];
                return (
                    <div className='formar-logo-container'>
                        {View ? <View /> : (extra.logo as string)}
                    </div>
                )
            }
            return (
                <div className='formar-logo-container'>
                    {BUtils.isFunction(extra.logo) ? (extra.logo as Function)(this) : extra.logo}
                </div>
            )
        }
    }
    private renderExtraContent() {
        let { extra = {} } = this.props;

        if (extra.extraContent) {

            if (BUtils.isFunction(extra.extraContent)) {
                return (extra.extraContent as Function)(this)
            } else {
                return extra.extraContent;
            }
        }
    }

    public doDisabledButton(disabled?: boolean) {

        this.setState({
            disabled: BUtils.isUndefined(disabled) ? true : disabled
        })
    }
    // 渲染功能按钮
    public renderOperateButton () {

        if (this.props.operateContainerRef) {
            return  this.props.operateContainerRef.current ? ReactDOM.createPortal(this.renderOperateWraper(), this.props.operateContainerRef.current) : null
        }

        return this.renderOperateWraper();
    }
    public renderOperateWraper() {
        
        return (
            <Space>                       
                {!this.state.viewer ? <Button loading={this.state.loading} disabled={this.state.disabled} onClick={this.onSave} type="primary">
                    {this.state.okText || 'Ok'}
                </Button> : null}

                {this.renderExtraContent()}
                <Button onClick={this.onCloseLayer}  style={{ marginRight: 8 }}>
                    {this.state.cancelText || 'Cancel'}
                </Button>
            </Space>
        )
    }
    public render() {
        switch (this.state.type) {
            case 'popover':
                return (
                    <Popover
                        title={this.state.title || 'Edit data'}
                        content={this.renderPopoverLeaf()}
                        placement="bottomRight"

                        open={this.state.visible}
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
            case 'modal':
                return (
                    <Modal
                        title={this.state.title || 'Edit data'}
                        open={this.state.visible}
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
                        title={this.state.title || 'Edit data'}
                        onClose={this.onCloseLayer}
                        open={this.state.visible}
                        rootClassName={this.props.className}
                        width={this.state.width || 450}
                        maskClosable={!this.props.keep}
                        className={classnames({
                            'ui-former': true,
                            //[`drawer-type-${this.props.size}`]: true
                        })}

                        footer={
                            <Popover 
                                open={!!this.state.globalMessage}
                                content={<Space><ICONS.CloseCircleOutlined style={{color:'#ff4d4f'}}/>{this.state.globalMessage}</Space>}
                                placement="topLeft"
                                overlayStyle={{
                                    maxWidth: 300
                                }}
                            >
                                {this.renderOperateButton()}
                            </Popover>
                        }
                    >
                        {this.renderExtraLogo()}
                        {this.renderLeaf()}
                    </Drawer>
                )
            default:
                return (
                    <div className='ui-former-content'>
                        
                        {this.renderLeaf()}
                        <div className='ui-former-buttons'>
                            {this.renderOperateButton()}
                        </div>
                    </div>
                )
        }
    }
}