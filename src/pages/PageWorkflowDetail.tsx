import React from 'react';
import { SmartRequest, routerParams, withRouter } from '@blocksx/ui';
import WorkflowDetail  from './components/WorkflowDetail';

//import { getFormerSchema } from './former';

import { omit } from 'lodash';

interface IFlowEdit {
    router: routerParams;
    
}


class PageWorkflowDetail extends React.Component<IFlowEdit> {
    private fetchViewRequest: any = SmartRequest.createPOST('/api/thinking/view', true);
    private fetchUpdateRequest: any = SmartRequest.createPOST('/api/thinking/update', true);
    private fetchToggleStatusRequest: any = SmartRequest.createPOST('/api/thinking/toggleStatus', true);
    private fetchToggleFavoritesRequest: any = SmartRequest.createPOST('/api/thinking/toggleFavorites', true);
    private fetchPublishRequest: any = SmartRequest.createPOST('/api/thinking/publish', true);

    private fetchPragramsRequest: any =  SmartRequest.createPOST('/eos/programs/list');
    private fetchVersionHistoryRequest: any = SmartRequest.createPOST('/api/thinking/history');
    private fetchRestoreRequest: any = SmartRequest.createPOST('/api/thinking/restoreHistory', true)
    private fetchCloneRequest: any = SmartRequest.createPOST('/api/thinking/clone', true);


    private router: routerParams;
    public constructor(props: IFlowEdit) {
        super(props);

        this.router = props.router;
    }

    public render() {

        return (
            
            <WorkflowDetail 
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
                onFetchValue={()  => {
                    return this.fetchViewRequest({id: this.props.router.params.id})
                }}
                onPublishValue={this.fetchPublishRequest}
                onSaveFlowList={(value: any, nodes: any, connectors: any)=>{
                    nodes = nodes.map(it => {
                        let props: any = it.props || {};
                        return {
                            ...it,
                            componentName: props.componentName
                        }
                    })
                    return this.fetchUpdateRequest({id: value.id, nodes, isPublish: false, connectors})
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
                            return this.fetchUpdateRequest(omit(value, ['nodes', 'connectors','folder', 'favorites', 'status' ]));
                    }
                }}
                fetchMap={
                    {
                        'versionHistory': this.fetchVersionHistoryRequest,
                        'restoreHistory': this.fetchRestoreRequest,
                        'logs': (pageNumber: number, pageSize: number, params: any) => {
                            console.log('logs', pageNumber, pageSize, params, 90)
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
                            console.log('history', pageNumber, pageSize, params, 90)
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
                                        return {
                                            ...ac,
                                            color: it.color,
                                            icon: [it.icon, ac.icon],
                                            componentName: [it.name, ac.name].join('.')
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