import EditorContext from './EditorContext';
import EditorBasePlugin from './EditorBasePlugin';

export { default as EditorContext } from './EditorContext';
export { default as EditorRuntimeContext } from './EditorRuntimeContext';
export { default as EditorFollowBar } from './EditorFollowBar';
export { default as EditorBaseWidget } from './EditorBaseWidget';
export { default as EditorBasePlugin } from './EditorBasePlugin';

export interface EditorBaseWidgetProps {
    namespace: string;
    context: EditorContext;
    plugin: EditorBasePlugin
}
