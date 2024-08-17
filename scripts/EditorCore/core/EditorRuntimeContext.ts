/**
 * 几个事情需要更新,
 * 
 * 1、值发生变化
 * 2、选区发生变化
 * 3、是否有其他操作运行中
 */

import { StateModel } from '@blocksx/ui';
import { monaco } from 'react-monaco-editor';
import { debounce } from 'throttle-debounce';

interface EditorRuntimeContextState {
    value: any;
    selectionEmpty: string;
    selection: monaco.Selection;

    clipboardData: string;
}


let globalClipboardData:any ;

export default class EditorRuntimeContext extends StateModel<EditorRuntimeContextState> {
    private editor: monaco.editor.IStandaloneCodeEditor;
    private cacheWidth: any ;
    public constructor() {
        super(null)
        this.cacheWidth = {};
    }
    public bindEditor(editor: monaco.editor.IStandaloneCodeEditor) {
        this.editor = editor;
        this.bindEvent();
    }
    private bindEvent() {
        this.editor.onDidChangeCursorSelection(debounce(300, ({selection}) => {
            
            this.setState({
                selectionEmpty: selection.isEmpty() ? 'true' : 'false',
                selectRange: {
                    endColumn: selection.endColumn,
                    endLineNumber: selection.endLineNumber,
                    positionColumn: selection.positionColumn,
                    positionLineNumber: selection.positionLineNumber,
                    selectionStartColumn: selection.selectionStartColumn,
                    selectionStartLineNumber: selection.selectionStartLineNumber,
                    startColumn: selection.startColumn,
                    startLineNumber: selection.startLineNumber
                }
            })
        }))
    }
    public setValue(value: string) {
        this.setState({
            value: value
        })
    }
    public getValue() {
        return this.getState('value')
    }
    /** 是否有值 */
    public hasValue() {
        return !!this.getValue();
    }
    /** 是否有选中 */
    public hasSelection() {
        return this.getState('selectionEmpty') == 'false'
    }
    public getEditorModel() {
        return this.editor.getModel();
    }
    public getSelection() {
        return this.getState('selectRange');
    }
    public setPosition(position: monaco.IPosition) {
        
        this.editor.focus();
        this.editor.setPosition(position);
        //this.editor.revealPositionInCenter(position)
    }

    /**
     * 获取行宽度
     * @param lineNumber 
     */
    public getLineWidth(lineNumber: number) {
        const model: any = this.getEditorModel();
        if (model) {
            const lineContent = model.getLineContent(lineNumber)  || '';
            if (this.cacheWidth[lineContent]) {
                return this.cacheWidth[lineContent]
            }
            const domNode = document.createElement('div');
            domNode.className ='editor-core-text-template';
            domNode.textContent = lineContent.replace(/\s/ig, 'E');
            
            document.body.appendChild(domNode);
            const length = domNode.offsetWidth;
            document.body.removeChild(domNode);

            return this.cacheWidth[lineContent] = length;
        }
        
    }

    /**
     * 判断是否在选取里面
     * @param position 
     */
    public isInSelection(position: monaco.IPosition) {
        let selection: any = this.getSelection();
        return selection.startLineNumber <= position.lineNumber &&  selection.endLineNumber >= position.lineNumber;
    }

    public getSelectionValue() {
        const selection = this.getSelection() // 获取光标选中的值
       // const { startLineNumber, endLineNumber, startColumn, endColumn } = selection
        const model = this.getEditorModel();
        return model?.getValueInRange(selection)
    }


    public hasClipboardData() {
        return !!this.getClipboardData();
    }
    /**
     * 获取剪切板时间
     * @returns 
     */
    public getClipboardData() {
        return this.getState('clipboardData') || globalClipboardData;
    }

    public removeSelectioin() {
        let selection: any = this.getSelection();
        if (selection) {

            this.editor.executeEdits('delete-selection', [{
                range: new monaco.Range(
                    selection.startLineNumber,
                    selection.startColumn,
                    selection.endLineNumber,
                    selection.endColumn
                  ),
                text: ''
            }]);

            setTimeout(()=>{
                this.setPosition({
                    lineNumber: selection.startLineNumber,
                    column: selection.startColumn
                })
            }, 0)
        }
    }

    private trigger(action: string) {
        this.editor.trigger('contextmenu', action,null);
    }

    /**
     * 剪切当前选中区域
     */
    public clipboardCut() {
        
        this.trigger('editor.action.clipboardCutAction')
        this.setState({
            clipboardData: globalClipboardData = this.getSelectionValue()
        })

        this.removeSelectioin();
    }

    /**
     * 复制当前选区
     */
    public clipboardCopy() {
        this.trigger('editor.action.clipboardCopyAction')
        this.setState({
            clipboardData: this.getSelectionValue()
        })
    }

    /**
     *  粘贴当前选区
     */
    public clipboardPaste () {

        let clipboardData: string = this.getClipboardData();

        this.editor.trigger('keyboard', 'type', { text: clipboardData });
    }
}