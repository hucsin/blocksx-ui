
import PluginBase from '@blocksx/ui/Editor/core/Plugin';

import { EditorResourceState, EditorWorkspaceState } from '@blocksx/ui/Editor/states';
import { StateX } from '@blocksx/ui/StateX';
import { utils } from '@blocksx/core';
import EditorUtils from './EditorUtils';

import CacheAST from './CacheAST';


export interface errorToken {
    token: any,
    message: string
}

export default class AutoComplate extends PluginBase {
    private editor: any;
    private editorUtil: EditorUtils;
    private errorCache: any;
    public workspaceState: EditorWorkspaceState = StateX.findModel(EditorWorkspaceState);
    
    public constructor() {
        super();
        this.errorCache = [];

    }
    public pipeline(value: any, context: any) {
        if (!this.editor) {
            this.editor = context.editor;
            this.editorUtil = EditorUtils.getUtil(this.editor);

            let resourceState: any = this.editorUtil.getResourceState();

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
        let parser: any = this.editorUtil.getParseResult();
        if (parser) {
            this.catchError(parser);
        }
    }

    private catchError(parseResult: any) {
        // 判断表格是否存在
        let errorToken: errorToken[] = [];
        //
        if (parseResult.type == 'parseError') {
            errorToken = this.errorCache;

            if (parseResult.token) {
                errorToken.push({
                    token: parseResult.token,
                    message: `Parse error at token: ${parseResult.token.text}`
                })
            }
        } else {
            let catchAST: CacheAST = this.editorUtil.toCacheAST(parseResult)

            //先验证表格
            this.testingTableNamepsace(catchAST, errorToken);
            // 验证字段
            this.testingColumns(catchAST, errorToken);
            this.errorCache = errorToken;
        }

        this.editorUtil.setErrorMarkers(errorToken);
    }

    /**
     * 对字段的合法性验证
     * 
     * 验证规则:
     * 1、字段有相关表范围的情况
     *  1.1、相关表存在于当前打开schema内,判断字段是否存在与当前表的元数据中
     *  1.2、相关表不存在与当前打开的schema内,提示用户该字段引用错误
     * 2、字段不存在相关表
     *  2.1、查询from语句看下有没有限制表
     *  2.2、有限制表1个,字段就去当前限制表里面寻找,没有就给错误提示
     *  2.3、如果存在多个限制表,字段就去多个表内寻找,如果都不存在就给错误提示
     *  2.4、如果存在多个限制表,字段在一个以上表内存在,给出错误提示
     *  2.5、如果存在多个限制表,字段只在一个表内存在,给出警告提示
     * 
     * @param cacheAST 
     * @param errorToken 
     */
    private testingColumns(cacheAST: CacheAST, errorToken: errorToken[]) {
        let tableList: any = this.editorUtil.getTableList(true);

        cacheAST.getColumns().forEach((columnToken: any) => {
            if (columnToken.text && columnToken.clause.indexOf('AS') == -1) {
                //1、 字段存在限制表情况
                if (columnToken.table) {
                    let tableToken: any = columnToken.table.asFor || columnToken.table;
                    let tableName: string = utils.toUpper(tableToken.text);


                    //1.1 存在当前的schema内
                    if (tableList.indexOf(tableName) > -1 || cacheAST.isVirtualTable(tableToken)) {
                        // 验证字段是否在允许的列表
                        if (!this.testingColumnInTable(cacheAST, tableToken, columnToken, tableName)) {
                            errorToken.push({
                                token: columnToken,
                                message: `字段[${columnToken.text}]不存在表 [${tableToken.text}]内`
                            })
                        }
                    } else {
                        console.log(tableToken, 888)
                        //1.2 相关表不存在当前打开的schma内
                        
                        errorToken.push({
                            token: columnToken,
                            message: `字段[${columnToken.text}]引用表 [${tableToken.text}]不存在`
                        })
                        
                    }
                    // 2、字段不存在相关表
                } else {

                    // 寻找fromtable的表列表
                    let fromTable: any = cacheAST.getTrueFromTableByToken(columnToken);
                    
                    if (fromTable && fromTable.length > 0) {
                        let finded: any = fromTable.filter((table: any) => {
                            let trueTable: any = table.asFor || table;
                            console.log(table, trueTable)
                            return this.testingColumnInTable(cacheAST, trueTable, columnToken, trueTable.text)
                        });

                        if (finded.length == 0) {
                            errorToken.push({
                                token: columnToken,
                                message: `字段[${columnToken.text}]在当前语句的表范围内不存在`
                            })
                        } else {
                            if (finded.length > 1) {
                                errorToken.push({
                                    token: columnToken,
                                    message: `字段[${columnToken.text}]同时存在多个表[${finded.map(it => it.text).join(',')}]中,需明表范围`
                                })
                            }
                        }
                    }
                }
            }
        })
    }

    /**
     * 验证字段是否在表里面
     * @param column 
     * @param table 
     */
    private testingColumnInTable(cacheAST: any,tableToken:any, columnToken: any, tableName: string) {
        let columnsList: any[] = this.editorUtil.getTableColumnList(tableName);
        let columnName: string = utils.toUpper(columnToken.text);
        
        if (columnsList.indexOf(columnName) == -1 && !cacheAST.findAsColumnByToken(columnToken)) {
            // 判断虚拟表,
            // 虚拟表需要从
            
            if (cacheAST.isVirtualTable(tableToken)) {
                let fields: any = cacheAST.getVirtualTableColumns(tableToken);
                return fields.indexOf(columnName) > -1;
            }
            return false
        }
        return true;
    }

    /**
     * 
     * 验证规则:
     * 
     * 1、验证命名空间 必须在当前打开的路径里面
     * 2、验证表名
     *  2.1、非别名表必须当前打开的schema里面 
     *  2.2、别名必须能回溯找到别面上面的定义
     *  2.3、别名不能往下面的子句去找定义
     *  2.4、别名找不到就认为该别名/表 不存在
     * 
     * 
     * 验证表
     * 
     * @param cacheAST 
     * @param errorToken 
     */
    private testingTableNamepsace(cacheAST: CacheAST, errorToken: errorToken[]) {
        //先检查是否有范围之外的表
        this.diffTableToken(cacheAST, errorToken);
        //检查namespace
        this.diffNamespace(cacheAST, errorToken);

    }

    public diffTableToken(cacheAST: CacheAST, diff: any) {
        let tablesTokens: any = cacheAST.getTables();
        let tableList: any = this.editorUtil.getTableList(true);

        tablesTokens.forEach((token: any) => {
            if (tableList.indexOf(utils.toUpper(token.text)) == -1) {

                if (!cacheAST.isVirtualTable(token)) {
                    // 去别名表找比当前
                    let trueTable: any = token.asFor || cacheAST.getAliasTable(token.stmno, utils.toUpper(token.text));

                    if (trueTable) {
                        if (!cacheAST.isVirtualTable(trueTable)) {
                            if (tableList.indexOf(utils.toUpper(trueTable.text)) == -1) {
                                diff.push({
                                    token,
                                    message: `表别名[${token.text}]引用有问题,原始表[${trueTable.text}] 不存在`
                                })
                            }
                        }
                    } else {
                        diff.push({
                            token,
                            message: `在当前打开实例中不存在表[${token.text}]`
                        })
                    }
                }
            }
        })

        return diff;
    }

    public diffNamespace(cacheAST: CacheAST, errorToken: any[]) {
        if (cacheAST.stm.namespaces) {
            let routerLast: any = this.editorUtil.workspaceState.getCurrent().getRouterLast();
            if (routerLast) {
                cacheAST.stm.namespaces.forEach((nm: any) => {
                    let namespace: string = utils.toUpper(nm.text);
                    if (!this.editorUtil.ignoreCaseContrast(routerLast.name, namespace)) {
                        errorToken.push({
                            token: nm,
                            message: `当前命名空间[${nm.text}]不合法,当前打开的命名空间为:[${routerLast.name}]`
                        })
                    }
                })
            }
        }
    }

}

