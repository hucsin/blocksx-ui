
import { EditorMetaDataState, EditorWorkspacePanelState } from '@blocksx/ui/Editor/states';


export default class WorkspacePanelCoderMeta extends EditorWorkspacePanelState {
    public constructor(namspace: string, props: any, state: any) {
        super(namspace, Object.assign({
            type: 'coder'
        }, props), Object.assign({}, state, {
            router: props.router ? props.router.current : [],
            rootId: props.router ? props.router.rootId : ''
        }))
    }
    public getRootId() {
        return this.getState('rootId');
    }
    public getRouterId() {
        let router: any = this.getState('router');
        if (router) {
            return router[router.length -1 ].id;
        }
    }
}
EditorMetaDataState.registerMetaModel(WorkspacePanelCoderMeta)