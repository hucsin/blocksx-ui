
import PluginBase from '@blocksx/ui/Editor/core/Plugin';
import * as monaco from 'monaco-editor'

import { language } from 'monaco-editor/esm/vs/basic-languages/sql/sql';

import { utils } from '@blocksx/core';
import EditorUtils from './EditorUtils';

//import { mysqlParser, StatementReader, ICursorInfo, ITableInfo, ICompletionItem, IStatement, IStatements } from '@blocksx/db/sqlparser';

const { keywords } = language


export default class AutoComplate extends PluginBase {
    private editor: any;
    private editorUtil: EditorUtils;
    public constructor() {
        super();
    }
    public pipeline(value: any, context: any) {
        if (!this.editor) {
            this.editor = context.editor;
            this.editorUtil = EditorUtils.getUtil(this.editor)
            
            this.registerCompletion();
        }
    }
    
    private registerCompletion() {
/*
        monaco.languages.registerCompletionItemProvider('sql', {
            triggerCharacters: ['.', ...keywords],
            provideCompletionItems: async (model, position) => {
                
                let parseResult: any = this.editorUtil.getParseResult();

                if(!parseResult) {
                    return this.editorUtil.markSuggestion([])
                }

                const cursorInfo: any = null//await StatementReader.getCursorInfo(parseResult.ast, parseResult.cursorKeyPath);
                const parserSuggestion: any = this.pipeKeywords(parseResult.nextMatchings);

                //this.catchError(parseResult);
                
                if (!cursorInfo) {
                    return this.editorUtil.markSuggestion(parserSuggestion)
                }

                switch (cursorInfo.type) {
                    case 'tableField':
                        const cursorRootStatementFields = null /*await StatementReader.getFieldsFromStatement(
                            parseResult.ast,
                            parseResult.cursorKeyPath,
                            this.onSuggestTableFields,
                        );*/

                        // group.fieldName
                        /*
                        const groups = utils.groupBy(
                            cursorRootStatementFields.filter(cursorRootStatementField => {
                                return cursorRootStatementField.groupPickerName !== null;
                            }),
                            'groupPickerName',
                        );

                        const functionNames = await this.onSuggestFunctionName(cursorInfo.token.value);

                        return this.editorUtil.markSuggestion(
                            cursorRootStatementFields
                                .concat(parserSuggestion)
                                .concat(functionNames)
                                .concat(
                                    groups
                                        ? Object.keys(groups).map(groupName => {
                                            return this.onSuggestFieldGroup(groupName);
                                        })
                                        : [],
                                )
                        );
                    case 'tableFieldAfterGroup':

                        // 字段 . 后面的部分
                        const cursorRootStatementFieldsAfter = await StatementReader.getFieldsFromStatement(
                            parseResult.ast,
                            parseResult.cursorKeyPath as any,
                            (a: any, b: any, c: any) => {
                                return this.onSuggestTableFields(a, b, c, true)
                            }
                        );

                        return this.editorUtil.markSuggestion(
                            cursorRootStatementFieldsAfter
                                .filter((cursorRootStatementField: any) => {
                                    return (
                                        cursorRootStatementField.groupPickerName ===
                                        (cursorInfo as ICursorInfo<{ groupName: string }>).groupName
                                    );
                                })
                                .concat(parserSuggestion)
                        );
                    case 'tableName':
                        const tableNames = await this.onSuggestTableNames(cursorInfo as ICursorInfo<ITableInfo>);

                        return this.editorUtil.markSuggestion(tableNames.concat(parserSuggestion));
                    case 'functionName':
                        return this.onSuggestFunctionName(cursorInfo.token.value);
                    default:
                        //return this.editorUtil.markSuggestion(parserSuggestion);
                        break;
                }

                return this.editorUtil.markSuggestion(parserSuggestion)
            }
        } as any)


        0 && monaco.languages.registerHoverProvider('sql', {
            provideHover: async (model: any, position: any) => {

                let parseResult: any = mysqlParser(this.editor.getValue(), model.getOffsetAt(this.editor.getPosition()))
                const cursorInfo: any = await StatementReader.getCursorInfo(parseResult.ast, parseResult.cursorKeyPath);


                if (!cursorInfo) {
                    return null as any;
                }

                let contents: any = [];

                switch (cursorInfo.type) {
                    case 'tableField':
                        const extra = await StatementReader.findFieldExtraInfo(
                            parseResult.ast,
                            cursorInfo,
                            this.onSuggestTableFields,
                            parseResult.cursorKeyPath,
                        );
                        contents = await this.onHoverTableField(cursorInfo.token.value, extra);
                        break;
                    case 'tableFieldAfterGroup':
                        const extraAfter = await StatementReader.findFieldExtraInfo(
                            parseResult.ast,
                            cursorInfo,
                            this.onSuggestTableFields,
                            parseResult.cursorKeyPath,
                        );
                        contents = await this.onHoverTableField(cursorInfo.token.value, extraAfter);
                        break;
                    case 'tableName':
                        contents = await this.onHoverTableName(cursorInfo as ICursorInfo);
                        break;
                    case 'functionName':
                        contents = await this.onHoverFunctionName(cursorInfo.token.value);
                        break;
                    default:
                }



                return {
                    range: monaco.Range.fromPositions(
                        model.getPositionAt(cursorInfo.token.position[0]),
                        model.getPositionAt(cursorInfo.token.position[1] + 1),
                    ),
                    contents,
                };
            },
        });
        */
    }


    private markText(a?: string, b?: string, c?: string) {
        return [a, b, c].filter(it => it).join('.')
    }

    /*
    public onSuggestTableNames: (cursorInfo?: ICursorInfo<ITableInfo>) => Promise<ICompletionItem[]> = cursorInfo => {

        let table: any[] = this.editorUtil.getTableList();

        return Promise.resolve(
            table.map(it => {
                return {
                    label: it.name,
                    insertText: it.name,
                    sortText: `A${it.name}`,
                    //kind: monaco.languages.CompletionItemKind.Folder,
                    kind: {
                        value: monaco.languages.CompletionItemKind.Keyword, // 设置默认图标类型
                        // 设置自定义图标，可以使用URL或CSS类
                        custom: {
                            iconClass: 'custom-icon-class' // 例如，使用CSS类来定义图标
                        }
                    }
                };
            })
        ) as any;
    };

    public onSuggestTableFields: (
        tableInfo?: ITableInfo,
        cursorValue?: any,
        rootStatement?: IStatement,
        isGroup?: boolean
    ) => Promise<ICompletionItem[]> = (tableInfo: any, x, y, isGroup?: boolean) => {

        let field: any = this.editorUtil.getTableField(tableInfo.tableName.value)

        return Promise.resolve(
            field
                .map(it => {
                    let key: string = this.markText(utils.get(tableInfo, 'namespace.value', ''), utils.get(tableInfo, 'tableName.value', ''), it.name);
                    return {
                        label: key,
                        insertText: isGroup ? it.name : key,
                        value: it.name,
                        sortText: `B${it.name}`,
                        kind: monaco.languages.CompletionItemKind.Field,
                    };
                })
        ) as any
    };

    public pipeKeywords = (keywords: any[]) => {
        return keywords
            .filter(matching => {
                return matching.type === 'string';
            })
            .map(matching => {
                const value = /[a-zA-Z]+/.test(matching.value.toString())
                    ? utils.upperCase(matching.value.toString())
                    : matching.value.toString();
                return {
                    label: value,
                    insertText: value,
                    documentation: 'documentation',
                    detail: 'detail',
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    sortText: `W${matching.value}`,
                };
            });
    };

    public onSuggestFunctionName: (inputValue?: string) => Promise<ICompletionItem[]> = inputValue => {
        return Promise.resolve(
            ['sum', 'count'].map(each => {
                return {
                    label: each,
                    insertText: each,
                    sortText: `C${each}`,
                    kind: monaco.languages.CompletionItemKind.Function,
                };
            })
        ) as any
    };

    public onSuggestFieldGroup: (tableNameOrAlias?: string) => ICompletionItem = tableNameOrAlias => {
        return {
            label: tableNameOrAlias,
            insertText: tableNameOrAlias,
            sortText: `D${tableNameOrAlias}`,
            kind: monaco.languages.CompletionItemKind.Folder,
        } as any;
    }

    public onHoverTableField: (fieldName?: string, extra?: ICompletionItem) => Promise<any> = (...args) => {
        return Promise.resolve([
            { value: 'onHoverTableField' },
            {
                value: `\`\`\`json\n${JSON.stringify(args, null, 2)}\n\`\`\``,
            },
        ]);
    };

    public onHoverTableName: (cursorInfo?: ICursorInfo) => Promise<any> = (...args) => {
        return Promise.resolve([
            { value: 'onHoverTableName' },
            {
                value: `\`\`\`json\n${JSON.stringify(args, null, 2)}\n\`\`\``,
            },
        ]);
    };

    public onHoverFunctionName: (functionName?: string) => Promise<any> = (...args) => {
        return Promise.resolve([
            { value: 'onHoverFunctionName' },
            {
                value: `\`\`\`json\n${JSON.stringify(args, null, 2)}\n\`\`\``,
            },
        ]);
    };*/
}