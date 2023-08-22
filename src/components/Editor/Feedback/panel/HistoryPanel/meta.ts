import { EditorMetaDataState } from '@blocksx-ui/Editor/states';


export default class HistoryMetaData extends EditorMetaDataState<{}> {
    public constructor(namespace: string, props?: any, state?: any) {
        super(namespace, Object.assign({
            protect: true,
            type: 'history',
            name: '历史记录'
        }, props), state || {})
    }
}


EditorMetaDataState.registerMetaModel(HistoryMetaData);