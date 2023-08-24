 import { StateModel, StateX } from '@blocksx/ui/StateX';
 import EditorMetaDataState, { MetaDataState } from './MetaData';
 import EditorWorkspaceState from '@blocksx/ui/Editor/states/Workspace';
 import EditorFeedbackState from '@blocksx/ui/Editor/states/Feedback';


export default class EditorWorkspacePanelState extends EditorMetaDataState <MetaDataState> {
    private context: any;
    private feedback: any;

    public constructor(namespace: string, props: any, state: any) {
        super(namespace, props, state);

        this.initFeedback(namespace);
        
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

    public onChange(value: any) {
        this.setState({
            value: value
        });
        this.workspaceState.onChange(this.namespace);
    }

    public onSave() {
        this.workspaceState.onSave(this.namespace);
    }

    public getFeedback() {
        return this.feedback;
    }

    public initFeedback(namespace: string) {
        StateX.registerModel(this.feedback = new EditorFeedbackState(namespace, {}));

        if (this.workspaceState.getCurrentKey() == namespace) {
            this.toggleFeedback();   
        }
    }
    public toggleFeedback() {
        this.workspaceState.layoutState.toggle(
            'FeedbackDisplay', this.feedback.getItems().length > 0 ? 'show' : 'hide'
        )
    }
    
}