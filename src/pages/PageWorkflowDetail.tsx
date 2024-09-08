import React from 'react';
import { utils } from '@blocksx/core';
import { SmartRequest, routerParams, withRouter } from '@blocksx/ui';
import WorkflowDetail  from './components/WorkflowDetail';

//import { getFormerSchema } from './former';

import { omit,pick } from 'lodash';

interface IFlowEdit {
    isTemplate?: boolean;
    isViewer?: boolean;
    router: routerParams;
}
interface FlowEditState {

}

// @ts-ignore
window.utils = utils;

class PageWorkflowDetail extends React.Component<IFlowEdit, FlowEditState> {

    public static defaultProps = {
        isTemplate: false,
        isViewer: false
    }

    private fetchViewRequest: any ;
    private fetchViewTaskHistory: any;
    private fetchUpdateRequest: any;
    private fetchToggleStatusRequest: any;
    private fetchToggleFavoritesRequest: any ;
    private fetchPublishRequest: any;

    private fetchPragramsRequest: any =  SmartRequest.makeGetRequest('/eos/programs/list');
    private fetchVersionHistoryRequest: any;
    private fetchRestoreHistoryRequest: any
    private fetchDeleteHistoryRequest: any;
    private fetchRunTestRequest: any;
    private fetchCloneRequest: any;

    private developmentRequest: any;


    private router: routerParams;
    public constructor(props: IFlowEdit) {
        super(props);

        this.router = props.router;
        this.initRequestHelper();
    }
    public initRequestHelper() {
        let path: string = this.props.isTemplate ? '/eos/templates': '/api/thinking';

        this.fetchViewRequest = SmartRequest.makeGetRequest(`${path}/findThinking`);
        this.fetchViewTaskHistory = SmartRequest.makeGetRequest(`${path}/taskHistory`)

        this.fetchUpdateRequest = SmartRequest.makePostRequest(`${path}/update`);
        this.fetchToggleStatusRequest = SmartRequest.makePostRequest(`${path}/toggleStatus`);
        this.fetchToggleFavoritesRequest = SmartRequest.makePostRequest(`${path}/toggleFavorites`);
        this.fetchPublishRequest = SmartRequest.makePostRequest(`${path}/publish`);

        this.fetchVersionHistoryRequest = SmartRequest.makeGetRequest(`${path}/history`);
        this.fetchRestoreHistoryRequest = SmartRequest.makePostRequest(`${path}/restoreHistory`);
        this.fetchDeleteHistoryRequest = SmartRequest.makePostRequest(`${path}/deleteHistory`);

        this.fetchCloneRequest = SmartRequest.makePostRequest(`${path}/clone`);

        this.developmentRequest = SmartRequest.makePostRequest(`${path}/upsertThinking`);

        this.fetchRunTestRequest = SmartRequest.makePostRequest(`${path}/test`)
        //this.updateNodeRequest = SmartRequest.makePostRequest(`${path}/updateNode`)
        //this.removeNodeRequest = SmartRequest.makePostRequest(`${path}/removeNode`);
        //this.freshNodeRequest = SmartRequest.makePostRequest(`${path}/fresh`);

    }
    
    public render() {

        return (
            
            <WorkflowDetail 
                isViewer={this.props.isViewer}
                isTemplate={this.props.isTemplate}
                pageType="thinking"
                onToggleFavorites={()=>{
                    return new Promise((resolve,reject) => {
                        setTimeout(()=> {
                            resolve({})
                        }, 2000)
                        
                    })
                }}
                getFormerSchema={() => {
                    return {

                    }
                }}
                workflowId={this.props.router.params.id}
                onFetchValue={()  => {
                    
                    return this.fetchViewRequest({id: this.props.router.params.id}).then((result => {
                        
                        return {
                            ...result,
                            nodes: utils.decompress(result.nodes) || [],
                            connectors: utils.decompress(result.connectors) || []
                        }
                    }))
                }}
                onFetchHistory = {(hisId: string) => {
                    return this.fetchViewTaskHistory({id: hisId}).then(result => {
                        let schema: any  = result.schema || {};
                        
                        if (schema.nodes) {
                            if (!schema.nodes[0].name) {
                                schema.nodes = utils.decompress(schema.nodes);
                                schema.connectors = utils.decompress(schema.connectors);
                            }
                        } else {
                            result.schema =  result.schema && Array.isArray(result.schema) ? utils.decompress(result.schema) : result.schema;
                            result.payload = utils.isArray(result.payload) ? utils.decompress(result.payload) : result.payload;
                            result.snapshot = result.snapshot && !result.snapshot.nodes  ? utils.decompress(result.snapshot) : result.snapshot;
                        }
                        
                        return {
                            ...result
                        }
                    })
                }}
                onPublishValue={(value) => {
                    
                    return this.fetchPublishRequest({
                        ...value,
                        nodes: utils.compress(value.nodes),
                        connectors: utils.compress(value.connectors)
                    })
                }}
                onEditorNode= {(type: string, { value, diff, nodes, connector} : any)=> {
                  

                    return this.developmentRequest({
                        id: this.props.router.params.id,
                        nodes: diff.nodes.length ? nodes : undefined,
                        connectors: diff.connectors.length ? connector : undefined
                    })
                    /*
                    switch(type) {
                        case 'removeNode':
                            return this.removeNodeRequest({
                                where: {
                                    name: value,
                                    workflowId: this.props.router.params.id
                                },
                                diffConnectors: diff.connectors || []
                            })
                        case 'updateNode':
                            
                            return this.updateNodeRequest(pick(value,['id', 'serial', 'name','icon', 'color', 'type', 'left', 'top', 'connection', 'componentName', 'props']))
                    }*/
                }}
                onSaveFlowList={({type, value,  diff, nodes, connector})=>{
                   
                    return this.developmentRequest({
                        removeConnector: type == 'removeNode' ? value.filter(it => it.props.connection).map(it=> {
                            console.log(it)
                            return {
                                connection: it.props.connection,
                                componentName: it.componentName
                            }
                        }) : undefined,
                        id: this.props.router.params.id,
                        nodes: (!diff.nodes || diff.nodes.length) ? utils.compress(nodes) : undefined,
                        connectors: (!diff.connectors || diff.connectors.length) ? utils.compress(connector) : undefined
                    })
                }}

                onCloneValue={(v)=>{
                    return this.fetchCloneRequest(v).then(result => {
                        
                        this.router.utils.goPath('/thinking/view/:id', result)
                    })
                }}
                onEditorValue={(value: any, type: string)=>{
                    switch(type) {
                        case 'status':
                            return this.fetchToggleStatusRequest(value);
                        case 'favorites':
                            return this.fetchToggleFavoritesRequest(value)
                        default:
                            return this.fetchUpdateRequest(omit(value, ['nodes', 'connectors','folder', 'favorites', 'status'  ]));
                    }
                }}
                fetchMap={
                    {
                        'versionHistory': this.fetchVersionHistoryRequest,
                        'restoreHistory': this.fetchRestoreHistoryRequest,
                        'deleteHistory': this.fetchDeleteHistoryRequest,

                        'runtest': this.fetchRunTestRequest,
                        'logs': (pageNumber: number, pageSize: number, params: any) => {
                            
                            return new Promise((resolve, reject)=> {
                                resolve({
                                    title: 'Nov 20, 2023, 4:51:28 AM',
                                    author: 'iceet',
                                    dataTransfer: '200 KB',
                                    runId: '1d08c042e14ef455c9a028cf01a3894feasdfasfe8d7',
                                    version: '1.2.2',
                                    duration: 'Less than a second',
                                    pageNumber,
                                    count: 23,
                                    data: [0,1,2,3,4,5,6,7,8,9].map(it => {
                                        return {
                                            id: it,
                                            title: 'Git get a User',
                                            description: ' Git Less than a second',
                                            status: ['Success', 'Runing', 'Error'][it % 3],
                                            errorMessage: ['call xx eeecc'],
                                            type: ['go', 'module', 'router', 'empty', 'control'][it % 5],
                                            stepNumber:  30 - ((pageNumber-1) * 10 + it)
                                        }
                                    })
                                })
                            })
                        },
                        'history': (pageNumber: number, pageSize: number, params: any)=>{
                            
                            return new Promise((resolve, reject)=> {
                                resolve({
                                    pageNumber,
                                    count: 23,
                                    data: [0,1,2,3,4,5,6,7,8,9].map(it => {
                                        return {
                                            id: it,
                                            started: 'Nov 20, 2023, 4:51:28 AM',
                                            type: ['edit','run', 'remoting', 'workflow', 'switchOpen'][it % 5],
                                            status: [ 'Initial', 'Runing', 'Error', 'Success', 'Activated', 'Deactivated'][it % 6],
                                            errorMessage: ['call xx eeecc'],
                                            author: 'iceet',
                                            dataTransfer: ['', '23.3 B', '23.4 B', '110 KB', ''][it%5],
                                            version: ['', '1.1.0', '1.2.0', '1.1.0', ''][it%5],
                                            duration: 'Less than a second',
                                            runId: it + 'd08c042e14ef455c9a028cf01a3894feasdfasfe8d7'
                                        }
                                    })
                                })
                            })
                        },
                        'programs': (params: any, workflowType: any) => {
                            
                            return this.fetchPragramsRequest({
                                type: params.category == 'all' ? undefined : params.category,
                                pageNumber: params.pageNumber,
                                pageSize: params.pageSize,
                                actionType: workflowType,
                                query: params.query,
                                $core: true
                            }).then(result => {
                                
                                return {...omit(result, ['']), data: result.data.map(it => {
                                    it.icon = it.icon + it.color;
                                    it.actions = it.actions ? it.actions.map(ac => {
                                        let color = ac.color || it.color;
                                        
                                        return {
                                            ...ac,
                                            color: ac.color || it.color ,
                                            icon: ac.subicon ? [ac.icon + color , ac.subicon] :[it.icon, ac.icon],
                                            componentName: [it.id, ac.id].join('.'),
                                            type: ac.type =='control'? 'router': ac.type,
                                            displayType: ac.type,
                                            method: ac.subname || ac.name,
                                            program: ac.subname ? ac.name :it.name
                                        };
                                    }) : []
                                    return it;
                                })};
                            })
                        }
                    }
                }
            />
        )
    }
}


export default  withRouter(PageWorkflowDetail)