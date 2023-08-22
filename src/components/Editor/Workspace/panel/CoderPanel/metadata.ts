
import { EditorMetaDataState, EditorWorkspacePanelState } from '@blocksx-ui/Editor/states';


export default class WorkspacePanelCoderMeta extends EditorWorkspacePanelState {
    public constructor(namspace: string, props: any, state: any) {
        super(namspace, Object.assign({
            type: 'coder'
        }, props), state)
    }
}
EditorMetaDataState.registerMetaModel(WorkspacePanelCoderMeta)