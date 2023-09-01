
import PluginBase from '@blocksx/ui/Editor/core/Plugin';
import * as monaco from 'monaco-editor'

import { language } from 'monaco-editor/esm/vs/basic-languages/sql/sql';

import { EditorResourceState, EditorWorkspaceState } from '@blocksx/ui/Editor/states';
import { StateX } from '@blocksx/ui/StateX';
import { utils } from '@blocksx/core';
import EditorUtils from './EditorUtils';

import { mysqlParser, StatementReader, ICursorInfo, ITableInfo, ICompletionItem, IStatement, IStatements } from '@blocksx/db/sqlparser';




export default class AutoComplate extends PluginBase {
    private editor: any;
    private editorUtil: EditorUtils;
    private parseCache: any ;

    private workspaceState: EditorWorkspaceState = StateX.findModel(EditorWorkspaceState);
    private resourceState: EditorResourceState;
    private keywordsCache: any;
    public constructor() {
        super();
        this.keywordsCache = {};
        this.parseCache = {};
        
    }
    public pipeline(value: any, context: any) {
        if (!this.editor) {
            this.editor = context.editor;
            this.editorUtil = EditorUtils.getUtil(this.editor);

            let resourceState: any =  this.editorUtil.getResourceState();

            resourceState.once('onDataInited', () => {
                // 初始化
                this.resetError();
            })
            // 发生变化
            this.editor.onDidChangeModelContent(() => {
                this.resetError();
            })
        }
    }


   
    public resetError() {
        this.catchError(this.editorUtil.getParseResult());
     }


    private getDiffTableNames(parseTables: any[], tableNames: string[]) {
        let diff: any = [];
        parseTables.forEach(pt => {
            if (tableNames.indexOf(pt.tableName.value) == -1) {
                diff.push(pt.tableName)
            }
        })
        return diff;
    }
    /**
     * 验证表名并补货出错误
     * @param statement 
     */
     private verifyTableNameCatchError(parseResult: any, errorPosition: any[], errorMessage: string[]) {
        if (parseResult.ast) {
            let parseTables: any =  StatementReader.getTableNamesfromStatement(parseResult);
            
            if (parseTables.length) {
                let diffNames: any = this.getDiffTableNames(parseTables, this.editorUtil.getTableList(true))

                if (diffNames.length) {
                    diffNames.map((it) => {
                        errorPosition.push(it.position);
                        errorMessage.push(`表“${it.value}”不存在,请核对后在试!`)
                        
                    })
                }
            }
        }
    }
    /**
     * 验证解析的语法错误
     * @param parseResult 
     * @param errorPosition 
     * @param errorMessage 
     */
    private verifyParserCatchError(parseResult: any, errorPosition: any[], errorMessage: string[]) {
        if (parseResult.error) {
            const newReason =
                parseResult.error.reason === 'incomplete'
                    ? `Incomplete, expect next input: \n${parseResult.error.suggestions
                        .map((each: any) => {
                            return each.value;
                        })
                        .join('\n')}`
                    : `Wrong input, expect: \n${parseResult.error.suggestions
                        .map((each: any) => {
                            return each.value;
                        })
                        .join('\n')}`;

            if (parseResult.error.token) {
                errorPosition.push(parseResult.error.token.position);
                errorMessage.push(newReason)
            }
        }
    }
    /**
     * 验证分组的语法错误
     * @param parseResult 
     * @param errorPosition 
     * @param errorMessage 
     */
    private verifyTableGroupColumnCatchError(parseResult: any, errorPosition: any[], errorMessage: string[]) {
        
        let fieldNames: any = StatementReader.getFieldsNamesFromStatement(parseResult);
        if (fieldNames && fieldNames.length) {
            fieldNames.forEach(field => {
                let groupAllField: any = this.editorUtil.getTableField(field.group).map(it=>it.name);
                if (groupAllField.indexOf(field.value) ==-1) {
                    errorPosition.push(field.position);
                    errorMessage.push(`字段“${field.value}”在对象“${field.group}”里不存在!`)
                }
            })
        }
    }

    private  catchError(parseResult: any) {
        // 判断表格是否存在
        let errorPosition: any[] = [];
        let errorMessage: string[] = [];

        if (parseResult && parseResult.ast) {

            this.verifyTableNameCatchError(parseResult, errorPosition, errorMessage);
            this.verifyParserCatchError(parseResult, errorPosition, errorMessage);
            this.verifyTableGroupColumnCatchError(parseResult, errorPosition, errorMessage);
            
            if (errorMessage.length) {

                this.editorUtil.setErrorMarkers(errorPosition, errorMessage);
            } else {
                this.editorUtil.flushErrorMarkers();
            }
            
        } else {
            this.editorUtil.flushErrorMarkers();
        }
    }
}

