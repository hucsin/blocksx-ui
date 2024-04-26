import { EditorMetaDataState} from '@blocksx/ui/Editor/states';

import { Request } from '@blocksx/swap';


export default class RecordMetaData extends EditorMetaDataState<{
    loading: boolean
}> {
    private resultList: any;
    private requetURI: any = {
        query: '/openapi/v1/workspace/datasource/query'
    };

    public constructor(namespace: string, props?: any, state?: any) {
        super(namespace, Object.assign({
            protect: true,
            type: 'record',
            name: '执行记录'
        }, props), state || {})

        this.reopen();
    }
    private setLoading(loading: boolean) {
        this.setState({
            loading: loading
        })
    }
    public getResultList() {
        return this.resultList;
    }
    public getLoading (){
        return this.state.loading
    }
    /**
     * 
     */
    public reopen() {
        this.query().catch((e)=> {
            this.workspaceState.showErrorMessage(e)
        });
    }
    public query() {
        this.setLoading(true);
        return new Promise((resolve, reject) => {
            Request.post(this.requetURI.query, {
                sql: this.getProp('code'),
                dbId: this.getProp('databaseId'),
                schema: this.getProp('schema')
            }).then((res)=> {
                
                this.setLoading(false);
                
                resolve(this.resultList = res)
            }).catch(e=> {
                this.setLoading(false);

                reject(e)
            })
        })
    }
}


EditorMetaDataState.registerMetaModel(RecordMetaData);