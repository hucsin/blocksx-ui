/**
 * 工作区,panel 数据上下文
 */
 import { StateModel, StateX } from '@blocksx-ui/StateX';
 import EditorWorkspaceState from '@blocksx-ui/Editor/states/Workspace';
 import EditorFeedbackState from '@blocksx-ui/Editor/states/Feedback';

 interface WorkspacePanelState {
    value?: any;
 }

 export default class EditorWorkspacePanelState extends StateModel<WorkspacePanelState> {
    private context: any;
    public workspaceState: EditorWorkspaceState = StateX.findModel(EditorWorkspaceState);
    public feedback:any;

    public constructor(namespace: string, state: any) {
        super(namespace, Object.assign({
            value: ''
        }, state));

        StateX.registerModel(this.feedback = new EditorFeedbackState(namespace, {}))
    }
    /**
     * 设置上下文
     * @param context 
     */
    public setContext(context: any) {
        this.context = context;
    }
    /**
     * 获取上下文
     * @returns 
     */
    public getContext() {
        return this.context;
    }
    public getValue() {
        return this.state.value;
    }
    public onChange(value: any) {
        this.setState({
            value: value
        });
        this.workspaceState.change(this.namespace);
    }
    public onSave() {
        this.workspaceState.save(this.namespace);
    }

    public getFeedbackState() {
        return this.feedback;
    }
 }