import React from 'react';
import { utils } from '@blocksx/core';
import { Button, message } from 'antd';
import EditorResourceState from '@blocksx/ui/Editor/states/Resource';
import { StateX } from '@blocksx/ui/StateX';

import { CheckCircleOutlined, CloseCircleOutlined } from '@blocksx/ui/Icons'

import './style.scss';

const omit = require('object.omit');

const defaultPortMap = {
    MySQL: '3306',
    PostgreSQL: '5432'
}



class ExtraContentComponent extends React.Component<{former: any}, {
    showNotice?: string,
    testing?: boolean,
    tested?: boolean
}> {
    private former: any;
    public constructor(props) {
        super(props);
        
        this.state = {
            showNotice: '',
            testing: false
        }
        
        this.former = props.former;
        
    }
    private init() {
        let value = this.former.state.value || {};
        if (!value.id) {
            this.disabed();
        } 
        this.former.emitter.on('changeValue', () => {
            this.disabed();
        })

    }
    public componentDidMount() {
        this.init()
    }
    private disabed() {
        this.former.doDisabledButton(true);
        this.setState({
            showNotice: '请先测试通过之后再保存'
        })
    }
    public doTest =()=> {
        const resourceState = StateX.findModel(EditorResourceState, 'resource');
        this.former.validationValue(() => {
            let { configuration = {} } = this.former.state.value || {};
            this.setState({
                testing: true
            })
            
            resourceState.doAction('test', configuration.driver || {}).then((result: any) => {
                this.tested(result.tested , result.message || '');
                
            }, (e) => {
                console.log(e)
                this.tested(false)
            })
        })
    }
    private tested(tested: boolean, message?: string) {
        
        this.former.doDisabledButton(!tested);
        
        this.setState({
            testing: false,
            tested: tested,
            showNotice: tested ? '' : utils.isUndefined(message) ? '连接测试发生错误,请修改后重试!' : message
        })
    }
    public render() {
        return (
            <span className='former-datasource-extra'>
              
               {this.state.showNotice &&<span className='t'>{this.state.showNotice}</span>}
               <Button onClick={this.doTest} loading={this.state.testing} type="text" size='small'>测试连接</Button>
               {!utils.isUndefined(this.state.tested) && (this.state.tested ? <CheckCircleOutlined/> : <CloseCircleOutlined/>)} 
            </span>
        )
    }
}

export default (type: string) => {
    return {
        type: 'object',
        props: {
            title: `${type || ''}数据库维护`,
            logo: type,
            extraContent: (former: any) => {
                return <ExtraContentComponent former={former} />
            },
            doSave: (value: any, former: any) => {
                const resourceState = StateX.findModel(EditorResourceState, 'resource');
                // 修改
                if (value.id) {
                    resourceState.doAction('update', {
                        $where: { id: value.id},
                        $updater: omit(value, ['id'])
                    }).then(()=> {
                        former.onCloseLayer();
                        resourceState.reload();
                        message.success('数据源更新成功,元数据同步中!')
                    }).catch((e) => {
                        console.log(e)
                        message.error('网络错误,请修改后重试')
                    })

                //  新增    
                } else {
                    resourceState.doAction('create', value).then((result: any) => {
                        if (result.id) {
                            former.onCloseLayer();
                            resourceState.reload();
                            message.success('数据源新建成功,元数据同步中!')
                        } else {
                            message.error(result.meesage || '网络错误,请修改后重试')
                        }
                        
                    }, (e) => {
                        console.log(e)
                        message.error('网络错误,请修改后重试')
                    })
                }
            }
        },
        properties: {
            type: {
                type: 'string',
                'x-index': 0,
                defaultValue: type.toLowerCase(),
                'x-type': 'hidden'
            },
            version: {
                type: 'string',
                'x-index': 1,
                defaultValue: '*.*.*',
                'x-type': 'hidden'
            },
            name: {
                type: 'string',
                'x-index': 2,
                'x-validation': {
                    required: true
                },
                'x-type': 'input',
                'title': '名称',
                'x-type-props': {
                    placeholder: '数据源名称',
                    maxLength: 32
                }
            },
            description: {
                type: 'string',
                'x-index': 3,
                'x-colspan': 2,
                'x-type': 'textarea',
                'title': '备注',
                'x-type-props': {
                    placeholder: '数据源备注',
                    maxLength: 64
                }
            },
            configuration: {
                'x-index': 4,
                type: 'object',
                'x-colspan': 2,
                properties: {
                    driver: {
                        type: 'object',
                        'x-colspan': 2,
                        properties: {
                            type: {
                                type: 'string',
                                'x-index': 0,
                                defaultValue: type.toLowerCase(),
                                'x-type': 'hidden'
                            },
                            version: {
                                type: 'string',
                                'x-index': 1,
                                defaultValue: '*.*.*',
                                'x-type': 'hidden'
                            },
                            host: {
                                type: 'string',
                                'x-index': 1,
                                'x-validation': {
                                    required: true
                                },
                                'x-group': '连接参数',
                                'x-type': 'input',
                                
                                'title': '主机',
                                'x-type-props': {
                                    placeholder: '数据库服务主机,如:localhost'
                                }
                            },
                            port: {
                                type: 'string',
                                'x-index': 2,
                                'x-validation': {
                                    required: true
                                },
                                'x-type': 'input',
                                'x-group': '连接参数',
                                'title': '端口',
                                'x-type-props': {
                                    placeholder: '数据库服务端口,如:' + defaultPortMap[type] 
                                }
                            },
                            database: {
                                type: 'string',
                                'x-index': 6,
                
                                'x-type': 'input',
                                'x-group': '连接参数',
                                'title': '数据库'
                            },
                            user: {
                                type: 'string',
                                'x-index': 4,
                                'x-validation': {
                                    required: true
                                },
                                'x-type': 'input',
                                'x-group': '连接参数',
                                'title': '用户名',
                                'x-type-props': {
                                    placeholder: '数据库用户'
                                }
                            },
                            password: {
                                type: 'string',
                                title: '密码',
                                'x-validation': {
                                    required: true
                                },
                                'x-index': 5,
                
                                'x-type': 'input',
                                'x-group': '连接参数',
                                'x-type-props': {
                                    type: 'password',
                                    placeholder: '数据库用户密码'
                                }
                            }
                        }
                    }

                }
            }

        }
    }
}