import React from 'react';
import ReactDOM from 'react-dom';
import { utils } from '@blocksx/core';
import Leaf from './leaf';
import { Drawer, Modal, Space, Button, Popover, Tabs, Spin } from 'antd';
import { EventEmitter } from 'events';
import classnames from 'classnames';
import { utils as BUtils } from '@blocksx/core';
import * as ICONS from '../Icons';
import * as FormerTypes from './types';

import Context from './context';

import JSONSchema2FormerSchema from './adapter/JSONSchema';

import './style.scss';
import { pick } from 'lodash';
import TablerUtils from '../utils/tool';



export interface ExtraContentType {
    logo?: string | Function;
    extraContent?: string | Function
}

export interface FormerProps {
    type?: 'drawer' | 'modal' | 'popover';
    placement?: any;
    value?: any;
    icon?: any;
    iconType?: string;
    loading?: boolean;
    rowKey?: string;
    schema: any;
    disabled?: boolean;
    extra?: ExtraContentType;
    className?: string;
    classifyType?: 'tabs' | 'step' | 'verticalTabs';

    groupType?: 'accordion' | 'more',
    groupMeta?: any;
    schemaClassifySort?: any;
    defaultClassify: string; // 默认分类
    onChangeValue?: Function;
    autoclose?: boolean;

    operateContainerRef?: any;
    titleContainerRef?: any;
    onlyButton?: boolean;// 只渲染button

    //onRelyParams: Function;
    // 获取 依赖的参数
    onGetDependentParameters?: Function;
    onBeforeSave?: Function;
    onSave?: Function;
    onCancel?: Function;
    onSubmit?: Function;
    onView?: Function;
    onInit?: Function;


    visible?: boolean;
    id?: any;
    title?: any;
    okText?: string;
    okIcon?: string;
    cancelText?: string;
    cancelType?: 'default' | 'primary' | 'dashed' | 'link';
    width?: number;
    onClose?: Function;
    onVisible?: Function;
    keep?: boolean;
    size?: any;

    viewer?: boolean; // 标记视图模式，只展示

    column?: 'one' | 'two' | 'three' | 1 | 2 | 3 // 标记多少列

    children?: any;

    canmodify?: boolean;
    notice?: any;
    hideButtons?: boolean;
    readonly?: boolean;
    mandatoryValidation?: boolean;
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
    canmodify?: boolean; // 标记为编辑模式

    disabled?: boolean;
    loading?: boolean;
    fetching?: boolean;
    globalMessage?: string;
    notice?: any;
    readonly?: boolean;
    mandatoryValidation?: boolean;
    icon: string;
    iconType?: string;
}
/**
 * 三种模式
 * 1、常规组件模式
 * 2、弹窗模式
 * 3、
 */
export default class Former extends React.Component<FormerProps, FormerState> {
    public static FormerTypes = FormerTypes;
    public static JSONSchema2FormerSchema = JSONSchema2FormerSchema;

    public static defaultProps = {
        defaultClassify: '基础',
        //classifyType: 'verticalTabs',
        keep: false,
        size: 'small',
        viewer: false,
        autoclose: true,
        column: 'one',
        placement: 'top'
    };
    private leafInstance: any;
    private timer: any;
    private emitter: EventEmitter;
    private helper: any;
    private helperError: any;
    private cache: any;

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
            disabled: props.disabled || true,
            loading: props.loading,
            fetching: false,
            canmodify: props.canmodify,
            notice: props.notice,
            readonly: props.readonly || false,
            icon: props.icon,
            iconType: props.iconType,
            mandatoryValidation: props.mandatoryValidation
        };

        this.timer = null;
        this.cache = {};
        this.leafInstance = [];

        this.emitter = new EventEmitter();
        this.emitter.setMaxListeners(1000);

    }
    public removeCache(key: string) {
        delete this.cache[key];
    }
    public setCache(key: string, value: any) {
        this.cache[key] = value;
    }
    public getCache(key: string) {
        return this.cache[key];
    }
    public refreshCache(key: string, value: any) {
        if (this.getCache(key)) {
            Object.assign(this.cache[key], value)
        }
    }
    public setLoading(loading: boolean) {
        this.setState({
            loading
        })
    }
    public loading(loading: boolean) {
        this.setState({
            loading
        })
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

        if (newProps.notice != this.state.notice) {
            this.setState({
                notice: newProps.notice
            })
        }

        if (newProps.viewer != this.state.viewer) {
            this.setState({
                viewer: newProps.viewer
            })
        }

        if (newProps.canmodify != this.state.canmodify) {

            this.setState({
                canmodify: newProps.canmodify
            })
        }

        if (newProps.disabled != this.state.disabled) {
            if (!utils.isUndefined(newProps.disabled)) {
                this.setState({
                    disabled: newProps.disabled
                })
            }
        }

        if (newProps.readonly != this.state.readonly) {
            this.setState({
                readonly: newProps.readonly || false
            })
        }

        if (newProps.loading != this.state.loading) {
            this.setState({
                loading: newProps.loading
            })
        }


        if (newProps.value && newProps.value != this.state.value) {
            this.setState({
                value: newProps.value || {}
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
                cancelText: newProps.cancelText
            })
        }
        if (newProps.id != this.state.id) {

            this.setState({
                id: newProps.id,
                value: newProps.value || { config: {} }
            })
        }

        if (newProps.icon != this.state.icon) {
            this.setState({
                icon: newProps.icon
            })
        }

        if(newProps.iconType != this.state.iconType) {
            this.setState({
                iconType: newProps.iconType
            })
        }   
        if (newProps.mandatoryValidation != this.state.mandatoryValidation) {
            this.setState({
                mandatoryValidation: newProps.mandatoryValidation
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
        let trueValue: any = utils.copy(value);
        // if(!type) {
        if (type == 'init') {
            if (this.timer) {
                clearInterval(this.timer);
            }
            return this.timer = setTimeout(() => {

                this.setState({
                    value: trueValue,
                    disabled: false,
                    globalMessage: '',
                    runtimeValue: trueValue
                });
                this.props.onChangeValue && this.props.onChangeValue(trueValue, type);
                this.emitter.emit('changeValue')
            }, 200);
        }
        // man 是人工触发的
        if (this.props.onChangeValue && type == 'man') {

            this.props.onChangeValue(trueValue, type);
        }

        this.setState({
            disabled: false
        })
    }
    
    public validationValue(cb: Function, parmas?: any, errorBack?: Function) {

        let errorMessage: string[] = [];
        this.leafInstance.forEach((it: any) => {

            let result:any = it.validation(parmas);
            

            if (result !== true && result) {
                errorMessage.push(result);   
            }
        })
        
        if (errorMessage.length > 0) {
            errorBack && errorBack(errorMessage);
        } else {
            cb && cb(this.getSafeValue())
        }
    }
    public resetSafeValue(data: any, type: string = 'man', callback?: Function) {
        let { value } = this.state;
        let safeValue: any = this.getSafeValue(data);

        this.setState({
            value: {
                ...value,
                ...safeValue
            }
        }, () => {
            this.onChangeValue(this.state.value, type);
            callback && callback(this.state.value);
        })

    }
    public getValue() {
        return this.state.value || {};
    }
    private getSafeValue(_value?: any) {
        let { schema = {}, value } = this.state;
        let safeKeys: any = Object.keys(schema.properties)

        return pick(_value || value, safeKeys)
    }
    private onSave = (e) => {

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
        
        if (this.props.onSubmit) {
            this.props.onSubmit(this.state.value, this);
        }

        // 在保存的时候直接提交值
        if (this.props.onSave) {
            let saveresult: any = this.props.onSave(this.state.value, this);

            if (BUtils.isPromise(saveresult)) {
                saveresult.then(() => {
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

                                        former={this}
                                        canmodify={this.state.canmodify}
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
        let { schema = {}, classify, visible, column, notice } = this.state;

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
                    {notice && (utils.isPlainObject(notice) ? <FormerTypes.notice {...notice} value={notice.description || notice.label} /> : <FormerTypes.notice value={notice} />)}
                    <Leaf
                        key={this.getUniqKey(schema)}
                        size={this.props.size}
                        runtimeValue={this.state.value || {}}
                        value={this.state.value}
                        {...this.state.schema}
                        former={this}
                        canmodify={this.state.canmodify}
                        rootEmitter={this.emitter}
                        onChangeValue={this.onChangeValue}
                        onGetDependentParameters={this.props.onGetDependentParameters}
                        viewer={this.state.viewer}
                        readonly={this.state.readonly}
                        xxx="222"
                        groupType={this.props.groupType}
                        groupMeta={this.props.groupMeta}
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
    public onCloseLayer = (e?: any) => {

        
        if (this.props.onClose) {
            
            this.props.onClose(e === true);
        }

        if (this.props.onCancel) {
            this.props.onCancel();
        }

        this.setState({
            visible: true,
            loading: false
        });
        
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
    public renderOperateButton() {

        if (this.props.operateContainerRef && this.props.operateContainerRef.current) {

            return this.props.operateContainerRef.current 
                ? ReactDOM.createPortal(this.renderOperateWraper(), this.props.operateContainerRef.current) 
                : null
        }

        return this.renderOperateWraper();
    }
    public renderOperateWraper() {

        let OkIconView: any = ICONS[this.props.okIcon as any]
        if (this.props.onlyButton) {
            return (
                !this.state.viewer
                    ? <Button
                        loading={this.state.loading}
                        size={this.props.size}
                        disabled={this.state.disabled}
                        onClick={this.onSave} type="primary"
                        icon={OkIconView && <OkIconView />}
                    >
                        {this.state.okText || 'Ok'}
                    </Button>
                    : null

            )
        }
        return (
            <Space>
                {!this.state.viewer ? <Button icon={OkIconView && <OkIconView />} size={this.props.size} loading={this.state.loading} disabled={this.state.disabled} onClick={this.onSave} type="primary">
                    {this.state.okText || 'Ok'}
                </Button> : null}

                {this.renderExtraContent()}
                <Button className='ui-former-cancel' type={this.props.cancelType} size={this.props.size} onClick={() => this.onCloseLayer(true)} style={{ marginRight: 8 }}>
                    {this.state.cancelText || 'Cancel'}
                </Button>
            </Space>
        )
    }
    public renderIcon() {
        if (this.state.iconType == 'avatar') {
            return <FormerTypes.avatar autoColor={false} icon={this.state.icon} size={24} />;
        }
        return TablerUtils.renderIconComponent(this.props)

    }
    public renderTitle() {
        let RenderContent: any = (
            <Space size={0} className='ui-former-header'>
                {this.state.icon && this.renderIcon()}
                {this.state.title || 'Edit record'}
            </Space>
        );

        if (this.props.titleContainerRef) {
            return this.props.titleContainerRef.current ? ReactDOM.createPortal(RenderContent, this.props.titleContainerRef.current) : null;
        }
        return RenderContent;
    }
    public renderContent() {
        switch (this.state.type) {

            case 'popover':
                return (
                    <Popover
                        title={this.renderTitle()}
                        content={this.renderPopoverLeaf()}
                        placement={this.props.placement || 'topLeft'}
                        trigger={'click'}
                        open={this.state.visible}
                        arrow={false}
                        autoAdjustOverflow={true}
                        rootClassName='ui-popover-former'
                        onOpenChange={(visible: boolean) => {
                            if (!this.props.keep || visible) {
                                this.setState({
                                    visible
                                })
                            }
                            if (this.props.onVisible) {
                                this.props.onVisible(visible)
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
                        title={this.renderTitle()}
                        open={this.state.visible}
                        onOk={this.onSave}
                        closable={false}
                        onCancel={() => this.onCloseLayer(true)}
                        width={this.state.width || 500}
                        okText={this.state.okText || 'Ok'}
                        cancelText={this.state.cancelText}
                        maskClosable={!this.props.keep}
                    >
                        {this.renderLeaf()}
                    </Modal>
                )
            case 'drawer':
                return (
                    <Drawer
                        title={this.renderTitle()}
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
                                content={<Space><ICONS.CloseCircleOutlined style={{ color: '#ff4d4f' }} />{this.state.globalMessage}</Space>}
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
                    <Spin spinning={this.state.loading}>
                        <div className='ui-former-content'>
                            {this.renderTitle()}
                            {this.renderLeaf()}
                            {!this.props.hideButtons && <div className='ui-former-buttons'>
                                {this.renderOperateButton()}
                            </div>}
                        </div>
                    </Spin>
                )
        }
    }
    public registerLeafInstance = (instance: any) =>{
        this.leafInstance.push(instance);
    }
    public removeLeafInstance =(instance: any) => {
        this.leafInstance = this.leafInstance.filter((it: any) => it != instance);
    }
    public render() {
        return (
            <Context.Provider value={{
                registerLeafInstance: this.registerLeafInstance,
                removeLeafInstance: this.removeLeafInstance
            }}>
                {this.renderContent()}
            </Context.Provider> 
        )
    }
}