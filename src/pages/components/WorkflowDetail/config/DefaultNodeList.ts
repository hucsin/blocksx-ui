import { utils } from '@blocksx/core';

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
                icon: 'IdeaCloudUtilityOutlined'
            },
            locked: true,
            name: name
        }
    }
    public static getUniqName(id: any) {
        return utils.uniq(utils.hashcode('Flow#' + id));
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
                icon: 'PageCommonOutlined',
                color: '#1EAEDB',
                componentName: 'Thinking.pages',
                ...props,
                type: 'go',
                props: {
                    icon: 'AutoCloudUtilityOutlined',
                    
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
                        props: {
                            icon: 'AiUtilityOutlined'
                        },
                        locked: true
                    }
                ],
                connectors: [
                    {
                        source: sourceNodeName,
                        target: targetNodeName,
                        props: {}

                    }
                ]
            }
        },
        'function': (uniq: string) => {
            let sourceNodeName: string = uniq + '1';
            let targetNodeName: string = uniq + '2';

            return {
                nodes: [
                    {
                        name: sourceNodeName,
                        type: 'go',
                        isNew: false,
                        icon: 'StartCircleUtilityFilled',
                        color: '#FF7B15',
                        componentName: 'Thinking.start',
                        left: 40,
                        props: {
                            icon: 'ConfigurationUtilityOutlined'
                        },
                        top: 162,
                        locked: true
                    },
                    {
                        name: targetNodeName,
                        type: 'empty',
                        isNew: false,
                        color: '#ccc',
                        left: 258,
                        top: 162,
                        icon: ''
                    }
                ],
                connectors: [
                    {
                        source: sourceNodeName,
                        target: targetNodeName,
                        props: {}
                    }
                ]
            }

        }

    }
}
