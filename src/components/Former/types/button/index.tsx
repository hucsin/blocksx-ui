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
import { Button, Popover, Space, List } from 'antd';
import * as Icons from '../../../Icons';
import Avatar from '../avatar';

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
            props: props['x-type-props']
        };

        if (typeProps.actionURI) {
            this.actionRequestHelper = SmartRequest.createPOST(typeProps.actionURI)
        }

        if (typeProps.viewURI) {
            this.viewRequestHelper = SmartRequest.createPOST(typeProps.viewURI)
        }
    }
    public componentDidMount(): void {

        let { props } = this.state;
        let { rowKey = 'id' } = props;

        this.viewRequestHelper(this.getDefaultParams({
            actionType: 'init',
            value: this.state.value
        })).then(({value, values = []}: any) => {

            if (Array.isArray(values)) {
                // 只有一条的时候绑定
                if (!value && (values.length == 1)) {
                    value = values[0]
                } else {
                    this.setState({
                        values: values
                    })
                }
            }

            if (value && value[rowKey]) {    
                this.setState({
                    ...value,
                    value: value[rowKey]
                })
                // TODO 
                if (this.props.former) {
                    this.props.former.resetSafeValue({
                        ...value,
                        //[`${this.props.fieldName}`]: value[rowKey]
                    })
                }
            }
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
                    {hasValue ? <Icons.SwapOutlined/>:<Icons.UnlinkUtilityOutlined/> }
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
            this.actionRequestHelper({
                ...params,
                actionType: 'bind'
            }).then((data) => {
                console.log(data)
            })
        }
    }
    private renderValuesButton() {
        let { values,props } = this.state;

        return (
            <List
                itemLayout="horizontal"
                dataSource={values}
                renderItem={(item:any, index) => (
                    <List.Item>
                        <List.Item.Meta
                            avatar={<Avatar icon={props.icon} color = {props.color}/>}
                            title={<Space>{item.title}<span>{item.subtitle}</span></Space>}
                            description={item.description}
                        />
                    </List.Item>
                )}
            />

        )
      
    }
    public renderMetaButton() {
        let {props} = this.state;
        let MetaButton: any = (
            <div className={classnames({
                    'ui-meta-button': true,
                    'ui-meta-empty': !this.state.value
                })}
                onClick={() => {
                    this.props.former.validationValue((val) => {
                        this.doMetaAction(val)
                    }, {
                        noValidationField: this.props.fieldName
                    })
                }}
            >
                <div className='ui-meta-button-meta'>
                    <div className='ui-meta-avatar'>
                        {this.renderAvatar()}
                    </div>
                    <div className='ui-meta-content'>
                        <h3>{this.state.title}<span>{this.state.subtitle}</span></h3>
                        <p>{this.state.description} {!this.state.value && this.state.emptyNotice}</p>
                    </div>
                </div>
            </div>
        );

            
        return this.state.values ? (
            <Popover title={props.valuesTitle || 'CHOOSE ITEM'} overlayClassName="ui-former-button-metapop" content={this.renderValuesButton()}>
                {MetaButton}
            </Popover>
        ) : MetaButton
        
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