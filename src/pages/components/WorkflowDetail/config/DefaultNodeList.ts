import { utils } from '@blocksx/core';

import Encode from '@blocksx/encrypt/lib/encode';
import { buffer } from 'stream/consumers';

export default class DefaultNodeList {
    public static getIdeaNode(name: string, props?: any) {
        return {
            isNew: false,
            icon: 'IdeaSuggestionOutlined',
            color: '#de8a00',
            componentName: 'Thinking.idea',
            ...props,
            type: 'go',
            props: {
                icon: 'IdeaCloudUtilityOutlined',

                program: 'Thinking',
                method: 'Decision rules'
            },
            serial: 1,
            locked: true,
            name: name
        }
    }
    public static getEmptyNode(name: string, props?:any) {
        return {
            name: name,
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
    public static getUniqName(id: any) {
        return utils.uniq(Encode.encode('mini#' + id));
    }

    public static getDefaultTriggerClassifyConfig(classify: string, id: any) {
        
        if (this.triggerClassifyMap[classify]) {
            return this.triggerClassifyMap[classify](this.getUniqName(id), {isNew: true});
        }
    }
    public static triggerClassifyMap: any = {
        thinking: (uniq:any, props?: any)=> {
            return this.getIdeaNode(uniq, props)
        },
        pages: (uniq: any, props?: any) => {
            return {
                isNew: false,
                icon: 'PagesCommonOutlined',
                color: '#1EAEDB',
                componentName: 'Thinking.pages',
                ...props,
                type: 'go',
                props: {
                    icon: 'AutoCloudUtilityOutlined',
                    
                    program: 'Pages',
                    method: 'Linking Page'
                },
                floating: true,
                name: uniq
            }
        },
        timer: (uniq: any, props?: any) => {
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
                name: uniq
            }
        },
        apis: (uniq: any, props?: any)=> {
            return {
                isNew: false,
                icon: 'ApiOutlined',
                color: '#6DB33F',
                componentName: 'Thinking.openapi',
                ...props,
                type: 'go',
                props: {
                    icon: 'AutoCloudUtilityOutlined',

                    program: 'OpenAPI',
                    method: 'Linking OpenAPI'
                },

                floating: true,
                name: uniq
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
        thinking: (uniq: string) => {
            let sourceNodeName: string = uniq + '1';
            let targetNodeName: string = uniq + '2';
            let emptyNodeName: string = uniq + '3';

            return {
                nodes: [
                    this.getIdeaNode(sourceNodeName, {left: 40, top: 162}),
                    {
                        name: targetNodeName,
                        componentName: 'Thinking.router.think',
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
                    this.getEmptyNode(emptyNodeName, {
                        left: 458,
                        top: 162,
                        
                        serial: 3
                    })
                ],
                connectors: [
                    {
                        source: sourceNodeName,
                        target: targetNodeName,
                        props: {}

                    },
                    {
                        source: targetNodeName,
                        target: emptyNodeName,
                        props: {}
                    }
                ]
            }
        },
        'function': (uniq: string) => {
            let startName: string = uniq + '1';
            let bufferName: string = uniq + '2';
            let emptyName: string = uniq + '3';

            return {
                nodes: [
                    {
                        name: startName,
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
                        name: bufferName,
                        type: 'router',
                        icon: 'DatasourceMiniDataOutlined',
                        componentName: 'Thinking.buffer',
                        color: window['__main_bg_color'],
                        props: {
                            icon: '',
                            program: 'Buffer',
                            method: 'Conditional Buffer'
                        },
                        top: 162,
                        left: 258,
                        serial:2,
                        locked: true
                    },
                    this.getEmptyNode(emptyName, {
                        left: 458,
                        top: 162,
                        serial: 3
                    })
                ],
                connectors: [
                    {
                        source: startName,
                        target: bufferName,
                        props: {}
                    },
                    {
                        source: bufferName,
                        target: emptyName,
                        props: {}
                    }
                ]
            }

        }

    }
}
