
import React from 'react';
import { clone } from 'lodash';
import classnames from 'classnames';
import { Popover, Space,Tooltip } from 'antd';

import OneOf from './oneOf';
import * as FormerTypes from './types';
import { IFormerControl } from './typings';
import { EventEmitter } from 'events';
import Validation from './validation';
import ConstValue from './const';
import { utils } from '@blocksx/core';
import * as Icons from '../Icons'


export interface ILeaf {
    path: string;
    portalMap?: any;
    parentPath?: string;
    value: string;
    runtimeValue?: any;
    
    defaultValue: any;
    groupType?: string;
    rootEmitter?: EventEmitter;
    onChangeValue?: Function;
    onDealControl?: Function;
    childrenControl?: object;

    "x-type"?: string;
    type: string;

    properties?: any;
    items?: any;
    size?: string;
    dataSource?: any;
    canmodify?:boolean;
    viewer?: boolean;
    onGetDependentParameters?: Function
}

interface TLeaf {
    // 特殊值，__oneOf__prop: string;
    value: any;
    runtimeValue?: any;
    validation?: any;

    originValue: any[];
    controlHide: any[];
    controlPatch: any;

    childrenControl?: object;
    parentHooksControl?: IControl;
    properties?: any;
    oneOfCache?: any;
    items?: any;
    type: string;

    viewer?: boolean;
    canmodify?:boolean;

    validationState?: any; // 验证状态
    validationMessage?: any;
}

interface IControl {
    when?: string[];
    show?: string[];
    hide?: string[];
    patch?: any;
    validation?: any;
}

interface IControlInfo {
    controlList: string[];
    parentControlList: string[];
    childrenControlList?: object
}

export default class Leaf extends React.PureComponent<ILeaf, TLeaf> {

    private path: string;
    private parentPath?: string;
    private type: string;
    private leafProps: any;
    private properties?: any;
    private items?: any;
    private emitterHelper: any;
    private wrapperRef: any;

    public constructor(props: ILeaf) {
        super(props);

        this.path = props.path || '$';
        this.parentPath = props.parentPath || '';

        this.leafProps = props;
        this.type = props['x-type'] || props.type;

        // case object,map,
        this.properties = props.properties;

        // case array
        this.items = props.items;

        let value = utils.isUndefined(props.value) ? this.getDefaultValue() : props.value;
        
        this.state = {
            value: value,
            properties: props.properties,
            runtimeValue: props.runtimeValue,
            items: props.items,
            type: this.type,
            controlHide: [],
            controlPatch: {},
            childrenControl: {},
            parentHooksControl: {},
            oneOfCache: {},
            viewer: props.viewer,
            originValue: this.getMapOriginValue(value || {}),
            canmodify: props.canmodify
        }

        this.wrapperRef = React.createRef();
    }



    public componentDidMount() {

        let { rootEmitter } = this.props;

        // 初始化的时候把初始值 上报
        //this.props.onChangeValue && this.props.onChangeValue(this.state.value, 'init');
        this.onChange(this.state.value, 'init')
        // 清空control的影响
        if (this.props['x-control']) {
            this.dealControl(this.state.value, this.props['x-control']);
        }

        // 设置验证事件

        if (rootEmitter) {
            if (this.props['x-validation']) {
                // 启动校验
                rootEmitter.on('validation', this.emitterHelper = () => {
                    // 开始值校验
                    this.verification((isThouth, message) => {
                        rootEmitter && rootEmitter.emit('checked', isThouth);
                    })
                })
            }
        }
    }
    
    public UNSAFE_componentWillReceiveProps(newProps: any) {
        
        if (newProps.value != this.state.value) {
            
            this.setState({
                value: newProps.value
            })
        }

        if (newProps.viewer != this.state.viewer) {
            this.setState({
                viewer: newProps.viewer
            })
        }

        if (!utils.isUndefined(newProps.childrenControl)) {
            if (newProps.childrenControl != this.state.parentHooksControl) {
                this.onDealControl(newProps.childrenControl);
                this.setState({
                    parentHooksControl: newProps.childrenControl
                })
            }
        }
        
        if (newProps.canmodify != this.state.canmodify) {
            
            this.setState({
                canmodify: newProps.canmodify
            })
        }

        if (newProps.type != this.state.type) {
            this.setState({
                type: this.getTrueType(newProps)
            })
        }

        if (newProps.properties != this.state.properties) {
            this.setState({
                properties: this.properties = newProps.properties
            })
        }

        if (newProps.runtimeValue != this.state.runtimeValue) {

            this.setState({
                runtimeValue: newProps.runtimeValue
            })
        }

        this.leafProps = newProps;//Object.assign(this.leafProps, newProps)
    }
    private getTrueType(prop: any) {
        return prop['x-type'] || prop.type;
    }
    public componentWillUnmount() {

        let { rootEmitter } = this.props;
        if (rootEmitter) {
            if (this.emitterHelper) {
                // 删除校验
                rootEmitter.removeListener('validation', this.emitterHelper);
            }
        }
        /*
        // 清空control的影响
        if (this.props['x-control']) {
          this.dealControl(undefined, this.props['x-control']);
        }
    
        
        */
    }
    private getTrueStringType() {
        if (['select','radio'].indexOf(this.props['x-type'] as any) > -1) {
            return 'xstring'
        }
        return this.props.type;
    }
    private verification(cb: Function) {
       
        Validation.valid(this.state.value, {...this.props['x-validation'], type: this.getTrueStringType()}, (msg) => {

            this.setState({
                validationState: msg,
                validationMessage: msg
            });
            // 定时隐藏
            setTimeout(() => {
                this.setState({
                    validationState: false
                })
            }, 4000)

            if (msg && this.wrapperRef.current && !ConstValue.isValidError ) {
                ConstValue.isValidError  = true;
                this.wrapperRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }

            cb(!msg, msg);
        })
    }

    private getMapOriginValue(value: object) {
        let originValue: any = [];
        for (let p in value) {
            originValue.push({
                key: p,
                value: value[p]
            })
        }
        return originValue;
    }
    /**
     * 获取默认值
     */
    private getDefaultValue(props?: any) {

        let { defaultValue } = props || this.leafProps;
        let { type } = props || this.state || this;

        if (utils.isUndefined(defaultValue)) {
            switch (type) {
                case 'map':
                case 'object':
                    return {};
                case 'array':
                    return [];
            }
        }
        return defaultValue
    }
    private isFeaturesNode() {
        return ['array', 'object', 'map'].indexOf(this.state.type) == -1;
    }
    private isCanViewerType(type: string) {
        return ['array', 'group', 'map', 'object','pickmore', 'table'].indexOf(type) == -1;
    }
    private getNodeByType(type?: string) {
        let _type: string = type || this.state.type;

        if (FormerTypes[_type]) {

            let View: any = FormerTypes[_type]

            // 视图模式
            if (this.state.viewer && (this.isCanViewerType(_type) || View.Viewer)) {

                if (View.Viewer) {
                    return View.Viewer;
                }
                return FormerTypes['label']
            }

            return View;
        }

        throw new Error(`没有注册的组件类型 ${_type}`);
    }

    private getSubNodeByType(type?: string) {
        let node = this.getNodeByType(type);
        if (node) {
            return node.Item;
        }
    }

    private isType(type: string) {
        return this.state.type === type;
    }
    private clone(target: any) {
        return clone(target);
        //return target ? JSON.parse(JSON.stringify(target)) : target;
    }
    private getObjectByKeyValue(originValue: any[]) {
        let object = {};

        originValue.forEach((it: any) => {
            object[it.key] = it.value;
        })

        return object;
    }
    
    private getValueByProps(value: any, props: any, allValue?: any,  prop?: string) {

        if (utils.isString(prop)) {
            let dotProp: any = prop?.split('.');
            
            if (dotProp.length == 2) {
                return utils.get(allValue, prop)
            }
        }
        
        if (utils.isUndefined(value) || utils.isNull(value)) {
            return utils.isUndefined(props.defaultValue) ? props.value || this.getDefaultValue(props) : props.defaultValue;
        }

        return value;
    }
    private onChangeValue(value: any, type?: string, originValue?: any[]) {

        let { controlHide = [] } = this.state;

        if (controlHide.length) {

            if (this.isType('object')) {
                controlHide.forEach((it) => {

                    delete value[it];
                })
            }
        }

        
        // TODO 修改点分属性的值
        // 后续看下高效的方法
       // this.updateDotpropValue(value)
        
       

        this.setState({
            value: value,
            validationState: false,
            validationMessage: null,
            originValue: originValue ? originValue : this.state.originValue
        });
        /*
        if (this.props.onChangeValue) {
            this.props.onChangeValue(value, type, originValue);
        }*/
        this.onChange(value, type, originValue)

        if (this.props['x-control']) {
            this.dealControl(value, this.props['x-control']);
        }
    }
    private onChange(value: any, type?: string, originValue?: any) {
        
        let { path = '' } = this.props;
        // 屏蔽 掉 点分路径值
        // 名称中带点的 为只显示
        if (path.indexOf('.') == -1) {

            if (this.props.onChangeValue) {
                this.props.onChangeValue(value, type, originValue)
            }
        }

    }
    private getControlInfo(keys: string[]): IControlInfo {
        let controlList: string[] = [];
        let parentControlList: string[] = [];
        let childrenControlList: object = {};

        if (Array.isArray(keys)) {
            keys.forEach((it: string) => {
                let step = it.split('/');
                // 自身的情况
                if (step.length < 3 && step[0] !== '..') {
                    if (step[0] == '.') {
                        step.shift();
                    }
                    controlList.push(step.join(''))
                    // 父级 & 孙子 情况
                } else {
                    // 父亲
                    if (step[0] == '..') {
                        step.shift();
                        parentControlList.push(step.join('/'));

                    } else {
                        // 孙子
                        if (step.length > 2) {
                            if (step[0] == '.') {
                                step.shift();
                            }

                            let next: any = step.shift();

                            if (!childrenControlList[next]) {
                                childrenControlList[next] = []
                            }
                            childrenControlList[next].push(step.join('/'))
                        }
                    }
                }
            })
        }

        return {
            controlList,
            parentControlList,
            childrenControlList
        }
    }
    private onDealControl(control: IControl) {
        
        let { hide = [], show = [], patch = {} } = control;

        let controlHideInfo = this.getControlInfo(hide);
        let controlShowInfo = this.getControlInfo(show);
        let controlPatchInfo = this.getControlInfo(Object.keys(patch))

        let controlHide = this.state.controlHide || [];
        let controlPatch = {};

        if (controlPatchInfo.controlList.length) {
            controlPatchInfo.controlList.forEach(pt => {
                controlPatch[pt] = patch[pt];
            })
        }

        if (controlHideInfo.controlList.length) {
            controlHideInfo.controlList.forEach((it: string) => {
                if (controlHide.indexOf(it) == -1) {
                    controlHide.push(it);
                }
            })
        }
        if (controlShowInfo.controlList.length) {
            controlHide = controlHide.filter((it: string) => controlShowInfo.controlList.indexOf(it) == -1)
        }

        this.setState({
            controlHide: controlHide,
            controlPatch: controlPatch
        });

        this.onChangeValue(this.state.value);

        this.dealParentControl(controlHideInfo, controlShowInfo, controlPatchInfo);
        this.dealChildrenControl(controlHideInfo, controlShowInfo, controlPatchInfo);

    }
    private dealChildrenControl(controlHideInfo: IControlInfo, controlShowInfo: IControlInfo, controlPatchInfo?: IControlInfo) {
        //let { childrenControl } = this.state;
        let childrenControl = {};
        let controlChildHideInfo = controlHideInfo.childrenControlList;
        let controlChildShowInfo = controlShowInfo.childrenControlList;

        for (let prop in controlChildHideInfo) {
            if (!childrenControl[prop]) {
                childrenControl[prop] = {
                    show: [],
                    hide: []
                };
            }

            controlChildHideInfo[prop].forEach((it: string) => {
                if (childrenControl[prop].hide.indexOf(it) == -1) {
                    childrenControl[prop].hide.push(it)
                }
            })
        }

        for (let prop in controlChildShowInfo) {
            if (!childrenControl[prop]) {
                childrenControl[prop] = {
                    show: [],
                    hide: []
                };
            }
            controlChildShowInfo[prop].forEach((it: string) => {
                if (childrenControl[prop].show.indexOf(it) == -1) {
                    childrenControl[prop].show.push(it)
                }
            })
        }

        this.setState({
            childrenControl: childrenControl
        })

    }
    private dealParentControl(controlHideInfo: IControlInfo, controlShowInfo: IControlInfo, controlPatchInfo?: IControlInfo) {
        // 处理控制父级情况
        let parentControl: IControl = {};
        if (controlHideInfo.parentControlList.length) {
            parentControl.hide = controlHideInfo.parentControlList;
        }
        if (controlShowInfo.parentControlList.length) {
            parentControl.show = controlShowInfo.parentControlList;
        }
        // 当存在控制父级的情况
        if (parentControl.hide || parentControl.show) {
            if (this.props.onDealControl) {
                this.props.onDealControl(parentControl)
            }
        }
    }
    private getTrueHotPatch(patch: any) {
        for(let prop in patch) {
            let hotPatch: any = patch[prop];

            if (hotPatch.uiType) {
                hotPatch['x-type'] = hotPatch.uiType;
            }
        }

        return patch;
    }
    private dealControl(value: any, controlList: IFormerControl) {
        let showList: any[] = [];
        let hideList: any[] = [];
        let patchList: any = {};

        if (this.props.onDealControl) {

            controlList.forEach((control: IControl) => {

                let { when = [], hide = [], show = [] } = control;
                if (utils.isArray(when) || utils.isBoolean(when)) {
                    // 当存在值的时候
                    // 简单判断值是否存在，不做模糊匹配
                    let matchValue: boolean = utils.isBoolean(when) ? !!value : when.indexOf(value) > -1;
                    
                    if (matchValue) {
                        showList = showList.concat(show);
                        hideList = hideList.concat(hide);

                        // TODO 处理 validation 级联情况
                        if (control.patch) {
                            let hotPatch: any = this.getTrueHotPatch(control.patch);
                            Object.assign(
                                patchList, {
                                    ...hotPatch
                                }
                            )
                        }
                        

                        // 不存在值的时候
                    } else {
                        showList = showList.concat(hide);
                        hideList = hideList.concat(show);
                    }
                }

            });

            this.props.onDealControl({
                hide: hideList,
                show: showList,
                patch: patchList
            })
        }
    }

    private traversalProperties() {
        let propertiesKey = Object.keys(this.properties);
        let defaultGroup: any = [];
        let portalMap: any = {};
        let portalField:any  = {};
        let group: any = {};
        let groupList: any[] = [];

        propertiesKey.forEach((it: string) => {
            let props = this.properties[it];
            let groupName = props['x-group'];
            let portal: any = props['x-portal'];

            if (portal) {
                let portalSplit: any = portal.split('.');
                let portalTarget: string = portalSplit[0];

                if (!portalMap[portalTarget]) {
                    portalMap[portalTarget] = {
                        cache: {},
                        map: []
                    }
                }
                let portalValue: any = {
                    slot:  portalSplit[1] || 'content'
                }
                
                portalMap[portalTarget].cache[props.key] = portalValue;
                portalMap[portalTarget].map.push(portalValue);


                portalField[props.key] = {
                    target: portalTarget,
                    slot: portalValue.slot
                }
            }

            if (groupName) {
                if (!group[groupName]) {
                    group[groupName] = [];
                }

                group[groupName].push(it)
            } else {
                defaultGroup.push(it);
            }
        });
        if (defaultGroup.length) {
            groupList.push({
                group: defaultGroup
            });
        }

        Object.keys(group).forEach((it: string) => {
            groupList.push({
                title: it,
                group: group[it]
            })
        })

        return { groupList, portalMap, portalField };
    }

    private getObjectItemProperties(prop: string) {
        let { value = {}, controlPatch = {} } = this.state;
        let props = this.properties[prop];

        // 如果存在hot patch的时候
        if (controlPatch[prop]) {
            return Object.assign(this.clone(props), controlPatch[prop]);
        }
        

        // 多选情况
        if (props.type == 'oneOf') {
            return this.clone(OneOf.getProperties(prop, props, value));
        } else {
            return this.clone(props);
        }
    }
    private getObjectItemOneOfNode(prop: string) {
        let { value = {} } = this.state;
        let props = this.properties[prop];

        return (
            <OneOf
                type="object"
                props={props}
                key={prop}
                value={value}
                prop={prop}
                onOneOfSelect={(schema: any) => {
                    let val: any = this.getDefaultValue(schema);
                    let oneOfCache: any = this.clone(this.state.oneOfCache);
                    let trueType: string = schema['x-type'] || schema.type;

                    value[prop] = val;
                    oneOfCache[prop] = schema;
                    this.type = trueType;
                    this.setState({
                        value,
                        //type: trueType,
                        oneOfCache
                    });
                    this.onChangeValue(value);
                }}
            />
        )

    }
    private isShowObjectKeyByProp(prop: string) {
        let { controlHide } = this.state;
        

        return controlHide.indexOf(prop) == -1;
    }
    private renderObjectNode(children: any[], Child: any) {
        let { value } = this.state;
        let { groupList, portalMap, portalField } = this.traversalProperties();
        let Group = this.getNodeByType('group');
        let GroupItem = this.getSubNodeByType('group');
        
        children.push(
            <Group key={children.length}>
                {groupList.map((it: { title: string; group: any[] }, index: number) => {

                    let GroupChildren: any = it.group.sort((a: any, b: any) => {

                        let prevItem = this.properties[a];
                        let nextItem = this.properties[b];

                        return prevItem['x-index'] > nextItem['x-index'] ? 1 : -1;
                    }).map((prop: any, index: number) => {
                        // 不存在隐藏的情况
                        
                        if (this.isShowObjectKeyByProp(prop)) {
                            let properties: any = this.getObjectItemProperties(prop);//this.clone(this.properties[prop]);
                            let childrenControl: any = this.state.childrenControl ? this.state.childrenControl[prop] : null;
                            // 计算oneOf
                            let props: any = this.properties[prop];
                            let hidden: boolean = props['x-type'] == 'hidden';
                            let itemvalue: any = this.getValueByProps(value[prop], properties, value, prop);
                            
                            let leftProps: any = {...properties,
                                path:prop,
                                parentPath:this.path,
                                runtimeValue:this.state.runtimeValue,
                                value:itemvalue,
                                onDealControl:(control: IControl) => {
                                    this.onDealControl(control)
                                },
                                key:[this.path, prop, index, 'leaf'].join('.'),
                                viewer:this.state.viewer,
                                canmodify:this.state.canmodify,

                                size:this.props.size,
                                rootEmitter:this.props.rootEmitter,
                                childrenControl:childrenControl,
                                onGetDependentParameters:this.props.onGetDependentParameters,
                                onChangeValue:(val: any, type?: string) => {
                                    value[prop] = val;
                                    this.onChangeValue(value, type);
                                    //
                                }
                            };

                            if (portalField[prop]) {
                                portalMap[portalField[prop].target].cache[prop].leftProps = leftProps;
                                return false;
                            }
                            let propsPortalMap = portalMap[prop] && portalMap[prop].map;
                            let titlePortal: any = this.getPortalBySlot(propsPortalMap,'title')
                            
                            return (
                                <Child
                                    hidden={hidden}
                                    {...properties}
                                    // object items 关闭的时候
                                    onChangeValue={(val: any, type?: string) => {
                                        value[prop] = val;
                                        this.onChangeValue(value, type);
                                    }}
                                    renderTitlePortal={titlePortal.length ? ()=> {
                                        
                                        return titlePortal.map(it=> {
                                            let { description} = it.leftProps;
                                            return <Leaf
                                                {...it.leftProps}
                                                //portalMap={propsPortalMap}
                                                size={'small'}
                                                tooltip={description}
                                                popupMatchSelectWidth={false}
                                            />
                                        })
                                    }: null}
                                    size={this.props.size}
                                    value={itemvalue}
                                    defaultValue={this.getDefaultValue({
                                        type: properties.type
                                    })}
                                    oneOf={this.getObjectItemOneOfNode(prop)}
                                    key={[this.path,prop, index].join('.')}
                                    //需要
                                    onGetDependentParameters={this.props.onGetDependentParameters}
                                ><Leaf
                                    {...leftProps}
                                    portalMap={propsPortalMap}
                                />
                                </Child>
                            );
                        }

                    }).filter(Boolean);
                    return GroupChildren && GroupChildren.length > 0 ? (
                        <GroupItem
                            key={index}
                            title={it.title}
                            size={this.props.size}
                            index={index}
                            groupType={this.props.groupType}
                        >
                            {GroupChildren}
                        </GroupItem>
                    ) : null
                })}
            </Group>
        )
    }
    
    private renderMapNode(children: any[], Child: any) {
        let { value, originValue = [] } = this.state;
        // case\3 map
        let keyProperties = this.clone(this.properties.key);
        let valueProperties = this.clone(this.properties.value);

        if (keyProperties && valueProperties) {

            originValue.forEach((it: any, index: number) => {
                let prop = it.key;
                let origin = originValue[index];

                children.push(
                    <Child
                        key={index}
                        size={this.props.size}
                    >
                        <Leaf
                            {...keyProperties}
                            path="key"
                            parentPath={this.path}
                            runtimeValue={this.state.runtimeValue}
                            value={prop}
                            key="1"
                            viewer={this.state.viewer}
                            canmodify={this.state.canmodify}
                            size={this.props.size}
                            rootEmitter={this.props.rootEmitter}
                            onGetDependentParameters={this.props.onGetDependentParameters}
                            onChangeValue={(keyVal: any, type?: string) => {
                                origin.key = keyVal;
                                this.onChangeValue(this.getObjectByKeyValue(originValue), type);
                            }}
                        />
                        <Leaf
                            {...valueProperties}
                            path="value"
                            key="2"
                            size={this.props.size}

                            viewer={this.state.viewer}
                            canmodify={this.state.canmodify}
                            parentPath={this.path}
                            rootEmitter={this.props.rootEmitter}
                            runtimeValue={this.state.runtimeValue}
                            value={this.getValueByProps(value[prop], valueProperties, value, prop)}
                            onGetDependentParameters={this.props.onGetDependentParameters}
                            onChangeValue={(valVal: any, type?: string) => {
                                origin.value = valVal;
                                this.onChangeValue(this.getObjectByKeyValue(originValue), type);
                            }}
                        />
                    </Child>
                )
            });
        } else {
            console.log(this.properties);
            throw new Error('错误的map描述，必须要key，value')
        }
    }
    private renderAssembleNode() {
        let children: any[] = [];
        let { value } = this.state;


        /**
         * case 1: object object
         * 
         * case 2: array array
         * 
         * case 3: map object
         * 
         * case 4: group array
         */

        let Child = this.getSubNodeByType();


        switch (this.state.type) {
            case 'array':
                // case 2 array array
                // case 4 group array
                if (utils.isArray(value)) {
                    value.forEach((it: any, index: number) => {
                        let items = this.clone(this.items);

                        children.push(
                            <Child
                                key={index + '_child'}
                                size={this.props.size}
                            >
                                <Leaf
                                    key={index}
                                    {...items}
                                    path={index}
                                    parentPath={this.path}
                                    size={this.props.size}

                                    viewer={this.state.viewer}
                                    canmodify={this.state.canmodify}
                                    value={it}
                                    runtimeValue={this.state.runtimeValue}
                                    onGetDependentParameters={this.props.onGetDependentParameters}
                                    onChangeValue={(val: any, type?: string) => {
                                        // 数组里面的项值变化
                                        value.splice(index, 1, val);

                                        this.onChangeValue(this.clone(value), type);
                                    }}

                                />
                            </Child>
                        );
                    });
                }
                break;
            case 'object':
            case 'map':

                if (utils.isPlainObject(value)) {
                    if (this.isType('object')) {
                        this.renderObjectNode(children, Child)
                    } else {
                        this.renderMapNode(children, Child);
                    }
                }
                break;
        }

        return this.renderFeaturesNode(children);
    }
    // 判断是否允许修改
    private isAllowModify() {
        // ['x-modify’]J:'deny'
       
        return !(utils.isValidValue(this.state.value) && this.state.canmodify && this.leafProps['x-modify'] && ['deny', 'false', false].indexOf(this.leafProps['x-modify']) > -1);
    }

    private renderFeaturesNode(children: any = null, type?: string) {
        let View = this.getNodeByType();
        let ContentPortal: any = this.getPortalBySlot(this.props.portalMap,'content')

        if (View) {
            let viewProps: any = {
                key:this.leafProps.path || this.leafProps.index || this.leafProps['x-index'],
                ...this.leafProps,
                children:children,
                size:this.props.size,
                value:this.getValueByProps(this.state.value, { value: this.getDefaultValue() }),
                originValue:this.state.originValue,
                runtimeValue:this.state.runtimeValue,
                disabled:!this.isAllowModify(),
                onChangeValue:(val: any, type?: string, originValue?: any) => this.onChangeValue(val, type, originValue)
            }
            return (
                <Popover
                    placement="topLeft"
                    content={this.state.validationMessage}
                    open={false && !!this.state.validationState && this.state.validationMessage}
                >
                    <span
                        ref={this.wrapperRef}
                        className={classnames({ 'former-open-error': this.state.validationMessage })}
                    >
                        {ContentPortal.length>0 ? <Space.Compact>
                            <View
                            {...viewProps}
                            />
                            {this.renderPortal(ContentPortal)}
                        </Space.Compact> : <View {...viewProps}/>}
                        
                        {this.state.validationMessage &&  <span className='former-error-message'><Icons.InfoCircleOutlined/> {this.state.validationMessage}</span>}
                    </span>
                </Popover>
            )
        }
        return null;
    }
    private getPortalBySlot(portalMap:any,slot:string) {
        let _portalMap: any = portalMap || this.props.portalMap;
        if (_portalMap) {
            return _portalMap.filter(it=> it.slot == slot)
        }
        return []
    }
    private renderPortal(portalMap) {
        if (portalMap) {
            return portalMap.map(it => {
                let { description} = it.leftProps;
                return <Leaf {...it.leftProps} tooltip ={description} popupMatchSelectWidth={false}/>
            })
        }
    }
    public render() {
        if (this.isFeaturesNode()) {
            //if (this.isType('oneOf')) {
            //  return this.renderOneOfFeaturesNode();
            //}

            return this.renderFeaturesNode();
        }
        return this.renderAssembleNode()
    }
}