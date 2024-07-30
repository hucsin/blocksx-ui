
import { WidgetBase, EditorContext, EditorRuntimeContext, ContextMenuItem, EditorBaseWidgetProps } from '@blocksx/ui';
import EditorBasePlugin from './EditorBasePlugin';



export default abstract class EditorBaseWidget<P, S> extends WidgetBase<P, S> {
    
    public static contextMenu?: ContextMenuItem;

    public editorContext: EditorContext;
    public runtimeContext: EditorRuntimeContext;
    public namespace: string;
    public plugin: EditorBasePlugin | any;

    public constructor(props: EditorBaseWidgetProps) {
        super(props);

        this.editorContext = props.context;
        this.runtimeContext = this.editorContext.runtimeContext;
        this.namespace = props.namespace;
        this.plugin = props.plugin;

    }
}