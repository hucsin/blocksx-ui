import React from 'react';

import { Button } from 'antd';
import { Plugin, Workspace, Datasource, Record, DBQuery, DBQueryMini, Setting } from '../components/Icons'

import EditorLayoutContainer from '../components/Editor/LayoutContainer';
import EditorResourceTree from '../components/Editor/ResourceTree';
import EditorWorkspace from '../components/Editor/Workspace';

import { StateX } from '../components/StateX/index';
import { EditorLayoutState } from '../components/Editor/states';

import './layout.scss';

let sourceTree: any[] =[
    {
        key: 'resource-1',
        name: '@localhost',
        type: 'datasource',
        record: {
            type: 'MySQL'
        },
        children: [
            {
                key: 'information_schema',
                name: 'information_schema',
                type: 'schema',
                children: [// 表
                    {
                        key: 'table_11',
                        name: 'FILES',
                        type: 'table',
                        children: [
                            {
                                key: 'f1123',
                                name: 'id',
                                type: 'field',
                                record: {
                                    type: 'int'
                                }
                            },
                            {
                                key: 'f132',
                                name: 'name',
                                type: 'field',
                                record: {
                                    type: 'int'
                                }
                            },
                            {
                                key: 'f133',
                                name: 'username',
                                type: 'field',
                                record: {
                                    type: 'int'
                                }
                            },
                            {
                                key: 'f143',
                                name: 'username.name',
                                type: 'index',
                                record: {
                                    type: 'unin',
                                    fields: [
                                        'username',
                                        'name'
                                    ]
                                }
                            }
                        ]
                    },
                    {
                        key: 'table_12',
                        name: 'EVENTS',
                        type: 'table',
                    },
                    {
                        key: 'table_13',
                        name: 'GLOBAL_STATUS',
                        type: 'table',
                    },
                    {
                        key: 'table_14',
                        name: 'INNODB_CMP',
                        type: 'table',
                    },
                    {
                        key: 'table_15',
                        name: 'INNODB_CMP_PER_INDEX',
                        type: 'table',
                    },
                    {
                        key: 'table_16',
                        name: 'INNODB_CMP_RESET',
                        type: 'table',
                    }
                ]
            }, 
            {
                key: 'mysql_1',
                name: 'mysql',
                type: 'schema'
            },
            {
                key: 'mysql_3',
                name: 'performance_schema',
                type: 'schema'
            },
            {
                key: 'mysql_4',
                name: 'sys',
                type: 'schema'
            },
            {
                key: 'mysql_5',
                name: 'test',
                type: 'schema'
            }
        ]
    },
    {
        type: 'datasource',
        key: 'resource-pg-2',
        name: '@localhost',
        
        record: {
            type: 'PostgreSQL'
        },
        children: [
            {
                key: 'postge',
                name: 'gostge',
                type: 'schema',
                children: [// 表
                    {
                        key: 'table_1311',
                        name: 'FILES',
                        type: 'table',
                    },
                    {
                        key: 'table_12122',
                        name: 'EVENTS',
                        type: 'table',
                    },
                    {
                        key: 'table_122333',
                        name: 'GLOBAL_STATUS',
                        type: 'table',
                    },
                    {
                        key: 'table_1344',
                        name: 'INNODB_CMP',
                        type: 'table',
                    },
                    {
                        key: 'table_1535',
                        name: 'INNODB_CMP_PER_INDEX',
                        type: 'table',
                    },
                    {
                        key: 'table_1633',
                        name: 'INNODB_CMP_RESET',
                        type: 'table',
                    }
                ]
            }, 
            {
                key: 'mysql_113',
                name: 'mysql',
                type: 'schema'
            },
            {
                key: 'mysql_322',
                name: 'performance_schema',
                type: 'schema'
            },
            {
                key: 'mysql_412',
                name: 'sys',
                type: 'schema'
            },
            {
                key: 'mysql_521',
                name: 'test',
                type: 'schema'
            }
        ]
    }
]


let ct:any = StateX.findModel(EditorLayoutState)

export default class LayoutContainerDemo extends React.Component {
    public constructor(props) {
        super(props)
    }
    public render() {
        /*
         <button onClick ={()=> {
                                        ct.showResource()
                                    }}>资源</button>
                                    <button onClick ={()=> {
                                        
                                        ct.showResourceExtend()
                                    }}>扩展</button>
                                    <button onClick ={()=> {
                                        ct.foldResource()
                                    }}>隐藏</button>
        */
        return (
            <div className='layout'>
                <div  className='header'>
                    <DBQuery/> <DBQueryMini/>
                    <div></div>
                </div>
                <div className="content">
                    <EditorLayoutContainer
                                LeftChinampa={<div className='nav' style={{height: '100%'}}>
                                    <Button className='select' size="small" type="text"><Workspace/></Button>
                                    <Button size="small" type="text"><Datasource/></Button>
                                    <Button size="small" type="text"><Record/></Button>
                                    <Button size="small" type="text"><Plugin/></Button>

                                    <Button size="small" className='bottom' type="text"><Setting/></Button>

                                </div>}
                                RightChinampa={<div style={{height: '100%', background: '#fcc'}}>left<br/>c</div>}
                                Resource={<EditorResourceTree namespace='resource' tree={sourceTree} />}
                                Product={<EditorResourceTree namespace='product' tree={sourceTree.slice(1,2)} />}
                                Workspace={<EditorWorkspace/>}
                                Feedback={<div>feedback</div>}
                                StatusBar={<div className='statusbar' style={{height: '30px', background:'#fff',borderTop: '1px solid #e0e2ec'}}>StatusBar</div>}
                                ResourceExtend={<div>resoutextend</div>}
                            />
                </div>
            </div>

        )
    }
}
