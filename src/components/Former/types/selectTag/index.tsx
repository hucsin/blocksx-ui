import React, { PureComponent } from 'react';
import { Request } from '@blocksx/swap';
import classnames from 'classnames';
import './style.scss';

import { IFormerBase } from '../../typings';

import { PlusCircleOutlined } from '../../../Icons'

import { Select, Button, Divider, Input, Spin, Space } from 'antd';

interface SelectTagProp extends IFormerBase {
    size?: any;
    // 限制比例，宽/高
    onChangeValue: Function;
    // x-type-props
    //             .fetchTagURL
    //             .increaseTagURL
}

interface SelectTagState {
    value?: any;
    props: any;
    loading: boolean;
    addLoading: boolean;

    dataSource: any[],
    filterValue: any;

}

/**
 * 目前版本只支持：
 * 1、tag数量较小 < 500
 * 2、单纯tag模式
 * select tag 模式
 * 选择标签模式
 * 
 * 需要支持两个接口，
 * 
 * 1、数据接口
 * 2、新增接口，不支持删除
 */
export default class SelectTag extends PureComponent<SelectTagProp, SelectTagState> {
    public constructor(props: SelectTagProp) {
        super(props);
        this.state = {
            props: props['x-type-props'] || {},
            value: props.value,
            loading: false,
            dataSource: [],
            filterValue: '',
            addLoading: false
        }
    }


    public componentDidMount() {

        this.fetchData();
    }

    private setLoading(loading: boolean) {
        this.setState({
            loading: loading
        })
    }

    private fetchData(data?: any) {
        let { fetchTagURL, tagKey = 'tag' } = this.state.props;

        if (fetchTagURL) {
            this.setLoading(true);
            Request.auto(fetchTagURL, {}).then((data: any) => {
                this.setState({
                    dataSource: data.map((it: any) => {
                        return {
                            label: it[tagKey] || '--'
                        }
                    }),
                    loading: false
                })
            })
        }
    }
    private onChange = (value: any) => {

        this.setState({
            value: value
        });

        this.props.onChangeValue(value);
    }
    private renderChildren() {
        let dataSource: any[] = this.state.dataSource;

        return dataSource.map((it => {
            let value: any = it.value || it.key || it.label;
            let label: any = it.label || it.name;

            return (
                <Select.Option key={value} value={value}>{label}</Select.Option>
            )
        }))
    }
    private hasTag(datasource: any[], tag: any) {

        return datasource.filter(it => {
            return it.label == tag;
        }).length > 0
    }
    private addTag = () => {

        let { increaseTagURL, tagKey = 'tag' } = this.state.props;
        let filterValue: any = this.state.filterValue;
        let datasource: any[] = this.state.dataSource;

        // 不存在的时候才能新增
        if (!this.hasTag(datasource, filterValue)) {

            this.setState({
                addLoading: true
            })

            Request.auto(increaseTagURL, {
                [`${tagKey}`]: filterValue
            }).then(() => {

                datasource.unshift({
                    label: filterValue
                })

                this.onChange(filterValue);
                this.setState({
                    addLoading: false,
                    dataSource: datasource
                })
            })
        }

    }
    public render() {
        return (
            <Select
                {...this.props['x-type-props']}
                className={classnames({
                    'former-selectTag': true
                })}
                onFocus={() => {
                    this.fetchData();
                }}
                showSearch
                popupClassName="former-selectTag-list"
                disabled={this.props.disabled}
                loading={this.state.loading}
                onChange={this.onChange}
                size={this.props.size}
                value={this.state.value}
                optionFilterProp="children"
                onSearch={(v) => {
                    this.setState({
                        filterValue: v
                    })
                }}
                onDropdownVisibleChange={() => {
                    this.setState({
                        filterValue: ''
                    })
                }}
                filterOption={(input: any, option: any) => {
                    return option.children.indexOf(input) > -1
                }
                }
                dropdownRender={(menu: any) => {
                    return (
                        <Spin spinning={this.state.addLoading}>
                            {menu}
                            <Divider style={{ margin: '4px 0' }} />
                            <p>标签不存在？新增</p>
                            <Space.Compact>
                                <Input
                                    size={this.props.size}
                                    style={{ width: 'calc(100% - 35px)' }}
                                    placeholder='请输入标签'
                                    value={this.state.filterValue}
                                    onChange={(e: any) => this.setState({ filterValue: e.target.value })}
                                />
                                <Button
                                    type="primary"
                                    size={this.props.size}
                                    onClick={this.addTag}
                                >
                                    <PlusCircleOutlined />
                                </Button>
                            </Space.Compact>
                        </Spin>
                    )
                }}
            >
                {this.renderChildren()}
            </Select>
        )
    }
}