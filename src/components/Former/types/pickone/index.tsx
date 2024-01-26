/**
 * 1v1 绑定, 非rely场景
 */
import React from 'react';
import classnames from 'classnames';
import i18n from '@blocksx/i18n';
import { IFormerBase } from '../../typings';
import { Input, Drawer, Alert } from 'antd';
import * as Icons from '../../../Icons';

import Tabler from '../../../Tabler';

import './style.scss';

interface FormerPickProps extends IFormerBase {
    value: any;
    size: any;
    notice?: string;
    fields?: any;
    searcher?: any;
    disabled?: boolean;
    onChangeValue: Function;
}

interface FormerPickState {
    open: boolean;
    labelValue: any;

    value: any;
}
class FormerPickViewer extends React.Component<FormerPickProps> {
    private labelValueMap: any;
   
    public constructor(props: FormerPickProps) {
        super(props);
        this.labelValueMap = this.getLabelValueMap(props.fields);
    }
    private getLabelValueMap(fields: any) {
        
        return {
            value: fields.find(field => field.labelvalue),
            label: fields.find(field => field.labelname)
        }
    }

    public render () {
        let value: any = this.props.value || {};
        let renderValue: any = [];
        let valueKey:string = this.labelValueMap.value ? this.labelValueMap.value.key : '';
        let labelKey: string= this.labelValueMap.label ? this.labelValueMap.label.key : '';

        if (valueKey && value[valueKey]) {
            renderValue.push(value[valueKey])
        }
        if (labelKey && value[labelKey]) {
            renderValue.push(value[labelKey])
        }
        return renderValue.join('/')
    }
}

export default class FormerPick extends React.Component<FormerPickProps, FormerPickState> {
    public static Viewer: any = FormerPickViewer;
    private searbarRef: any;
    private labelValueMap: any;
    public static defaultProps = {
        notice: 'Select a record from the data in the table below, and the system will automatically establish a binding relationship!'
    }
    public constructor(props: FormerPickProps) {
        super(props);
        
        this.labelValueMap = this.getLabelValueMap(props.fields);
        this.state = {
            open: false,
            value: props.value,
            labelValue: this.getLabelValue(props.value || {}),

        }

        this.searbarRef = React.createRef();
    }
    private getLabelValueMap(fields: any) {
        
        return {
            value: fields.find(field => field.labelvalue),
            label: fields.find(field => field.labelname)
        }
    }
    private getLabelValue(val: any) {
        let { value = {}, label = {} } = this.labelValueMap;

        return {
            value: val[value.key || 'value'],
            label: val[label.key || 'label']
        }
    }
    private onSelected(value: any) {
        this.setState({
            labelValue: this.getLabelValue(value),
            value: value,
            open: false
        })

        if (this.props.onChangeValue) {
            this.props.onChangeValue(value)
        }
    }
    private getFields() {
        return this.props.fields.filter(field => {
            return (field.column && field.major !== false) || field.major
        })
    }
    private getNoticeMessage() {
        return this.props.notice
    }
    private renderContent() {
        let typeProps: any = this.props['x-type-props'] || this.props['props'];
        let value: any = this.state.value;
        return (
            <div className='ui-pickone-wrapper'>
                <Alert message={this.getNoticeMessage()} type='warning' />
                <Tabler
                    key={2}
                    multilineEdit={false} 
                    fields={this.getFields()}
                    searcher={this.props.searcher}
                    dataSource={typeProps.onPage}
                    size='small'
                    selectedRowKeys={value? [value.id]: []}

                    rowOperate={[
                        {
                            key: 'Selected',
                            type: '',
                            name: 'Selected',
                            motion: (params: any) => {
                                this.onSelected(params)
                            }
                        }
                    ]}
                    auth={
                        {
                            view: false,
                            edit: false,
                            remove: false
                        }
                    }
                    noOperater={true}
                />
            </div>
            
        )
    }

    private renderTitle() {
        return i18n.t('Bind the {name} records', this.props)
    }
    private renderExtra() {
        return (
            <span ref={this.searbarRef}></span>
        )
    }
    private renderDrawer() {
        return (
            <Drawer
                title={this.renderTitle()}
                className='ui-former fromer-pick-wrapper'
                width={600}
                extra={this.renderExtra()}
                size='large'
                open={this.state.open}
                onClose={(v: any)=>{
                    this.setState({
                        open: false
                    })
                }}
            >
                {this.renderContent()}
                
            </Drawer>
        )
    }
    private onSelect = ()=> {
        this.setState({
            open: true
        })
    }
    private getDisplayValue() {
        let labelValue: any = this.state.labelValue;
        let displayValue: any = [];
        
        if (labelValue.value) {
            displayValue.push(labelValue.value)
        }
        if (labelValue.label) {
            displayValue.push(labelValue.label)
        }
        
        return displayValue.join('/');
    }
    public render() {
        return (
            <div className='former-pick'>
                {this.renderDrawer()}
                <span onClick={this.onSelect} >
                    <Input 
                        key={1}
                        readOnly
                        size='small'
                        
                        suffix={<Icons.IPick/>} 
                        value={this.getDisplayValue()}
                        placeholder={'Binding records'}
                    />
                </span>
            </div>
        )
    }
}

