import React from 'react';
import classnames from 'classnames';
import { IFormerBase } from '../../typings';
import { Button, Space, Tooltip } from 'antd';
import * as Icons from '../../../Icons';
import './style.scss';

import Scope from '../scope';
import Input from '../input';
import Select from '../select';

import './style.scss';

interface FormerListProps extends IFormerBase {
    value: any;
    former: any;
    size: any;
    onChangeValue: (value: any) => void;
    errorMessage?: string;
}

interface FormerListState {
    value: any;
    errorMessage?: string;
}

export default class FormerList extends React.Component<FormerListProps, FormerListState> {
    public static defaultProps = {
        size: 'small'
    }
    public constructor(props: FormerListProps) {
        super(props);
        this.state = {
            value: props.value || [],
            errorMessage: props.errorMessage
        }
    }

    public UNSAFE_componentWillReceiveProps(nextProps: FormerListProps) {
        if (nextProps.value !== this.state.value) {
            this.setState({
                value: nextProps.value
            })
        }
        if (nextProps.errorMessage !== this.state.errorMessage) {
            this.setState({
                errorMessage: nextProps.errorMessage
            })
        }
    }

    public getProps() {
        return this.props['props'] || this.props['x-type-props'] || {};
    }

    private onChangeValue(value: any, index: number) {
        let { value: _value = [] } = this.state;
        _value[index] = value;

        this.setState({
            value: _value
        })

        this.props.onChangeValue(_value)
    }

    private renderItem(item: any, index: number) {
        let props: any = this.getProps();

        switch(props.type) {
            case 'scope':
                return <Scope value={item} onChangeValue={(value: any)=> {
                    this.onChangeValue(value, index);
                }} former={this.props.former} {...props.props} size={this.props.size} />;
            case 'select':
                return <Select value={item} onChangeValue={(value: any)=> {
                    this.onChangeValue(value, index);
                }} {...props.props}  size={this.props.size} />;
            default:
                return <Input value={item} onChangeValue={(value: any)=> {
                    this.onChangeValue(value, index);
                }} {...props.props} size={this.props.size} />;

        }

    }
    private addItem = (index?: number) => {
        let { value: _value = [] } = this.state;
        if (index === undefined) {
            _value.push('');
        } else {
            _value.splice(index, 0, '');
        }

        this.setState({
            value: _value
        })
    }
    private removeItem = (index: number) => {
        let { value: _value = [] } = this.state;
        _value.splice(index, 1);

        this.setState({
            value: _value
        })

        this.props.onChangeValue(_value)
    }
    public render() {
        let { value = [] } = this.state;
        return (
            <Tooltip title={this.state.errorMessage}>
                <div className={classnames({
                    "former-list": true,
                    "former-list-error": !!this.state.errorMessage
                })}>
                    {value.map((it, index) => {
                        return (
                            <div className="former-list-item" key={index}>
                                <Space.Compact>
                                    <Button onClick={()=> {
                                        this.addItem(index);
                                    }} icon={<Icons.PlusOutlined />} />
                                    {this.renderItem(it, index)}
                                    <Button onClick={()=> {
                                        this.removeItem(index);
                                    }} icon={<Icons.MinusOutlined />} />
                                </Space.Compact>
                            </div>
                        )
                    })}
                    
                    <div className="former-list-add" onClick={()=> this.addItem()}>
                    Add an item.
                    </div>
                </div>
            </Tooltip>
        )
    }
}