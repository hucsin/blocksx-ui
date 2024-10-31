
import React from 'react';
import ReactDOM from 'react-dom';
import { clone } from 'lodash';
import { Popover, Space, Tooltip } from 'antd';

import OneOf from './oneOf';
import * as FormerTypes from './types';
import { IFormerControl } from './typings';
import { EventEmitter } from 'events';
import Validation from './validation';
import ConstValue from './const';
import { utils, keypath } from '@blocksx/core';
import * as Icons from '../Icons'
import Context from './context';


export interface ILeaf {
    fields: any;
    fieldKey: string;
    fieldName: string;
    former: any;
    path: string;
    portalMap?: any;
    
    parentPath?: string;
    parentPathName?: string;
    value: string;
    runtimeValue?: any;

    defaultValue: any;
    groupType?: string;
    groupMeta?: any;
    rootEmitter?: EventEmitter;
    onChangeValue?: Function;
    onDealControl?: Function;
    childrenControl?: object;
    readonly?: boolean;

    "x-type"?: string;
    type: string;
    index?: number;

    properties?: any;
    items?: any;
    moreItems?: any;
    size?: string;
    dataSource?: any;
    canmodify?: boolean;
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
    canmodify?: boolean;

    validationState?: any; // 验证状态
    validationMessage?: any;
    readonly?: boolean;
    index?: number;
}

interface IControl {
    when?: string[] | any;
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
    public static contextType = Context;
    public context: any;

    private path: string;
    private parentPath?: string;
    private parentPathName?: string;
    private type: string;
    private leafProps: any;
    private properties?: any;
    private items?: any;
    private wrapperRef: any;

    public constructor(props: ILeaf) {
        super(props);

        this.path = props.path || '$';
        this.parentPath = props.parentPath || '';
        this.parentPathName = props.parentPathName || '';

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
            originValue: this.getMapOriginValue(value || this.getDefaultValue()),
            canmodify: props.canmodify,
            readonly: props.readonly || false,
            index: props.index
        }

        this.wrapperRef = React.createRef();
    }



    public componentDidMount() {

        // 初始化的时候把初始值 上报
        //this.props.onChangeValue && this.props.onChangeValue(this.state.value, 'init');
        this.onChange(this.state.value, 'init')
        // 清空control的影响
        if (this.props['x-control']) {
            this.dealControl(this.state.value, this.props['x-control']);
            
        }

        // 设置验证事件

        if (this.props['x-validation']) {

            this.context.registerLeafInstance(this);
        }

    }

  


    public UNSAFE_componentWillReceiveProps(newProps: any) {

        if (newProps.value != this.state.value) {
            //this.onChangeValue(newProps.value, 'man')
            this.setState({
                value: newProps.value
            }, () => {
                // console.log('this.state.value', this.state.value)
                // dealControl
                if (this.props['x-control']) {
                    this.dealControl(newProps.value, this.props['x-control']);
                }
            })
        }

        if (newProps.viewer != this.state.viewer) {
            this.setState({
                viewer: newProps.viewer
            })
        }
        if (newProps.readonly != this.state.readonly) {
            this.setState({
                readonly: newProps.readonly
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

        if (newProps.index != this.state.index) {
            this.setState({
                index: newProps.index
            })
        }

        this.leafProps = newProps;//Object.assign(this.leafProps, newProps)
    }
    private getTrueType(prop: any) {
        return prop['x-type'] || prop.type;
    }
    public componentWillUnmount() {

        if (this.props['x-validation']) {
            this.context.removeLeafInstance(this);
        }

    }
    private getTrueStringType() {
        if (['select', 'radio'].indexOf(this.props['x-type'] as any) > -1) {
            return 'xstring'
        }
        return this.props.type;
    }

    // 校验函数
    public validation(data: any) {
        let { value } = this.state;

        if (data && data.noValidationField) {
            let { fieldKey } = this.props;
            if (utils.isArray(data.noValidationField)) {
                if (data.noValidationField.indexOf(fieldKey) > -1) {
                    return true;
                }
            } else {
                if (fieldKey == data.noValidationField) {
                    return true;
                }
            }
        }


        return this.doValidtion(Validation.quickValid(value, {
            ...this.props['x-validation'], type: this.getTrueStringType()
        }, this.getDefaultParentPathName()));
    }


    private doValidtion(msg: any) {
        let { index } = this.state;
        let message: string = msg === true ? '' : msg;

        this.setState({
            validationState: msg,
            validationMessage: message
        });
        // 定时隐藏
        setTimeout(() => {
            this.setState({
                validationState: false
            })
        }, 4000)

        if (message && this.wrapperRef.current && !ConstValue.isValidError) {
            ConstValue.isValidError = true;
            let domwrapper: any = ReactDOM.findDOMNode(this.wrapperRef.current);
            domwrapper && domwrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        
        return utils.isString(message)  && message
            ? !utils.isUndefined(index) 
                ? (this.parentPathName || 'Array') + ' item(' +((index || 0) + 1)+') ' + message 
                : message 
            : '';
    }

    private getMapOriginValue(value: any) {
        if (Array.isArray(value)) {
            return value;
        }
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
                    return this.isArrayMap() ? [] : {};
                case 'object':

                    return {};
                case 'condition':
                    return {
                        type: 'logic',
                        logic: 'allOf',
                        value: [
                            {
                                type: 'tuple',
                                value: {
                                    operator: '='
                                }
                            }
                        ]
                    }
                case 'list':
                case 'array':
                    return [];
            }
        }
        return defaultValue
    }
    private isFeaturesNode() {
        return ['array', 'object', 'map', 'condition', 'list'].indexOf(this.state.type) == -1;
    }
    private isCanViewerType(type: string) {
        return ['array', 'group', 'map', 'object', 'pickmore', 'table'].indexOf(type) == -1;
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
        console.log(this.props, this.state.type, type, 3333)
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

        if (this.isArrayMap()) {
            return originValue
        }
        let object = {};

        originValue.forEach((it: any) => {
            object[it.key] = it.value;
        })

        return object;
    }

    private getValueByProps(value: any, props: any, allValue?: any, prop?: string) {

        if (utils.isString(prop)) {
            let dotProp: any = prop?.split('.');

            if (dotProp.length == 2) {
                return keypath.get(allValue, prop as string)
            }
        }

        if (utils.isUndefined(value) || utils.isNull(value)) {

            // 处理两个特殊的情况，带$开头的数据，可以从不带$的符号前面去获取
            // TODO 临时处理, 后面加入别名
            if (prop) {
                let hasdoner: boolean = prop.indexOf('$') > -1;
                if (hasdoner) {
                    return allValue[prop.replace(/^\$/, '')];
                } else {
                    return allValue['$' + prop]
                }
            }

            return utils.isUndefined(props.defaultValue) ? props.value || this.getDefaultValue(props) : props.defaultValue;
        }

        return value;
    }
    private onChangeValue(value: any, type?: string, originValue?: any[]) {

        let { controlHide = [] } = this.state;

        if (controlHide.length) {

            if (this.isType('object')) {
                controlHide.forEach((it) => {
                    // TODO 后续看下这里怎么处理
                    //delete value[it];
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
        for (let prop in patch) {
            let hotPatch: any = patch[prop];

            if (hotPatch.uiType) {
                hotPatch['x-type'] = hotPatch.uiType;
            }
        }

        return patch;
    }
    private matchDepend(when: any) {
        if (utils.isPlainObject(when) && utils.isPlainObject(when.depend)) {
            let formerValue: any = this.props.former.getSafeValue() || {};

            if (Object.keys(when.depend).some(it => {
                let dependValue: any = when.depend[it];
                let value: any =  formerValue[it];
                return !(utils.isBoolean(dependValue)
                    ? (
                        (utils.isValidValue(value)  == false && dependValue == false)
                         ||(utils.isValidValue(value) == true && dependValue == true) )  
                    : dependValue.includes(value))

                 
            })) {
                return false;
            }
        }

        return true;
    }
    

    private isMustDependShow(control?: any) {
        let formerValue: any = this.props.former.getValue() || {};
        let depend = this.getDependControl(control);
        
        if (Array.isArray(depend)) {
            
            return depend.some((depend: any) => {
                
                return Object.keys(depend).some((it: string) => {
                    let currentValue: any = formerValue[it];
                    let dependValue: any = depend[it];

                    if (utils.isArray(dependValue)) {
                        return !dependValue.includes(currentValue);
                    }
                    return dependValue != currentValue;
                })
            })
        }
        return false;
    } 

    private getDependControl(_control?: any) {
        let control = _control || this.props['x-control'];
        if (Array.isArray(control)) {
            let dependControl: any = control.map(it => {
                let { depend, when } = it;
                if (depend && !when) {
                    return depend;
                }
                return false;
            }).filter(Boolean);

            return dependControl;
        }
        return false;
    }
    private dealControl(value: any, controlList: IFormerControl) {
        let showList: any[] = [];
        let hideList: any[] = [];
        let patchList: any = {};

        if (this.props.onDealControl) {

            controlList.forEach((control: IControl) => {

                let { when = [], hide = [], show = [] } = control;
                // 支持 ['a','b'], true, false, 
                
                if (utils.isArray(when) || utils.isBoolean(when) || utils.isPlainObject(when)) {
                    // 当存在值的时候
                    // 简单判断值是否存在，不做模糊匹配
                    let dependMatch: boolean = this.matchDepend(when);
                    if (utils.isPlainObject(when)) {
                        when = when.value;
                    }

                    let matchValue: boolean =  utils.isBoolean(when) ? utils.isValidValue(value) : when.indexOf(value) > -1;

                    if (matchValue && dependMatch) {
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
        let portalField: any = {};
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
                    slot: portalSplit[1] || 'content'
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
    private getDefaultParentPathName() {
        
        let parentName: string = this.props.fieldName || this.props.fieldKey || this.props.parentPathName || '';
        
        return utils.labelName(parentName);
    }
    private renderObjectNode(children: any[], Child: any) {
        let { value } = this.state;
        let { groupList, portalMap, portalField } = this.traversalProperties();
        let Group = this.getNodeByType('group');
        let GroupItem = this.getSubNodeByType('group');

        children.push(
            <Group key={children.length}>
                {groupList.map((it: { title: string; group: any[] }, rownumber: number) => {

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
                            
                            let leafProps: any = {
                                ...properties,
                                path: prop,
                                index: this.state.index,
                                former: this.props.former,
                                parentPath: this.path,
                                parentPathName:this.getDefaultParentPathName(),
                                runtimeValue: this.state.runtimeValue,
                                value: itemvalue,
                                onDealControl: (control: IControl) => {
                                    this.onDealControl(control)
                                },
                                key: [this.path, prop, index, 'leaf'].join('.'),
                                viewer: this.state.viewer,
                                readonly: this.state.readonly,
                                canmodify: this.state.canmodify,

                                size: this.props.size,
                                rootEmitter: this.props.rootEmitter,
                                childrenControl: childrenControl,
                                onGetDependentParameters: this.props.onGetDependentParameters,
                                onChangeValue: (val: any, type?: string) => {
                                    value[prop] = val;
                                    this.onChangeValue(value, type);
                                    //
                                }
                            };

                            if (portalField[prop]) {
                                portalMap[portalField[prop].target].cache[prop].leafProps = leafProps;
                                return false;
                            }
                            let propsPortalMap = portalMap[prop] && portalMap[prop].map;
                            let titlePortal: any = this.getPortalBySlot(propsPortalMap, 'title')

                            return (
                                <Child
                                    hidden={hidden}
                                    {...properties}

                                    former={this.props.former}
                                    // object items 关闭的时候
                                    onChangeValue={(val: any, type?: string) => {
                                        value[prop] = val;
                                        this.onChangeValue(value, type);
                                    }}
                                    renderTitlePortal={titlePortal.length ? () => {

                                        return titlePortal.map(it => {
                                            if (it.leafProps) {
                                                let { description } = it.leafProps;
                                                return <Leaf
                                                    {...it.leafProps}
                                                    former={this.props.former}
                                                    //portalMap={propsPortalMap}
                                                    size={'small'}
                                                    tooltip={description}
                                                    popupMatchSelectWidth={false}
                                                />
                                            }
                                        })
                                    } : null}
                                    size={this.props.size}
                                    value={itemvalue}
                                    defaultValue={this.getDefaultValue({
                                        type: properties.type
                                    })}
                                    oneOf={this.getObjectItemOneOfNode(prop)}
                                    key={[this.path, prop, index].join('.')}
                                    //需要
                                    onGetDependentParameters={this.props.onGetDependentParameters}
                                ><Leaf
                                        {...leafProps}
                                        portalMap={propsPortalMap}
                                    />
                                </Child>
                            );
                        }

                    }).filter(Boolean);
                    return GroupChildren && GroupChildren.length > 0 ? (
                        <GroupItem
                            key={rownumber}
                            title={it.title}
                            size={this.props.size}
                            //index={rownumber}

                            former={this.props.former}
                            groupType={this.props.groupType}
                            groupMeta={this.props.groupMeta}
                        >
                            {GroupChildren}
                        </GroupItem>
                    ) : null
                })}
            </Group>
        )
    }
    private renderLeaf(props: any) {
        return (
            <Leaf

                key={props.path}
                parentPath={this.path}
                parentPathName={this.getDefaultParentPathName()}
                runtimeValue={this.state.runtimeValue}

                former={this.props.former}
                viewer={this.state.viewer}
                readonly={this.state.readonly}
                canmodify={this.state.canmodify}
                size={this.props.size}
                rootEmitter={this.props.rootEmitter}
                onGetDependentParameters={this.props.onGetDependentParameters}
                {...props}
            />
        )
    }
    private renderMapNode(children: any[], Child: any) {
        let { value, originValue = [] } = this.state;
        // case\3 map
        let keyProperties = this.clone(this.properties.key);
        let valueProperties = this.clone(this.properties.value);

        
        if (keyProperties && valueProperties) {

            originValue.forEach((it: any, index: number) => {

                let prop = this.isArrayMap() ? it[0] : it.key;
                let origin = originValue[index];

                children.push(
                    <Child
                        key={index}
                        size={this.props.size}
                    >
                        {this.renderLeaf({
                            ...keyProperties,
                            path: 'key',
                            value: prop,
                            onChangeValue: (keyVal: any, type?: string) => {
                                if (this.isArrayMap()) {
                                    origin[0] = keyVal;
                                } else {
                                    origin.key = keyVal;
                                }

                                this.onChangeValue(this.getObjectByKeyValue(originValue), type);
                            }
                        })}
                        {this.renderLeaf({
                            ...valueProperties,
                            path: 'value',
                            value: this.isArrayMap() ? it[1] : this.getValueByProps(value[prop], valueProperties, value, prop),
                            onChangeValue: (valVal: any, type?: string) => {
                                if (this.isArrayMap()) {
                                    origin[1] = valVal;
                                } else {
                                    origin.value = valVal;
                                }
                                this.onChangeValue(this.getObjectByKeyValue(originValue), type);
                            }
                        })}
                    </Child>
                )
            });
        } else {
            console.log(this.properties);
            throw new Error('错误的map描述，必须要key，value')
        }
    }
    private renderAssembleDefaultNode(children: any[]) {
        let propertiesKeys: any = Object.keys(this.properties);

        propertiesKeys.forEach(key => {
            let properties: any = this.properties[key];
            children.push(
                this.renderLeaf({
                    ...properties,
                    path: properties.key,
                })
            )
        })
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
                               // index={index}
                            >
                                <Leaf
                                    key={index}
                                    {...items}
                                    path={'' + index}
                                    parentPath={this.path}
                                    parentPathName={this.getDefaultParentPathName()}
                                    size={this.props.size}
                                    //index={index}
                                    moreItems={this.props.moreItems}

                                    former={this.props.former}
                                    viewer={this.state.viewer}
                                    readonly={this.state.readonly}
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
                } else {
                    if (utils.isArray(value) && this.isArrayMap()) {
                        this.renderMapNode(children, Child)
                    }
                }
                break;
            default:
                this.renderAssembleDefaultNode(children)
        }

        return this.renderFeaturesNode(children);
    }
    private isArrayMap() {
        let typeProps = this.props['x-type-props'] || {}
        return typeProps.mode == 'array'
    }
    // 判断是否允许修改
    private isAllowModify() {
        // ['x-modify’]J:'deny'

        return !(utils.isValidValue(this.state.value) && this.state.canmodify && this.leafProps['x-modify'] && ['deny', 'false', false].indexOf(this.leafProps['x-modify']) > -1);
    }

    private renderFeaturesNode(children: any = null, type?: string) {
        let View = this.getNodeByType();
        let ContentPortal: any = this.getPortalBySlot(this.props.portalMap, 'content')

        if (View) {

            let viewProps: any = {
                key: this.leafProps.path || this.leafProps.index || this.leafProps['x-index'],
                ...this.leafProps,
                children: children,
                size: this.props.size,
                errorMessage: this.state.validationMessage,
                former: this.props.former,
                value: this.getValueByProps(this.state.value, { value: this.getDefaultValue() }),
                originValue: this.state.originValue,
                runtimeValue: this.state.runtimeValue,
                disabled: !this.isAllowModify(),
                readonly: !this.isAllowModify(),
                onChangeValue: (val: any, type?: string, originValue?: any) => this.onChangeValue(val, type || 'man', originValue)
            }

            return <>
                {<span className='ui-leaf-error' ref={this.wrapperRef}></span>}
                {this.renderCompactPortal(View, viewProps, ContentPortal)}
            </>
        }
        return null;
    }

    private renderCompactPortal(View: any, viewProps: any, Portal: any) {

        if (Portal.length > 0) {
            // 遍历找出input， select 这种可以组合在一起的
            //let 
            let Compactwrap: any = [];
            let noCompact: any = [];

            Portal.forEach((it) => {

                let { leafProps } = it;
                if (['input', 'select', 'date', 'datetime'].indexOf(leafProps.uiType) > -1) {
                    Compactwrap.push(it)
                } else {
                    noCompact.push(it)
                }
            })

            if (Compactwrap.length) {
                return (
                    <>
                        <Space.Compact>
                            <View {...viewProps} ref={this.wrapperRef} />
                            {this.renderPortal(Compactwrap)}
                        </Space.Compact>
                        {noCompact && this.renderPortal(noCompact)}
                    </>
                )
            } else {

                if (noCompact.length > 0) {
                    return <Space><View {...viewProps} ref={this.wrapperRef} />{this.renderPortal(noCompact)}</Space>
                }
            }

        }


        return <View {...viewProps} ref={this.wrapperRef} />

    }
    private getPortalBySlot(portalMap: any, slot: string) {
        let _portalMap: any = portalMap || this.props.portalMap;
        if (_portalMap) {
            return _portalMap.filter(it => it.slot == slot)
        }
        return []
    }
    private renderPortal(portalMap) {
        if (portalMap) {
            return portalMap.map(it => {

                if (it.leafProps) {
                    let { description } = it.leafProps;
                    return <Leaf {...it.leafProps} former={this.props.former} tooltip={description} popupMatchSelectWidth={false} />
                }
            })
        }
    }
    public render() {
        // 不展示
        if (this.getDependControl()){
            if (this.isMustDependShow()) {
                return null;
            }
        }
        if (this.isFeaturesNode()) {
            //if (this.isType('oneOf')) {
            //  return this.renderOneOfFeaturesNode();
            //}

            return this.renderFeaturesNode();
        }
        return this.renderAssembleNode()
    }
}