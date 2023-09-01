import * as monaco from 'monaco-editor';
import { utils } from '@blocksx/core';

import { EditorResourceState, EditorWorkspaceState } from '@blocksx/ui/Editor/states';
import { StateX } from '@blocksx/ui/StateX';
import { mysqlParser,IParseResult} from '@blocksx/db/sqlparser';

export default class EditorUtils {
    public static utilCache: any = {};
    public static getUtil(editor: any) {
        if (!editor.cacheutilskey) {
            editor.cacheutilskey = utils.uniq('cache');
        }
        if (EditorUtils.utilCache[editor.cacheutilskey]) {
            return EditorUtils.utilCache[editor.cacheutilskey]
        }
        return EditorUtils.utilCache[editor.cacheutilskey] = new EditorUtils(editor);
    }
    private editor: any;
    private resourceState: any;
    private parseCache: any;
    private keywordsCache: any;
    
    private workspaceState: EditorWorkspaceState = StateX.findModel(EditorWorkspaceState);

    public constructor(editor: any) {
        this.editor = editor;
        this.parseCache = {};
        this.keywordsCache = {};
    }

    public getResourceState() {
        if (this.resourceState) {
            return this.resourceState;
        }
        return this.resourceState = StateX.findModel(EditorResourceState, 'resource')
    }

    public getTableColumnByGroup(children: any) {
        let columnGroup: any = children.filter(it => it.type == 'columnGroup');
        return columnGroup.length ? columnGroup[0].children || [] : []
    }
    public getTableField(table: string) {
        let tableList: any = this.getTableList();
        let field: any[] = [];
        tableList.forEach(it => {
            if (it.name == table) {
                field = field.concat(this.getTableColumnByGroup(it.children))
            }
        })
        return field
    }


    private getKeywordsByRootId(rootId: string) {
        let resourceState: any =  this.getResourceState();
        if (utils.isString(rootId)) {
            if (this.keywordsCache[rootId]) {
                return this.keywordsCache[rootId]
            }

            return this.keywordsCache[rootId]
                = resourceState.find(rootId, ['database', 'schema', 'table', 'field'])
        }
    }

    public  getParseResult():any {
        let curretnValue: string = this.getValue();
        let model: any = this.getModel();
        let hashKey: string = utils.hashcode(curretnValue);
        
        if (model && curretnValue) {
            if (this.parseCache[hashKey]) {
                return this.parseCache[hashKey]
            }
            return this.parseCache[hashKey] = mysqlParser(curretnValue, model.getOffsetAt(this.editor.getPosition()))
        }
    }

    public getTableList(onlyName?: boolean) {
        let rootId: string = this.workspaceState.getCurrent().getRouterId();
        let { table = [] } = this.getKeywordsByRootId(rootId)

        if (onlyName) {
            return table.map(tb => {
                return tb.name;
            })
        }
        return table;
    }

    /**
     * 拼装suggestion
     * @param suggestion 
     * @returns 
     */
    public markSuggestion(suggestion: any) {
        return {
            suggestions: suggestion
        }
    }

    public getModel() {
        return this.editor.getModel();
    }
    public getSelection() {
        return this.editor.getSelection();
    }
    public getValue() {
        return this.editor.getValue();
    }

    public setErrorMarkers (selections: any, message: any) {
        if (!Array.isArray(selections)) {
            selections = [selections];
            message = [message];
        }

        monaco.editor.setModelMarkers(this.getModel(), 'sql', selections.map((position: any, index: number) => {
            return {
                ...this.getSelectionByPosition(position),
                message: message[index],
                severity: monaco.MarkerSeverity.Error
            }
        }))
    }
    public flushErrorMarkers() {
        monaco.editor.setModelMarkers(this.getModel(), 'sql', []);
    }
    /**
     * 获取选中的值
     * @returns 
     */
    public getSelectionValue() {
        const selection = this.getSelection() // 获取光标选中的值
        const { startLineNumber, endLineNumber, startColumn, endColumn } = selection
        const model = this.getModel()

        return model.getValueInRange({
            startLineNumber,
            startColumn,
            endLineNumber,
            endColumn,
        })
    }
    /**
     * 通过postion获取selection位置
     * @param position 
     * @returns 
     */
    public getSelectionByPosition(position: any[]) {
        let model: any = this.getModel();
        let first: any = model.getPositionAt(position[0]);
        let secend: any = model.getPositionAt(position[1]);

        return {
            startLineNumber: first.lineNumber,
            startColumn: first.column,
            endLineNumber: secend.lineNumber,
            endColumn: secend.column + 1
        }
    }
    /**
     * 设置位置
     * @param column 
     * @param lineNumber 
     */
    public setPosition(column: number, lineNumber: number) {
        this.editor.setPosition({ column, lineNumber })
    }
    /**
     * 获取当前位置
     * @returns 
     */
    public getPosition() {
        return this.editor.getPosition()
    }
    /**
     * 替换选取的文本
     * @param text 
     */
    public replaceSelection(text: string) {
        const selection = this.editor.getSelection() // 获取光标选中的值
        const { startLineNumber, endLineNumber, startColumn, endColumn } = selection
        const model = this.editor.getModel()

        const textBeforeSelection = model.getValueInRange({
            startLineNumber: 1,
            startColumn: 0,
            endLineNumber: startLineNumber,
            endColumn: startColumn,
        })

        const textAfterSelection = model.getValueInRange({
            startLineNumber: endLineNumber,
            startColumn: endColumn,
            endLineNumber: model.getLineCount(),
            endColumn: model.getLineMaxColumn(model.getLineCount()),
        })

        this.editor.setValue(textBeforeSelection + text + textAfterSelection)
        this.editor.focus()
        this.editor.setPosition({
            lineNumber: startLineNumber,
            column: startColumn + text.length,
        })
    }
}
