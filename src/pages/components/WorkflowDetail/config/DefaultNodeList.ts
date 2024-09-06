import { utils } from '@blocksx/core';

import Encode from '@blocksx/encrypt/lib/encode';
import { buffer } from 'stream/consumers';

export default class DefaultNodeList {
    public static getIdeaNode(props: any) {
        return {
            isNew: false,
            serial: 1,
            icon: 'IdeaSuggestionOutlined',
            color: '#de8a00',
            componentName: 'Thinking.idea',
            
            type: 'go',
            props: {
                icon: 'IdeaCloudUtilityOutlined',

                program: 'Thinking',
                method: 'Decision rules'
            },
            name: this.getUniqName(props.serial || 1),
            ...props,
            locked: true
        }
    }
    public static getUniqName(serial: number) {
        return 'U' + String(serial).padStart(2, '0')
    }
    public static getEmptyNode(props?:any) {
        return {
            name: this.getUniqName(props.serial || 2),
            type: 'empty',
            isNew: false,
            color: '#ccc',
            serial: 2,
            left: 258,
            top: 162,
            icon: '',
            ...props,
            props: {
                program: 'Empty',
            }

        }
    }

    public static getDefaultTriggerClassifyConfig(classify: string, serial: number) {
        
        if (this.triggerClassifyMap[classify]) {
            return this.triggerClassifyMap[classify]( {isNew: true, serial});
        }
    }
    public static triggerClassifyMap: any = {
        thinking: (props: any)=> {
            return this.getIdeaNode(props)
        },
        pages: (props: any) => {
            return {
                isNew: false,
                icon: 'PagesCommonOutlined',
                color: '#1EAEDB',
                componentName: 'Thinking.pages',
                ...props,
                type: 'go',
                props: {
                    icon: 'AutoCloudUtilityOutlined',
                    dynamic: true,
                    program: 'Pages',
                    method: 'Linking Page'
                },
                floating: true,
                name: this.getUniqName(props.serial)
            }
        },
        timer: (props: any) => {
            return {
                isNew: false,
                icon: 'FieldTimeOutlined',
                color: '#B400C9',
                componentName: 'Thinking.timer',
                ...props,
                type: 'go',
                props: {
                    icon: 'SyncOutlined',
                    
                },

                floating: true,
                name: this.getUniqName(props.serial)
            }
        },
        apis: (props: any)=> {
            return {
                isNew: false,
                icon: 'ApiOutlined',
                color: '#6DB33F',
                componentName: 'Thinking.openapi',
                ...props,
                type: 'go',
                props: {
                    icon: 'AutoCloudUtilityOutlined',
                    dynamic: true,
                    program: 'OpenAPI',
                    method: 'Linking OpenAPI'
                },

                floating: true,
                name: this.getUniqName(props.serial)
            }
        }
    }


    public static getDefaultValue(classify: string, id: any) {
        if (this.classifyMap[classify]) {
            return this.classifyMap[classify](this.getUniqName(id))
        } 
        return {};
    }
    public static classifyMap:any =  {
        thinking: () => {

            return {
                nodes: [
                    this.getIdeaNode({left: 40, top: 162}),
                    {
                        name: 'U02',
                        componentName: 'Thinking.think',
                        type: 'router',
                        isNew: false,
                        icon: 'ThinkingUtilityOutlined',
                        color: '#4d53e8',
                        left: 258,
                        top: 162,
                        serial: 2,
                        props: {
                            icon: 'AiUtilityOutlined',
                            program: 'Thinking',
                            method: 'Decision-based routing'
                        },
                        locked: true
                    },
                    this.getEmptyNode({
                        left: 458,
                        top: 162,
                        serial: 3
                    })
                ],
                connectors: [
                    {
                        source: 'U01',
                        target: 'U02',
                        props: {}

                    },
                    {
                        source: 'U02',
                        target: 'U03',
                        props: {}
                    }
                ]
            }
        },
        'function': () => {
            return {
                nodes: [
                    {
                        name: 'U01',
                        type: 'go',
                        isNew: false,
                        icon: 'StartCircleUtilityFilled',
                        color: '#FF7B15',
                        componentName: 'Thinking.start',
                        left: 40,
                        props: {
                            icon: 'ConfigurationUtilityOutlined',
                            program: 'Start',
                            method: 'Input Parameters'
                        },
                        serial: 1,
                        top: 162,
                        locked: true
                    },
                    {
                        name: 'U02',
                        type: 'router',
                        icon: 'DatasourceMiniDataOutlined',
                        componentName: 'FlowControl.buffer',
                        color: window['__main_bg_color'],
                        props: {
                            icon: 'DatasourceDefaultDataOutlined',
                            program: 'Buffer',
                            method: 'Conditional Buffer'
                        },
                        top: 162,
                        left: 258,
                        serial:2,
                        locked: true
                    },
                    this.getEmptyNode({
                        left: 458,
                        top: 162,
                        serial: 3
                    })
                ],
                connectors: [
                    {
                        source: 'U01',
                        target: 'U02',
                        props: {}
                    },
                    {
                        source: 'U02',
                        target: 'U03',
                        props: {}
                    }
                ]
            }

        },
        'trigger': () => {

            return {
                nodes: [
                    {
                        name: "U01",
                        type: 'go',
                        isNew: false,
                        color: '#ccc',
                        left: 40,
                        props: {
                            program: 'Trigger',
                        },
                        serial: 1,

                        icon: 'PlusOutlined',
                        top: 162,
                        locked: true
                    },
                    {
                        name: 'U02',
                        type: 'router',
                        icon: 'DatasourceMiniDataOutlined',
                        componentName: 'FlowControl.buffer',
                        color: window['__main_bg_color'],
                        props: {
                            icon: 'DatasourceDefaultDataOutlined',
                            program: 'Buffer',
                            method: 'Conditional Buffer'
                        },
                        top: 162,
                        left: 258,
                        serial:2,
                        locked: true
                    },
                    this.getEmptyNode({
                        left: 458,
                        top: 162,
                        serial: 3
                    })
                ],
                connectors: [
                    {
                        source: 'U01',
                        target: 'U02',
                        props: {}
                    },
                    {
                        source: 'U02',
                        target: 'U03',
                        props: {}
                    }
                ]
            }

        }

    }
}
