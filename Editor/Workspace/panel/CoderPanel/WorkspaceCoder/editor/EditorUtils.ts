import * as monaco from 'monaco-editor';
import { utils } from '@blocksx/core';

import { EditorResourceState, EditorWorkspaceState } from '@blocksx/ui/Editor/states';
import { StateX } from '@blocksx/ui/StateX';
import { SQLParser, ASTMetaReader } from '@blocksx/db/sqlparser';

import CacheAST from './CacheAST';



export default class EditorUtils {
    public static utilCache: any = {};
    public static getUtil(editor: any):EditorUtils {
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

    private tableListCache: any;
    private tableFieldCache: any;
    
    public workspaceState: EditorWorkspaceState = StateX.findModel(EditorWorkspaceState);

    public constructor(editor: any) {
        this.editor = editor;
        this.parseCache = {};
        this.keywordsCache = {};

        this.tableListCache = {};
        this.tableFieldCache = {};
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
    /**
     * 获取表的字段
     */
    public getTableColumnList(table: string) {
        let rootId: string = this.workspaceState.getCurrent().getRouterId();
        let tableList: any = this.getTableList();
        let cacheKey: string = [rootId, table].join('.');

        if (this.tableFieldCache[cacheKey]) {
            return this.tableFieldCache[cacheKey];

        } else {
            let field: any[] = [];
            tableList.forEach(it => {
                if (this.ignoreCaseContrast(it.name ,table)) {
                    field = field.concat(this.getTableColumnByGroup(it.children).map((field: any) => utils.toUpper(field.name)))
                }
            })
            return this.tableFieldCache[cacheKey] = field
        }
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
            let parseAST: any = SQLParser.parser(curretnValue, 'mysql');

            if (utils.isArray(parseAST)) {
                return this.parseCache[hashKey] = ASTMetaReader.readStatement(parseAST);

            } else {
                return parseAST;
            }
        }
    }

    /**
     * 
     * @param onlyName 
     * @returns 
     */
    public getTableList(onlyName?: boolean) {
        let rootId: string = this.workspaceState.getCurrent().getRouterId();
        let cacheKey: string = onlyName ? [rootId, 'name'].join('.') : rootId;

        if (this.tableListCache[cacheKey]) {
            return this.tableListCache[cacheKey];

        } else {

            let { table = [] } = this.getKeywordsByRootId(rootId)

            return this.tableListCache[cacheKey] =  (onlyName ? table.map((tb: any) => {
                return utils.toUpper(tb.name);
            }) : table);
        }
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

    public setErrorMarkers (errorToken: any) {
       
        monaco.editor.setModelMarkers(this.getModel(), 'sql', errorToken.filter(it=>!!it.token).map((errorToken: any, index: number) => {
            return {
                ...this.getSelectionByToken(errorToken.token),
                message: errorToken.message,
                severity: monaco.MarkerSeverity.Error
            }
        }))
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
     * 通过token获取选取位置
     * @param token 
     * @returns 
     */
    public getSelectionByToken(token: any) {
        return this.getSelectionByPosition([token.start, token.start+token.text.length-1])
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


    public toCacheAST(stm: any):CacheAST {
        return new CacheAST(stm, this);
    }
    /**
     * 忽略大小写查找字符串数组里面是否具有某一项
     * @param array 
     * @param value 
     * @returns 
     */
    public ignoreCaseFindArray(array: string[], value: string) {
        let upperValue: string = utils.toUpper(value);

        return array.find((it: any) => {
            if (utils.toUpper(it) == upperValue) {
                return true;
            }
        })
    }
    /**
     * 忽略大小写比较是否一样
     * @param leftValue 
     * @param rightValue 
     * @returns 
     */
    public ignoreCaseContrast(leftValue: string, rightValue:string) {
        return utils.toUpper(leftValue) == utils.toUpper(rightValue)
    }
}
